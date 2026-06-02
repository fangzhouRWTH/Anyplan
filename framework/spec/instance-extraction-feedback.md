# Instance Extraction Feedback Process

This document defines how **concrete project instances** (for example Anygine) feed lessons back into the **portable Anyplan framework** without polluting the framework with domain-specific rules.

Use this process whenever an instantiated project has stabilized patterns worth reusing.

## 1. When to Run Extraction

| Signal | Action |
| --- | --- |
| New documentation type works well in production (e.g. ActiveBugReports) | Extract portable spec |
| AI onboarding improved via manifest + AI-Entry | Update `ai-entry.md` and templates |
| Repeated AI mistakes across sessions | Add principle or constraint to framework spec |
| Instance-only rule | Keep in instance; do **not** extract |
| One-off experiment | Research note only |

**Frequency:** After major phase completion, or when documentation architecture changes—not after every small task.

## 2. Roles

| Role | Responsibility |
| --- | --- |
| Human owner | Approves what becomes portable; rejects domain leakage |
| AI collaborator | Produces extraction research draft |
| Framework maintainer | Restates rules in project-independent language; updates schema/spec |

## 3. Process Steps

```text
1. Capture (instance)
   └─ Note what changed, why it helped, evidence (paths, dates)

2. Classify
   └─ Portable pattern vs instance-only vs research

3. Draft research note (optional)
   └─ docs/research/<project>-<topic>-extraction.md

4. Restate in framework/
   └─ spec/*.md, templates/, schema if needed

5. Record decision
   └─ Anyplan ADR when direction or authority changes

6. Update Anyplan instance
   └─ guidance.json, dashboard, AI-Entry, doc-index

7. Backport to source instance (if different repo)
   └─ AI-Entry, manifest rows, templates—without copying framework files

8. Validate
   └─ validate-guidance, validate-dashboard, build-doc-index

9. Log
   └─ docs/ai-collaboration-log.md entry
```

## 4. Extraction Research Note Template

Path: `docs/research/<source-project>-<topic>-extraction.md`

Sections:

1. **Source** — repository, documents reviewed, date range
2. **Problem** — what friction existed
3. **Instance solution** — what the project did (may cite paths)
4. **Abstract rule** — project-independent statement
5. **Generic application** — how any project instantiates
6. **Not portable** — explicit domain rules to exclude
7. **Recommended framework changes** — checklist for maintainer

Existing example: [anygine-framework-extraction.md](../../docs/research/anygine-framework-extraction.md).

## 5. Quality Gate (Framework Merge Checklist)

Before merging into `framework/`:

- [ ] Rule is stated without product, language, or vendor names unless unavoidable
- [ ] A second project could instantiate without copying the source repo
- [ ] Instance research note remains under `docs/research/` (not framework body)
- [ ] ADR or spec version note when behavior changes
- [ ] Anyplan `guidance.json` and templates updated
- [ ] `document-generation.md` and `ai-entry.md` mention new artifact types if added
- [ ] Source instance received backport items (AI-Entry, manifest) where applicable

## 6. AI-Assisted Extraction Prompt

Use [scripts/prompts/extract-instance-feedback.md](../../scripts/prompts/extract-instance-feedback.md) with:

- Source instance repo path
- Anyplan framework path
- Topic (e.g. “active bug reports”, “AI-Entry onboarding”)

The agent outputs: research note draft, proposed framework spec diff list, ADR outline, backport checklist for source instance.

## 7. Anti-Patterns

| Anti-pattern | Why harmful |
| --- | --- |
| Copy Vulkan/CMake rules into `framework/` | Breaks portability |
| Skip ADR for authority changes | Future instances inherit unclear precedence |
| Only update research note, never spec | Framework drifts from practice |
| Extract every instance README | Noise; use manifest routing instead |
| Replace AI-Entry with full contract text | Defeats bounded retrieval |

## 8. Deliverables per Extraction Cycle

| Artifact | Location |
| --- | --- |
| Research note | `docs/research/` |
| Portable spec | `framework/spec/` |
| Template | `framework/templates/` or `scripts/templates/` |
| ADR | `docs/adr/` |
| Anyplan instance sync | `instances/anyplan/`, `docs/AI-Entry.md` |
| Source instance backport | Source repo `docs/` (e.g. Anygine) |

## 9. Relation to Visual Engine

After extraction, update:

- `dashboard.json` completed tasks and current phase
- `build-doc-index.py` inclusion rules if new filenames or paths
- `guidance.json` document map

The engine reflects instance state; the framework defines the contract.
