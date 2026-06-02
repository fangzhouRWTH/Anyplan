---
anyplan.index: true
anyplan.role: task-scope
anyplan.title: AI Entry
anyplan.summary: Zero-context onboarding path for AI collaborators. Read this file first when the owner does not provide extra briefing.
---

# AI Entry

This document is the **default onboarding guide** for AI collaborators joining this project **without prior context**. It describes **how to navigate project memory**, not domain engineering rules.

**Owner shortcut:** “Follow `docs/AI-Entry.md`, then do the task.”

## 1. What This File Is

- A **meta-strategy** map: what to read, how deeply, and what to skip
- **Not** a replacement for the central working contract or `instances/{{PROJECT_ID}}/guidance.json`
- **Not** a full architecture or roadmap dump

Portable rules: [framework/spec/ai-entry.md](../../framework/spec/ai-entry.md) (Anyplan framework repo).

## 2. Default Read Order

Read in this order for **meaningful work** unless the owner narrows scope:

| Step | Memory type | Path |
| --- | --- | --- |
| 1 | Central contract | `instances/{{PROJECT_ID}}/guidance.json` (structured) + linked contract prose if present |
| 2 | AI entry | This file (you are here) |
| 3 | Project state | `docs/ProjectState.md` |
| 4 | Routing manifest | _If enabled below_ |
| 5 | Phase context | _If enabled below_ |
| 6 | Progress dashboard | `instances/{{PROJECT_ID}}/dashboard.json` (structured overview) |
| 7 | Active task focus | Current phase in dashboard or roadmap task detail |
| 8 | Module READMEs | Only for code areas you will touch |

## 3. Read Depth

| Memory type | Depth | Expand when |
| --- | --- | --- |
| Central contract / guidance instance | Full | Always |
| Project state | Full | Always |
| Dashboard | Skim structured fields | Need task/phase status |
| Routing manifest | Full once, then skim | Manifest or state changed |
| Phase context | Full for active phase | Work inside that phase |
| ADRs / decision log | On-demand | Binding choice, API, deps, workflow |
| Architecture / policy | On-demand | Touching that boundary |
| Research / evidence | On-demand | Extraction, comparison, stale summary |
| Collaboration log | Archive | Recent AI work history only |
| Development log | Archive | Provenance / forensic debugging |

## 4. Do Not Read By Default

- Full repository tree listing
- All of `docs/research/` unless task concerns framework extraction
- All ADRs sequentially
- Generated `doc-index.json` as prose (use dashboard + this file instead)
- `framework/` portable specs unless changing the Anyplan framework itself
- Vendor, build output, or tool-only directories

## 5. Context Expansion Triggers

Read deep sources when the task:

- Changes public API, dependencies, or module ownership
- Contradicts project state, manifest, or code
- Touches high-risk areas named in the central contract
- Needs historical rationale for a decision
- Finds stale or duplicated summaries
- Resumes work on an **open defect** listed in active bug reports (if enabled)
- Owner explicitly requests audit or full doc review

## 6. Optional Packs (This Instance)

| Pack | Enabled | Path |
| --- | --- | --- |
| Guidance manifest (prose router) | No / Yes | _e.g. `docs/GuidanceManifest.md`_ |
| Phase context | No / Yes | _e.g. `docs/roadmap/PhaseContext.md`_ |
| Active bug reports | No / Yes | _e.g. `docs/active-bug-reports/README.md`_ |
| Bug archive | No / Yes | _e.g. `docs/bug-report-archive/README.md`_ |

## 7. After Context Recovery

Before implementation:

1. Produce a **TaskBrief** (intent, scope, acceptance, unknowns)
2. Record **RetrievalScope** (what you read and why)
3. Check **constraints** in `guidance.json` for conflicts
4. Follow the active **workflow** in the guidance instance
5. Update **dashboard.json**, **ProjectState.md**, and collaboration log when impact is durable

## 8. Validation

Run project validation commands from `docs/ProjectState.md` after structural doc or guidance changes.
