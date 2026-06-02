#!/usr/bin/env python3
"""
Build instances/<project-id>/doc-index.json by scanning repository Markdown files.

Includes a file when any inclusion rule matches (see framework/spec/document-generation.md).
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

SCHEMA_VERSION = "0.1.0"

SKIP_DIRS = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "dist",
    "build",
    "out",
    "target",
    "__pycache__",
    ".cache",
    "coverage",
}

SKIP_PATH_PREFIXES = (
    "scripts/",
)

FILENAME_RULES: list[tuple[re.Pattern[str], str, str]] = [
    (re.compile(r"ProjectState\.md$", re.I), "state", "filename:ProjectState.md"),
    (re.compile(r"WorkingContract\.md$", re.I), "rule", "filename:WorkingContract.md"),
    (re.compile(r"ai-collaboration-log\.md$", re.I), "log", "filename:ai-collaboration-log.md"),
    (re.compile(r"AI-Entry\.md$", re.I), "task-scope", "filename:AI-Entry.md"),
    (re.compile(r"Roadmap", re.I), "roadmap", "filename:Roadmap"),
]

ROOT_README = "README.md"

PATH_RULES: list[tuple[re.Pattern[str], str, str]] = [
    (re.compile(r"^docs/adr/", re.I), "decision", "path:docs/adr/"),
    (re.compile(r"^docs/research/", re.I), "evidence", "path:docs/research/"),
    (re.compile(r"^docs/roadmap/", re.I), "roadmap", "path:docs/roadmap/"),
]

FRONTMATTER_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
INDEX_COMMENT_RE = re.compile(r"<!--\s*anyplan-index:\s*([a-z-]+)\s*-->", re.I)
HEADING_RE = re.compile(r"^(#{1,3})\s+(.+?)\s*$")
VALID_CATEGORIES = {
    "overview",
    "state",
    "roadmap",
    "decision",
    "evidence",
    "log",
    "methodology",
    "rule",
    "task-scope",
    "other",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build Anyplan doc-index.json for the visual engine.")
    parser.add_argument("--project-id", required=True, help="Project id (instances/<id>/)")
    parser.add_argument("--repo-root", default=".", help="Repository root")
    parser.add_argument("--output", help="Output path (default: instances/<id>/doc-index.json)")
    parser.add_argument("--quiet", action="store_true")
    return parser.parse_args()


def load_json(path: Path) -> dict | None:
    if not path.is_file():
        return None
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def slug_id(path: str) -> str:
    base = path.replace("/", "-").replace("\\", "-").lower()
    base = re.sub(r"\.md$", "", base, flags=re.I)
    base = re.sub(r"[^a-z0-9-]+", "-", base)
    base = re.sub(r"-+", "-", base).strip("-")
    return base[:80] or "doc"


def parse_frontmatter(text: str) -> tuple[dict, str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    body = text[match.end() :]
    meta: dict = {}
    for line in match.group(1).splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip().lower()] = value.strip().strip('"').strip("'")
    return meta, body


def first_summary(body: str, title: str) -> str:
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("<!--"):
            continue
        if stripped.startswith("|"):
            continue
        text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", stripped)
        text = re.sub(r"[*_`]", "", text)
        if len(text) > 240:
            return text[:237] + "..."
        return text
    return title


def extract_sections(body: str, max_sections: int = 12) -> list[dict]:
    sections = []
    for i, line in enumerate(body.splitlines(), start=1):
        match = HEADING_RE.match(line)
        if not match:
            continue
        level = len(match.group(1))
        sections.append({"level": level, "title": match.group(2).strip(), "line": i})
        if len(sections) >= max_sections:
            break
    return sections


def extract_title(body: str, path: str) -> str:
    for line in body.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return Path(path).stem.replace("-", " ").title()


def category_from_meta(meta: dict, comment: str | None) -> str | None:
    if meta.get("anyplan.index", "").lower() in ("true", "yes", "1"):
        role = meta.get("anyplan.role") or meta.get("anyplan.category") or "other"
        return role if role in VALID_CATEGORIES else "other"
    if comment and comment in VALID_CATEGORIES:
        return comment
    return None


def category_from_path(path: str) -> tuple[str, str] | None:
    norm = path.replace("\\", "/")
    for pattern, category, reason in PATH_RULES:
        if pattern.search(norm):
            return category, reason
    name = Path(norm).name
    for pattern, category, reason in FILENAME_RULES:
        if pattern.search(name) or pattern.search(norm):
            return category, reason
    return None


def should_skip(rel: str) -> bool:
    norm = rel.replace("\\", "/")
    for prefix in SKIP_PATH_PREFIXES:
        if norm.startswith(prefix):
            return True
    return False


def collect_markdown_paths(repo_root: Path) -> list[Path]:
    paths: list[Path] = []
    for path in repo_root.rglob("*.md"):
        rel = path.relative_to(repo_root).as_posix()
        if should_skip(rel):
            continue
        parts = path.relative_to(repo_root).parts
        if any(part in SKIP_DIRS for part in parts):
            continue
        paths.append(path)
    return sorted(paths)


def linked_paths_from_guidance(guidance: dict) -> dict[str, str]:
    out: dict[str, str] = {}
    for doc in guidance.get("documents") or []:
        p = doc.get("path", "")
        if p.lower().endswith(".md"):
            out[p.replace("\\", "/")] = f"guidance:{doc.get('id', '')}"
    return out


def linked_paths_from_dashboard(dashboard: dict) -> dict[str, str]:
    out: dict[str, str] = {}

    def add(p: str | None, label: str) -> None:
        if p and p.lower().endswith(".md"):
            norm = p.replace("\\", "/")
            out.setdefault(norm, label)

    ov = dashboard.get("overview") or {}
    add(ov.get("documentPath"), "dashboard.overview")
    rm = dashboard.get("roadmap") or {}
    add(rm.get("documentPath"), "dashboard.roadmap")
    cp = dashboard.get("currentPhase") or {}
    add(cp.get("documentPath"), "dashboard.currentPhase")
    for phase in rm.get("phases") or []:
        add(phase.get("documentPath"), f"dashboard.phase:{phase.get('id', '')}")
    for task in dashboard.get("completedTasks") or []:
        add(task.get("documentPath"), f"dashboard.completed:{task.get('id', '')}")
    for task in cp.get("tasks") or []:
        add(task.get("documentPath"), f"dashboard.task:{task.get('id', '')}")
    return out


def build_entry(
    rel: str,
    text: str,
    category: str,
    reason: str,
    linked_from: list[str],
    document_id: str | None = None,
    memory_type: str | None = None,
) -> dict:
    meta, body = parse_frontmatter(text)
    comment_match = INDEX_COMMENT_RE.search(text)
    comment_cat = comment_match.group(1).lower() if comment_match else None
    if meta_cat := category_from_meta(meta, comment_cat):
        category = meta_cat
        reason = "frontmatter:anyplan.index" if "frontmatter" not in reason else reason

    title = meta.get("title") or meta.get("anyplan.title") or extract_title(body, rel)
    summary = meta.get("summary") or meta.get("anyplan.summary") or first_summary(body, title)
    entry_id = meta.get("anyplan.id") or slug_id(rel)
    if document_id:
        entry_id = document_id

    entry: dict = {
        "id": entry_id,
        "path": rel,
        "title": title,
        "category": category if category in VALID_CATEGORIES else "other",
        "contentType": "markdown",
        "summary": summary,
        "inclusionReason": reason,
        "sections": extract_sections(body),
        "linkedFrom": sorted(set(linked_from)),
    }
    if memory_type:
        entry["memoryType"] = memory_type
    if document_id:
        entry["documentId"] = document_id
    return entry


def main() -> int:
    args = parse_args()
    repo_root = Path(args.repo_root).resolve()
    instance_dir = repo_root / "instances" / args.project_id
    output = Path(args.output) if args.output else instance_dir / "doc-index.json"

    guidance = load_json(instance_dir / "guidance.json")
    dashboard = load_json(instance_dir / "dashboard.json")
    if not guidance:
        print(f"Error: missing {instance_dir / 'guidance.json'}", file=sys.stderr)
        return 1

    project_id = guidance.get("project", {}).get("id", args.project_id)
    guidance_links = linked_paths_from_guidance(guidance)
    dashboard_links = linked_paths_from_dashboard(dashboard) if dashboard else {}

    doc_meta_by_path: dict[str, dict] = {}
    for doc in guidance.get("documents") or []:
        p = doc.get("path", "").replace("\\", "/")
        if p.lower().endswith(".md"):
            doc_meta_by_path[p] = doc

    included: dict[str, dict] = {}

    for path in collect_markdown_paths(repo_root):
        rel = path.relative_to(repo_root).as_posix()
        text = path.read_text(encoding="utf-8", errors="replace")
        meta, body = parse_frontmatter(text)
        comment_match = INDEX_COMMENT_RE.search(text)
        comment_cat = comment_match.group(1).lower() if comment_match else None

        reasons: list[str] = []
        linked: list[str] = []
        category: str | None = None

        if rel in guidance_links:
            reasons.append(guidance_links[rel])
            linked.append(guidance_links[rel])
            category = category or "rule"
        if rel in dashboard_links:
            reasons.append(dashboard_links[rel])
            linked.append(dashboard_links[rel])

        if meta.get("anyplan.index", "").lower() in ("true", "yes", "1"):
            reasons.append("frontmatter:anyplan.index")
        if comment_cat:
            reasons.append(f"comment:anyplan-index:{comment_cat}")
            category = category or comment_cat

        path_rule = category_from_path(rel)
        if path_rule:
            cat, r = path_rule
            reasons.append(r)
            category = category or cat

        if rel == ROOT_README:
            reasons.append("filename:README.md (repository root)")
            category = category or "overview"

        if not reasons:
            continue

        doc = doc_meta_by_path.get(rel)
        memory_type = doc.get("memoryType") if doc else None
        document_id = doc.get("id") if doc else None
        entry = build_entry(
            rel,
            text,
            category or "other",
            "; ".join(sorted(set(reasons))),
            linked,
            document_id=document_id,
            memory_type=memory_type,
        )
        included[rel] = entry

    # Ensure guidance/dashboard linked md exist even if scan missed (should not happen)
    for rel, label in {**guidance_links, **dashboard_links}.items():
        if rel in included:
            if label not in included[rel]["linkedFrom"]:
                included[rel]["linkedFrom"].append(label)
            continue
        full = repo_root / rel
        if not full.is_file():
            continue
        text = full.read_text(encoding="utf-8", errors="replace")
        doc = doc_meta_by_path.get(rel)
        included[rel] = build_entry(
            rel,
            text,
            category_from_path(rel)[0] if category_from_path(rel) else "other",
            label,
            [label],
            document_id=doc.get("id") if doc else None,
            memory_type=doc.get("memoryType") if doc else None,
        )

    entries = sorted(included.values(), key=lambda e: (e["category"], e["path"]))
    index = {
        "schemaVersion": SCHEMA_VERSION,
        "projectId": project_id,
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "entryCount": len(entries),
        "entries": entries,
    }

    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
        f.write("\n")

    if not args.quiet:
        print(f"Wrote {output} ({len(entries)} markdown entries)")
        by_cat: dict[str, int] = {}
        for e in entries:
            by_cat[e["category"]] = by_cat.get(e["category"], 0) + 1
        for cat, count in sorted(by_cat.items()):
            print(f"  {cat}: {count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
