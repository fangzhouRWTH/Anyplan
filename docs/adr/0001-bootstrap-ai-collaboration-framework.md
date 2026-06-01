# ADR 0001: Bootstrap AI Collaboration Framework

## Status

Accepted

## Context

Anyplan has three linked goals:

- Define an AI collaboration guidance framework that is independent of any single concrete project.
- Build a visual interaction engine that can connect to instantiated project guidance documents.
- Develop the framework through its own guidance workflow.

The repository initially had no project files, build system, or existing technology stack.

## Decision

The first version uses a minimal closed loop made of documents, JSON Schema, project instance JSON, and a static web engine:

- `framework/` stores portable framework documents and specifications.
- `instances/anyplan/guidance.json` stores Anyplan's project instance.
- `engine/` stores a no-build visual interaction engine MVP.
- `docs/ai-collaboration-log.md` records self-governance.

## Consequences

Benefits:

- The core concepts can be read, edited, and validated immediately.
- The visual engine is not tied to an early frontend framework decision.
- The boundary between framework body and project instance is visible.

Costs:

- The static engine does not yet write changes back to disk.
- Rich editing workflows will need a stronger frontend architecture later.
- Schema validation currently depends on external tooling or future scripts.
