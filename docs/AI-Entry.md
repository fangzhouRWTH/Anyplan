---
anyplan.index: true
anyplan.role: task-scope
anyplan.title: AI Entry
anyplan.summary: Zero-context onboarding for AI collaborators on Anyplan. Navigate memory by type and depth; do not scan the whole repository.
---

# AI Entry

This document is the **default onboarding guide** for AI collaborators joining **Anyplan** without prior context. It explains **how to recover context**, not product implementation details.

**Owner shortcut:** “Follow `docs/AI-Entry.md`, then do the task.”

## 1. What This File Is

| Is | Is not |
| --- | --- |
| Meta navigation and read-depth rules | A second `guidance.json` |
| Path bindings for this repository | Vulkan, engine, or other domain rules |
| The first stop after owner instruction | A full architecture or research dump |

Portable specification: [framework/spec/ai-entry.md](../framework/spec/ai-entry.md).

## 2. Default Read Order

For meaningful work, read in order:

| Step | Memory type | Path |
| --- | --- | --- |
| 1 | Central contract (structured) | [instances/anyplan/guidance.json](../instances/anyplan/guidance.json) |
| 2 | AI entry | This file |
| 3 | Project state | [docs/ProjectState.md](ProjectState.md) |
| 4 | Progress dashboard (structured) | [instances/anyplan/dashboard.json](../instances/anyplan/dashboard.json) |
| 5 | Document generation contract | [framework/spec/document-generation.md](../framework/spec/document-generation.md) when editing docs, index, or engine data |
| 6 | Framework overview (portable) | [framework/README.md](../framework/README.md) when changing portable rules |
| 7 | Active task | [instances/anyplan/dashboard.json](../instances/anyplan/dashboard.json) → `currentPhase.tasks` |
| 8 | Adoption tooling | [docs/adopting-the-framework.md](adopting-the-framework.md) when helping other repos adopt Anyplan |

Skip deep framework specs until the task requires them.

## 3. Read Depth

| Memory type | Default depth | Expand when |
| --- | --- | --- |
| `guidance.json` | Full | Always for non-trivial work |
| `AI-Entry.md` | Full | First session on repo |
| `ProjectState.md` | Full | Always |
| `dashboard.json` | Structured fields in GUI or JSON skim | Phase/task status |
| `document-generation.md` | Sections needed | Scaffolding instances, doc-index, engine |
| `guidance-document.md` | On-demand | Changing guidance semantics or schema |
| ADRs | Targeted entry | Decision relevant to task |
| `docs/research/*` | On-demand | Extraction or case-study work |
| `ai-collaboration-log.md` | Latest entries | Understanding recent framework work |
| `doc-index.json` | Do not read as narrative | Regenerate via `scripts/build-doc-index.py` |

## 4. Do Not Read By Default

- Every file under `docs/research/` (unless extracting from a case study)
- All ADRs in sequence
- Full `instances/anyplan/guidance.json` document map as a reading list (use tiers above)
- `engine/` source unless changing the visual engine
- Sibling projects (e.g. Anygine) unless task is explicit extraction
- Raw JSON dumps in the visual engine reader (use structured dashboard fields)

## 5. Context Expansion Triggers

Read deep sources when the task:

- Changes `framework/schema/*` or top-level guidance fields
- Alters authority order, AI-Entry strategy, or extraction process
- Adds a new portable spec under `framework/spec/`
- Contradicts `ProjectState.md` or dashboard progress
- Requires ADR or research context for a binding choice
- Implements visual engine behavior (then read `engine/` and `document-generation.md` §6–7)

## 6. Optional Packs (Anyplan Instance)

| Pack | Enabled | Path / notes |
| --- | --- | --- |
| Prose guidance manifest | No (use `guidance.json` `documents[]` + doc-index) | — |
| Phase context prose file | No (use `dashboard.json` + `ProjectState.md`) | — |
| Active bug reports | No | Anyplan uses collaboration log; see [framework/spec/active-bug-reports.md](../framework/spec/active-bug-reports.md) for adopted **portable** rules when instantiating other projects |
| Bug archive | No | — |
| Visual dashboard | Yes | `scripts/serve.sh` → [engine/](../engine/) |

## 7. Working on Anyplan vs Other Projects

| You are editing | Start with |
| --- | --- |
| Anyplan framework/instance | This file + `guidance.json` |
| Another repo using Anyplan | Their `docs/AI-Entry.md` if present; else [adopting-the-framework.md](adopting-the-framework.md) |
| Extracting lessons from Anygine | [framework/spec/instance-extraction-feedback.md](../framework/spec/instance-extraction-feedback.md) + [docs/research/anygine-framework-extraction.md](research/anygine-framework-extraction.md) |

## 8. After Context Recovery

1. **TaskBrief** — intent, scope, acceptance, unknowns  
2. **RetrievalScope** — files read and why  
3. **Conflict check** — against `guidance.json` constraints  
4. **Workflow** — `default-collaboration-loop` in guidance instance  
5. **Record** — collaboration log; ADR if binding; dashboard + ProjectState if durable  

Validation:

```bash
scripts/validate-guidance.sh instances/anyplan/guidance.json
scripts/validate-dashboard.sh instances/anyplan/dashboard.json
python3 scripts/build-doc-index.py --project-id anyplan --repo-root .
```

## 9. Owner Invocation

No extra briefing is required for routine framework or instance work. Point the AI at this file and state the task.
