# AI Collaboration Guidance Document Specification

This document defines the recommended structure for an AI collaboration guidance document.

The specification is intended for both human readers and tool builders. It describes what should be explicit in a project instance so AI-assisted work can be consistent, auditable, and visually adjustable.

## 1. Document Identity

Every guidance document must declare:

- `schemaVersion`: the structure version.
- `project.name`: project name.
- `project.purpose`: project purpose.
- `project.documentationLanguage`: language for durable project documentation.
- `project.context`: current project context, technical boundaries, or stage.

Framework documents should not contain concrete project implementation rules. Project-level guidance may reference the framework and add project-specific constraints.

## 2. Authority Model

Every project should define how guidance conflicts are resolved.

Recommended authority order:

1. Explicit project-owner instruction for the current task.
2. Central working contract or project guidance instance.
3. Decision log or ADRs.
4. Current project state snapshot.
5. Architecture, feature, and policy documents.
6. Roadmap and task tracking documents.
7. Reference reports and evidence documents.
8. Chronological logs and broad README files.

The exact order may vary by project, but it must be explicit enough for AI collaborators to identify conflicts before executing contradictory work.

## 3. Principles

Principles provide stable judgment rules for AI and human collaborators. Each principle should include:

- `id`: stable identifier.
- `title`: short name.
- `statement`: rule to follow.
- `rationale`: why the rule matters.

Principles should help resolve uncertainty. They should not replace concrete task instructions or validation criteria.

## 4. Roles

Roles define responsibility boundaries. Each role should include:

- `id`
- `name`
- `responsibilities`
- `permissions`
- `handoffRules`

When an AI role can edit files, run commands, open pull requests, or modify guidance documents, the role must define permission boundaries and handoff rules.

## 5. Workflow

Workflows should be expressed as stages that can be visualized. Each workflow includes:

- `id`
- `name`
- `entrypoints`
- `steps`
- `exitCriteria`

Each step includes:

- `id`
- `title`
- `purpose`
- `actor`
- `inputs`
- `actions`
- `outputs`
- `checks`
- `next`

Recommended default workflow:

1. Capture intent.
2. Recover context.
3. Check guidance and conflicts.
4. Plan a scoped change.
5. Implement the smallest useful change.
6. Validate behavior and constraints.
7. Record decisions, evidence, and follow-up work.

## 6. Knowledge Separation

A guidance framework should distinguish different types of project memory:

- **Working rules**: durable project constraints and collaboration behavior.
- **Current state**: short operational snapshot for fast context recovery.
- **Decisions**: binding choices with context, rationale, and consequences.
- **Evidence**: technical analysis, reference reports, benchmarks, or comparisons.
- **Roadmap**: phases, tasks, status, blockers, and completion criteria.
- **Development log**: chronological work history and validation notes.
- **Methodology**: reusable collaboration patterns, anti-patterns, and lessons.
- **Overview documents**: human-facing navigation and project introduction.

This separation keeps retrieval efficient by giving each type of knowledge a clear source of truth.

## 7. Context Budget and Retrieval Depth

A guidance framework should not assume that every useful document belongs in every AI context window.

Project instances should separate **authority** from **retrieval depth**:

- Authority answers which source wins when guidance conflicts.
- Retrieval depth answers which sources should be loaded for a task.
- Document size is a context cost, not a measure of authority.

Recommended retrieval tiers:

- **Task scope**: the small active working contract for the current task. It names the goal, allowed scope, known assumptions, required checks, and when the AI should request or perform context expansion.
- **Phase context**: a compact summary prepared for a phase, milestone, release, or comparable work interval. It should summarize relevant lower-level documents, point back to sources, and identify stale or invalidated sections.
- **Deep source**: detailed architecture, decisions, reports, logs, module descriptions, and historical records. These are read on demand, not by default.
- **Archive**: old evidence and chronological history that should only be read when a task needs provenance, forensic debugging, or a deliberate direction change.

Project instances may also maintain a document manifest. A manifest is a routing table, not another narrative layer. It should identify:

- document id, path, title, and memory type;
- authority level and retrieval tier;
- default read behavior;
- context cost;
- source and summary relationships;
- triggers that justify reading deeper sources;
- invalidation cues when code, phase state, or decisions change.

AI collaborators should expand context deliberately. Expansion is appropriate when a task changes public contracts, dependencies, module ownership, high-risk implementation boundaries, current assumptions, or when summaries conflict with source documents or code.

The goal is not to forbid deep reading. The goal is to make deep reading intentional, explainable, and proportional.

## 8. Constraints

Constraints define boundaries that should not be broken casually. Each constraint should include:

- `id`
- `category`
- `rule`
- `severity`
- `appliesTo`
- `validation`

Recommended categories:

- `repository`: version control, file editing, and protection of existing user work.
- `quality`: tests, linting, maintainability, and architectural consistency.
- `communication`: progress updates, clarification, and final reporting.
- `safety`: permissions, sensitive data, and destructive operations.
- `documentation`: language, hierarchy, evidence, decision records, and update policy.
- `interaction`: visual editing, human confirmation, and workflow adjustment.

## 9. Boundary Rules

Projects should make ownership boundaries explicit when they affect future development.

Reusable boundary types include:

- Module or package ownership.
- Public/private API visibility.
- Dependency ownership and allowed linkage.
- Runtime versus tool-only dependencies.
- Experiment versus production boundaries.
- Application, tool, test, and core-library boundaries.
- Domain-specific implementation boundaries.

A project can instantiate this abstract rule through modules, package boundaries, API contracts, service ownership, generated-code boundaries, deployment units, or tool/runtime separation.

## 10. Custom Description Interfaces

Custom description interfaces turn human intent, AI state, tool actions, and document changes into structured objects.

Each interface should include:

- `id`
- `name`
- `purpose`
- `fields`
- `producer`
- `consumer`

Recommended base interfaces:

- `TaskBrief`: structured task intent.
- `ContextSnapshot`: project context recovered by AI.
- `GuidanceConflict`: possible conflict with durable guidance.
- `WorkflowPatch`: proposed workflow adjustment.
- `GuidanceChange`: proposed guidance-document change.
- `VerificationReport`: validation commands, results, and residual risks.
- `RetrievalScope`: current context budget, allowed document tiers, loaded sources, expansion triggers, and reasons for reading deep sources.

## 11. Visual Engine Integration

The visual engine reads a **guidance instance** plus a **project dashboard** when available. See [document-generation.md](document-generation.md) for the dashboard JSON contract and file layout.

A visual engine must at least read:

- `instances/<project-id>/guidance.json` — principles, constraints, document map, workflows
- `instances/<project-id>/dashboard.json` — overview, macro roadmap, completed tasks, current-phase tasks (recommended)
- Linked `documentPath` files declared in the dashboard or document map

The primary engine UI is organized as:

1. Project overview
2. Macro roadmap (phases and milestones)
3. Completed tasks
4. Current phase task progress

The engine may edit project instances in future versions, but it should not silently modify the portable framework body. Framework-body changes should follow `changeControl`.

## 12. Change Control

Guidance documents should distinguish three change classes:

- `instanceChange`: affects only one project.
- `frameworkChange`: affects the portable framework.
- `engineChange`: affects the visual interaction engine.

Each meaningful change should describe motivation, impact, validation, and rollback path.

## 13. Self-Governance

When a project develops the framework or its own guidance, it should record:

- Current `TaskBrief`.
- Workflow stages used.
- Guidance documents or schema changed.
- Validation performed.
- Remaining design questions.

The record should be proportional to the task. Small mechanical tasks may only need a final summary; durable changes should update the smallest authoritative document set.
