# ADR 0002: English Documentation and Anygine-Derived Framework

## Status

Accepted

## Context

The project owner requested two durable changes:

- Project documentation should be written in English.
- Anyplan should study the sibling Anygine project and abstract its project documentation and development rules into a more general AI collaboration guidance framework.

Anygine already contains a mature documentation structure for AI-assisted development, including a working contract, current state snapshot, AI workflow, AI collaboration methodology, decision log, roadmap, architecture documents, dependency policy, public/private API policy, and reference report guidelines.

## Decision

Anyplan adopts English as the durable project documentation language.

Anyplan also treats Anygine as the first concrete source model for framework extraction. The framework should reuse Anygine's abstract collaboration and governance patterns without copying Anygine's graphics-engine-specific implementation choices into the portable framework body.

The extracted portable patterns include:

- Central working contract.
- Short current-state snapshot.
- Separation of rules, decisions, evidence, roadmap state, logs, and methodology.
- Vertical-slice development.
- Explicit ownership and boundary rules.
- Dependency ownership.
- Evidence-before-decision workflow.
- Active AI consistency checks.
- Candid AI technical critique.
- Human-reproducible validation.
- Proportional documentation updates.

## Consequences

Benefits:

- Anyplan's records are searchable and consistent.
- The framework is grounded in a real project rather than only abstract speculation.
- Anygine can later instantiate Anyplan by mapping its existing documents and rules into the guidance schema.
- Non-graphics projects can still use the framework because domain-specific rules remain in project instances.

Costs:

- Existing Anyplan documents and guidance strings must be translated to English.
- The schema must track documentation language.
- Future framework changes must keep the Anygine-derived rules abstract enough for other project domains.
