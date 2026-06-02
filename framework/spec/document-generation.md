# Document Generation Specification

This specification defines how concrete projects produce documents and data files that the Anyplan visual engine can read structurally. It complements [guidance-document.md](guidance-document.md) (collaboration rules) and [anyplan-guidance.schema.json](../schema/anyplan-guidance.schema.json) (guidance instance contract).

Human-readable prose remains important. The engine displays **structured fields first** and loads linked Markdown or JSON source files on demand in the detail pane.

## 1. Required and Recommended Files

| File | Required | Role |
| --- | --- | --- |
| `instances/<project-id>/guidance.json` | Yes | Central working contract: principles, roles, workflows, constraints, document map |
| `instances/<project-id>/dashboard.json` | Recommended | Project overview, macro roadmap, completed tasks, current-phase task progress |
| `instances/<project-id>/doc-index.json` | Generated | Filtered markdown index for the visual engine (run `scripts/build-doc-index.py`) |
| `docs/ProjectState.md` | Recommended | Short operational snapshot; link from `dashboard.overview` or `currentPhase` |
| `docs/ai-collaboration-log.md` | Recommended | Chronological work history; link completed tasks when useful |

The visual engine loads `guidance.json` and `dashboard.json` from the same instance directory. Paths in both files are repository-relative from the repository root.

## 2. Dashboard JSON Contract

Schema: [anyplan-dashboard.schema.json](../schema/anyplan-dashboard.schema.json).

Validate with:

```bash
scripts/validate-dashboard.sh instances/<project-id>/dashboard.json
```

### 2.1 Top-Level Sections (Engine Menu)

The engine maps dashboard fields to four navigation roots:

| Engine section | Dashboard source | Purpose |
| --- | --- | --- |
| Project Overview | `overview` + `guidance.project` | Purpose, status, highlights, owners |
| Macro Roadmap | `roadmap.phases[]` | Phases and milestones; expandable |
| Completed Tasks | `completedTasks[]` | Finished work; expandable |
| Current Phase Progress | `currentPhase.tasks[]` | Active phase tasks and status |

### 2.2 Overview

```json
"overview": {
  "status": "bootstrap | active | maintenance | paused",
  "summary": "One paragraph on where the project stands.",
  "highlights": ["Bullet facts the team should see first"],
  "owners": ["optional; defaults to guidance.project.owners"],
  "documentPath": "docs/ProjectState.md",
  "documentId": "project-state"
}
```

`documentId` should match an entry in `guidance.json` → `documents` when that document exists.

### 2.3 Roadmap

```json
"roadmap": {
  "summary": "Macro direction across phases.",
  "documentPath": "docs/roadmap/RoadmapOverview.md",
  "phases": [
    {
      "id": "phase-1",
      "title": "Bootstrap framework",
      "status": "active | planned | completed",
      "summary": "What this phase delivers.",
      "milestones": [
        {
          "id": "m-schema",
          "title": "Guidance schema",
          "summary": "Machine-readable instance contract.",
          "status": "completed"
        }
      ],
      "documentPath": "optional deeper doc"
    }
  ]
}
```

Phases render as expandable tree nodes. Milestones are optional children.

### 2.4 Completed Tasks

```json
{
  "id": "task-adoption-guide",
  "title": "Adoption guide and init scripts",
  "completedAt": "2026-06-01",
  "summary": "docs/adopting-the-framework.md and scripts/init-instance.sh",
  "phaseId": "phase-1",
  "details": "Optional longer description for the detail pane.",
  "documentPath": "docs/adopting-the-framework.md",
  "documentId": "adopting-framework"
}
```

Keep `completedAt` in `YYYY-MM-DD` form. Register durable docs in the guidance document map.

### 2.5 Current Phase

```json
"currentPhase": {
  "phaseId": "phase-1",
  "title": "Bootstrap framework",
  "summary": "What the team is doing now.",
  "progressPercent": 65,
  "documentPath": "docs/ProjectState.md",
  "tasks": [
    {
      "id": "gui-dashboard",
      "title": "Dashboard-oriented visual engine",
      "status": "in-progress | todo | done | blocked",
      "summary": "Tree navigation and document reader.",
      "details": "Optional implementation notes.",
      "blockers": ["Optional list when status is blocked"],
      "documentPath": "engine/README.md"
    }
  ]
}
```

`phaseId` must reference a `roadmap.phases[].id`. Task `status` drives labels in the engine.

## 3. Linking Dashboard to Guidance

1. **`projectId`** in `dashboard.json` must equal `guidance.project.id`.
2. **`documentId`** fields should match `documents[].id` in `guidance.json` so authority and retrieval metadata stay consistent.
3. **`documentPath`** must exist in the repository (or be marked planned in `summary` until created).
4. Add a `documents[]` entry for `dashboard.json`:

```json
{
  "id": "project-dashboard",
  "title": "Project Dashboard",
  "path": "instances/my-app/dashboard.json",
  "kind": "instance",
  "scope": "project",
  "portable": false,
  "memoryType": "roadmap",
  "authority": "roadmap",
  "retrievalTier": "task-scope",
  "defaultRead": "task",
  "contextCost": "small"
}
```

## 4. Prose Document Conventions

### 4.1 ProjectState.md

Use the template from [scripts/templates/ProjectState.md](../../scripts/templates/ProjectState.md). Headings the engine can rely on when rendering fetched Markdown:

- `## Active Phase`
- `## Current Priorities`
- `## Validation (Current Phase)`
- `## Next Actions`

