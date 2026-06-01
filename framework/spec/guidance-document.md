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

This separation is derived from Anygine's documentation structure, but it is domain-independent.

## 7. Constraints

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

## 8. Boundary Rules

Projects should make ownership boundaries explicit when they affect future development.

Reusable boundary types include:

- Module or package ownership.
- Public/private API visibility.
- Dependency ownership and allowed linkage.
- Runtime versus tool-only dependencies.
- Experiment versus production boundaries.
- Application, tool, test, and core-library boundaries.
- Domain-specific implementation boundaries.

Anygine's concrete examples include CMake targets, public/private headers, Vulkan backend visibility, and Conan-owned dependencies. A non-graphics project can instantiate the same abstract rule with its own modules, package boundaries, API contracts, or service ownership model.

## 9. Custom Description Interfaces

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

## 10. Visual Engine Integration

A visual engine must at least read:

- `documents`
- `workflows`
- `constraints`
- `interfaces`

The engine may edit project instances, but it should not silently modify the portable framework body. Framework-body changes should follow `changeControl`.

## 11. Change Control

Guidance documents should distinguish three change classes:

- `instanceChange`: affects only one project.
- `frameworkChange`: affects the portable framework.
- `engineChange`: affects the visual interaction engine.

Each meaningful change should describe motivation, impact, validation, and rollback path.

## 12. Self-Governance

When a project develops the framework or its own guidance, it should record:

- Current `TaskBrief`.
- Workflow stages used.
- Guidance documents or schema changed.
- Validation performed.
- Remaining design questions.

The record should be proportional to the task. Small mechanical tasks may only need a final summary; durable changes should update the smallest authoritative document set.
