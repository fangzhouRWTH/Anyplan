# AI Entry Specification

This specification defines a portable **AI-Entry** document: a meta-strategy onboarding guide for AI collaborators with **no prior project context**.

It is not a second working contract. It does not duplicate domain rules, architecture, or task instructions. It tells an AI **which classes of project memory to load**, in **what order**, with **what depth**, and **what to skip by default**.

## 1. Purpose

| Goal | AI-Entry provides |
| --- | --- |
| Zero-context startup | A single file the project owner can reference: “Follow `docs/AI-Entry.md`.” |
| Bounded retrieval | Default narrow path before deep reading |
| Predictable behavior | Same onboarding across sessions and tools (Cursor, Codex, etc.) |
| Complement other artifacts | Works with `guidance.json`, `dashboard.json`, manifest, and `ProjectState.md` |

AI-Entry is **instance-specific only in path bindings** (where each memory type lives in this repository). Strategy and depth rules stay generic in the body or inherit from the portable framework.

## 2. Relationship to Other Documents

```text
Owner instruction (current task)
    ↓
AI-Entry.md          ← meta: how to navigate memory (this spec)
    ↓
Central contract / guidance instance
    ↓
Project state + routing manifest (if present)
    ↓
Phase context + dashboard tasks
    ↓
Deep sources on explicit triggers only
```

| Document | Role |
| --- | --- |
| `framework/spec/ai-entry.md` | Portable rules for writing AI-Entry |
| `docs/AI-Entry.md` | Instance path bindings + enabled optional packs |
| `guidance.json` | Machine-readable contract; register AI-Entry in `documents` |
| Guidance manifest (prose or `documents[]` metadata) | Detailed routing table |
| `ProjectState.md` | Short operational snapshot |
| `dashboard.json` | Structured progress for humans and GUI |

## 3. Required Sections (Instance `docs/AI-Entry.md`)

Every AI-Entry must include:

### 3.1 Purpose (generic)

One short paragraph: this file is the default onboarding path for AI with no special owner briefing.

### 3.2 Default Read Order

Numbered list of **memory types**, not domain facts. Example:

1. Central working contract (rules and authority)
2. Current project state (phase, priorities, do-not-reopen list)
3. Context routing manifest (if the project uses one)
4. Active phase context pack (if applicable)
5. Active task or dashboard current-phase tasks
6. Relevant module or package READMEs for touched code only

### 3.3 Read Depth Guide

Table:

| Memory type | Default depth | Expand when |
| --- | --- | --- |
| Central contract | Full | Always for meaningful work |
| Project state | Full | Always |
| Routing manifest | Full or skim | First session; skim later if unchanged |
| Phase context | Full for active phase | Work inside that phase |
| Decision log / ADRs | Index or on-demand | API, deps, ownership, workflow change |
| Architecture / policy | On-demand | Touching that boundary |
| Reference / evidence | On-demand | Comparing options or validating stale summary |
| Development log | Archive | Provenance or forensic debugging only |
| Collaboration log | Archive | Understanding recent AI work |

### 3.4 Do Not Read By Default

Explicit list, e.g.:

- Entire repository tree scan
- All historical logs
- Research notes unless task concerns framework extraction
- Closed bug archive unless symptoms match
- Generated or vendor directories

### 3.5 Context Expansion Triggers

Portable trigger list (from bounded retrieval methodology):

- Public API, dependency, or module ownership change
- Contradiction between state, manifest, and code
- High-risk implementation area per project contract
- Stale phase summary
- Open defect handoff index non-empty
- Owner requests deep audit

### 3.6 Optional Packs (Instance Toggles)

Checkboxes in the instance file:

| Pack | If enabled, AI should |
| --- | --- |
| Guidance manifest | Read manifest path in default order |
| Phase context | Read active phase context file before implementation |
| Active bug reports | Check open index before related code; follow sparse-create rules |
| Bug archive | Search only when symptoms resemble past defects |
| Visual dashboard | Use `dashboard.json` for progress; not a rule source |

### 3.7 Path Bindings (Instance Only)

Table mapping memory type → repository path. **No domain rules in this table.**

### 3.8 After Context Recovery

Short checklist: produce `TaskBrief`, check conflicts, state `RetrievalScope`, proceed per workflow in `guidance.json`.

## 4. What AI-Entry Must Not Contain

- Vulkan, language, or product-specific engineering rules (those belong in contract or architecture)
- Copy-pasted workflow steps (point to `AIWorkflow` or `guidance.json` workflows)
- Full decision log or roadmap content
- Replacement for `guidance.json` or central contract authority

## 5. Registration

Instance `guidance.json` → `documents` should include:

```json
{
  "id": "ai-entry",
  "title": "AI Entry",
  "path": "docs/AI-Entry.md",
  "kind": "framework",
  "scope": "project",
  "portable": false,
  "memoryType": "task-scope",
  "authority": "central-contract",
  "retrievalTier": "task-scope",
  "defaultRead": "always",
  "contextCost": "small"
}
```

Index builder should include `AI-Entry.md` via filename rule and `anyplan.index` frontmatter.

## 6. Owner Invocation

Recommended owner message for new AI sessions:

```text
Follow docs/AI-Entry.md for context recovery, then execute my request.
```

No additional project description is required unless the task is exceptional.

## 7. Versioning

AI-Entry strategy changes that affect all projects belong in this framework spec and an Anyplan ADR. Path-only changes are instance edits.
