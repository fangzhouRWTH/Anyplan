# ADR 0004: AI Entry, Instance Extraction Feedback, and Defect Handoff Docs

## Status

Accepted

## Context

Anygine matured its documentation architecture through 2026-05-31 to 2026-06-02:

- Bounded context retrieval (`GuidanceManifest`, phase context packs)
- Proportional documentation updates
- **ActiveBugReports** / **BugReportArchive** for sparse debug handoff (not a general issue tracker)
- Functional AI onboarding via **ProjectState + manifest**, but no single owner-facing “start here for AI” file

Anyplan already extracted many patterns ([ADR 0002](0002-english-docs-and-research-extraction.md), [ADR 0003](0003-bounded-context-retrieval.md)). Gaps remained:

- No portable **AI-Entry** meta-onboarding specification
- No formal **instance → framework** extraction process
- No portable **active bug report** rules in the framework body

Projects will frequently instantiate Anyplan and later feed experience back. That loop must be documented and repeatable.

## Decision

### 1. AI-Entry (portable + instance)

- Add [framework/spec/ai-entry.md](../framework/spec/ai-entry.md) defining meta-strategy onboarding (read order, depth, skips, expansion triggers).
- Each serious instance maintains `docs/AI-Entry.md` with **path bindings only**, not domain rules.
- Register AI-Entry in `guidance.json` → `documents` with `defaultRead: always` and task-scope tier.
- Default owner invocation: “Follow `docs/AI-Entry.md`.”

### 2. Instance extraction feedback process

- Add [framework/spec/instance-extraction-feedback.md](../framework/spec/instance-extraction-feedback.md).
- Research notes stay under `docs/research/`; portable rules are restated in `framework/spec/`.
- Use [scripts/prompts/extract-instance-feedback.md](../../scripts/prompts/extract-instance-feedback.md) for AI-assisted extraction.
- Quality gate before merging into framework (no domain leakage).

### 3. Active defect handoff (from Anygine debug-doc practice)

- Add [framework/spec/active-bug-reports.md](../framework/spec/active-bug-reports.md) as portable policy.
- Instances opt in via AI-Entry optional packs and directory layout; Anyplan itself does not require active bug files.
- Anygine keeps `Doc/ActiveBugReports/` as the reference instance implementation.

### 4. Anygine backport

- Add `Doc/AI-Entry.md` in Anygine pointing to the same memory-type strategy with Anygine path bindings.
- Update `Doc/GuidanceManifest.md` default startup path to list AI-Entry after WorkingContract.

## Consequences

Benefits:

- Zero-context AI sessions have one stable entry without custom owner essays.
- Extraction from Anygine (and future projects) follows a checklist instead of ad hoc copying.
- Debug handoff discipline is portable without forcing every small project to create bug files.

Costs:

- Another document to keep aligned with manifest and ProjectState.
- Instances must maintain AI-Entry path table when docs move.
- Risk of AI-Entry growing into a second contract if not guarded (spec §4 limits content).

## Follow-up

- Consider Decision Log entry in Anygine for ActiveBugReports policy (Anygine instance only).
- Visual engine may surface AI-Entry in dashboard overview when registered in `documents`.
