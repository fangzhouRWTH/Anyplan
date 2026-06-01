<!-- anyplan-index: state -->
# Project State

Short operational snapshot for AI context recovery. Structured dashboard data lives in `instances/anyplan/dashboard.json`.

## Active Phase

- **Phase name**: Bootstrap framework and engine (`phase-1-bootstrap`)
- **Goal**: Portable guidance contract, adoption tooling, dashboard-oriented visual engine
- **Status**: Active (~72% per dashboard estimate)

## Current Priorities

1. Document generation spec and dashboard schema validation
2. Visual engine: overview / roadmap / completed / current-phase tree UI
3. Keep guidance instance and dashboard.json in sync

## Do Not Reopen Casually

- English as durable documentation language (ADR 0002)
- Framework body independent of concrete project case studies
- Structured-before-visual: engine reads JSON contracts first

## Open Questions

- When to support engine write-back vs export-only workflow
- Whether roadmap prose files are required or dashboard-only is enough for small projects

## Validation (Current Phase)

```bash
scripts/validate-guidance.sh instances/anyplan/guidance.json
scripts/validate-dashboard.sh instances/anyplan/dashboard.json
python3 -m http.server 5173
# http://localhost:5173/engine/?instance=anyplan
```

## Risks

- Dashboard and ProjectState drift if only one is updated after task changes
- Large guidance.json document maps need retrieval metadata discipline

## Next Actions

- Land dashboard validation in scripts and adoption guide
- Add ProjectState to init-instance `--with-docs` by default for new projects

## Document Routing

| Need | Read first |
| --- | --- |
| Central rules | `instances/anyplan/guidance.json` |
| Overview / roadmap / tasks | `instances/anyplan/dashboard.json` |
| Fast state | This file |
| Binding decisions | `docs/adr/` |
| Work history | `docs/ai-collaboration-log.md` |

Last updated: 2026-06-01