The engine does **not** parse Markdown into dashboard tasks automatically. Update `dashboard.json` when phase or task status changes; keep `ProjectState.md` aligned for humans and AI.

### 4.2 Roadmap Markdown (Optional)

If `roadmap.documentPath` points to a Markdown file, use phase headings:

```markdown
## Phase 1 — Bootstrap (active)

Summary paragraph.

### Milestones

- Schema and spec
- Visual engine MVP
```

Structured truth remains in `dashboard.json`; prose is supplementary.

### 4.3 Collaboration Log

Completed tasks may reference log entries in `details` or `documentPath`. Do not duplicate the full log inside `completedTasks` unless summarizing one entry.

## 5. Generation Workflow

### 5.1 Scaffold (CLI)

```bash
scripts/init-instance.sh --project-id my-app ... --with-docs --with-dashboard
scripts/validate-guidance.sh instances/my-app/guidance.json
scripts/validate-dashboard.sh instances/my-app/dashboard.json
```

### 5.2 AI-Assisted (Cursor / Codex)

After `guidance.json` exists, ask the agent to:

1. Read existing README, ADRs, roadmap, and `ProjectState.md`.
2. Produce or update `instances/<id>/dashboard.json` per this spec.
3. Register new paths in `guidance.json` → `documents`.
4. Run both validation scripts.

Prompt reference: extend [scripts/prompts/instantiate-from-existing-docs.md](../../scripts/prompts/instantiate-from-existing-docs.md) with dashboard deliverables.

### 5.3 Manual Maintenance Rule

When task status or phase changes:

1. Update `dashboard.json` (engine menu and progress).
2. Update `docs/ProjectState.md` if operational context changed.
3. Append `docs/ai-collaboration-log.md` for durable AI-assisted work.
4. Add an ADR only for binding decisions.

## 6. Document Index (Generated)

Schema: [anyplan-doc-index.schema.json](../schema/anyplan-doc-index.schema.json).

The index lists **only** Markdown files that belong in the dashboard reader. The engine does not crawl the whole repository at runtime.

### 6.1 Build

```bash
python3 scripts/build-doc-index.py --project-id my-app --repo-root .
scripts/validate-doc-index.sh instances/my-app/doc-index.json
```

Recommended before starting the server:

```bash
scripts/serve.sh my-app 5173
```

`serve.sh` runs the index builder, starts `python3 -m http.server`, and opens the engine URL in your default browser (`--no-browser` to skip).

### 6.2 Inclusion Rules (any rule is enough)

| Rule | Example |
| --- | --- |
| YAML frontmatter | `anyplan.index: true` and optional `anyplan.role: state` |
| HTML comment (first 40 lines) | `<!-- anyplan-index: roadmap -->` |
| Filename | `AI-Entry.md`, `ProjectState.md`, `WorkingContract.md`, `ai-collaboration-log.md`, `*Roadmap*` |
| Path | `docs/adr/`, `docs/research/`, `docs/roadmap/` |
| Guidance map | `guidance.json` → `documents[].path` ending in `.md` |
| Dashboard link | any `documentPath` ending in `.md` inside `dashboard.json` |

Excluded directories include `.git`, `node_modules`, `scripts/templates/`, and the whole `scripts/` tree (tooling, not project memory).

Root `README.md` is indexed when present; other `README.md` files are not indexed by filename alone.

### 6.3 Optional Frontmatter

```yaml
---
anyplan.index: true
anyplan.role: state
anyplan.title: Project State
anyplan.summary: One-line summary for the engine.
---
```

Valid `anyplan.role` / comment categories: `overview`, `state`, `roadmap`, `decision`, `evidence`, `log`, `methodology`, `rule`, `task-scope`, `other`.

### 6.4 Linking JSON and Non-Markdown Files

Do not point `dashboard.json` `documentPath` at `.json` files if you want prose in the reader. Use:

- structured fields in `dashboard.json` for tasks and progress;
- `guidance.json` / `dashboard.json` for machine-readable contracts;
- indexed `.md` files for human-readable depth.

The engine shows JSON paths as “structured data” without dumping raw JSON.

## 7. Visual Engine Behavior

The engine ([engine/](../../engine/)):

- Loads `guidance.json`, `dashboard.json`, and `doc-index.json` for the selected instance.
- Builds the four-root tree from **dashboard** data only (not from a file tree).
- Shows structured summaries first; loads full Markdown only when the user clicks **Show markdown**.
- Reads Markdown only if the path appears in `doc-index.json`.
- Falls back when `doc-index.json` is missing (warning in status bar; no repository-wide file listing).

Query parameter: `?instance=anyplan` (default).

## 8. Versioning

- `dashboard.schemaVersion` follows `0.MINOR.PATCH` during early adoption.
- Breaking dashboard schema changes require a minor bump and updates to `scripts/templates/dashboard.minimal.json`.
- Keep `guidance.schemaVersion` independent from dashboard schema version.

## 9. Checklist Before Shipping an Instance

- [ ] `projectId` matches guidance instance
- [ ] All four dashboard sections populated meaningfully
- [ ] `currentPhase.phaseId` exists in `roadmap.phases`
- [ ] Linked `documentPath` values resolve in the repo (prefer `.md` for reader links)
- [ ] `guidance.json` document map includes dashboard and linked docs
- [ ] `doc-index.json` rebuilt and validates
- [ ] Guidance, dashboard, and doc-index validation scripts pass
