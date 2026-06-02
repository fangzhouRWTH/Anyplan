# Active Bug Reports Specification

Portable specification for **defect handoff documentation** (debug context packs). Distilled from mature instance practice; not a general issue tracker.

## 1. Purpose

Support safe interruption when:

- Debugging spans multiple AI sessions or machines
- Owner intervention is required
- Work pauses mid-investigation

This is **not** for every bug. Default: fix small defects silently, validate, continue.

## 2. Directory Layout (Recommended)

```text
docs/active-bug-reports/
  README.md       # Policy, lifecycle, index of open reports
  _Template.md    # Copy for new reports
  YYYY-MM-DD-ShortSlug.md

docs/bug-report-archive/
  README.md       # Archive index (sparse)
```

Paths may vary by instance; register in `guidance.json` → `documents` and AI-Entry path bindings.

## 3. When to Create a Report

Create when **any** applies:

1. Multiple serious attempts failed and **owner debug help** is needed
2. Owner **explicitly** requests a recorded handoff
3. (After fix, rare) Direct archive when defect and fix have unusual long-term reference value

Do **not** create for: typos, first-attempt fixes, obvious compile errors, routine refactors.

## 4. Report Contents

Required sections (see instance template):

- Metadata (status, severity, area, last updated)
- Problem, reproduction, environment
- AI analysis (hypotheses, ruled out)
- Suggested approaches
- Changes already made (verified vs speculative)
- Follow-up observations (per session)
- Resolution (required before archive)
- Closure criteria, related code/tests

## 5. Lifecycle

1. **Open** — only while investigation active
2. **Update** — append per session
3. **Close** — owner confirms fix or `WontFix`
4. **Archive** — move to bug-report-archive; update indexes; trim ProjectState if listed

Closed reports must **not** remain in the active directory.

## 6. Retrieval Tier

| Artifact | Tier | Read when |
| --- | --- | --- |
| Active reports README + open index | Phase context / on-demand | Open index non-empty; resuming related module |
| Individual open report | On-demand | Listed for current defect |
| Archive | Archive | Similar symptoms; regression suspicion |

## 7. Authority

- Active reports are **operational handoff**, not binding architecture decisions
- Binding choices go to decision log / ADR
- Evidence-heavy analysis goes to reference reports

## 8. AI Rules (Portable)

- Read open index before changing code in listed areas
- Do not create reports for completeness
- File is the handoff artifact; do not rely on chat-only memory
- Search archive before investigating from zero when symptoms match known classes

## 9. Guidance and Manifest Integration

Register paths in:

- `guidance.json` → `documents`
- AI-Entry optional pack: Active bug reports enabled
- Routing manifest row with expansion trigger: “open defect in index”

## 10. Framework vs Instance

| Portable (this spec) | Instance |
| --- | --- |
| Thresholds, lifecycle, tiers | Actual paths, open index rows |
| Template section list | Filled reports |
| Sparse archive discipline | Archived filenames |
