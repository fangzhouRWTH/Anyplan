# Anygine Framework Extraction Research Note

This research note records how Anyplan analyzed a concrete project and extracted candidate guidance patterns.

This document is not part of the portable framework specification. It is a project-specific research artifact. Framework documents may reuse lessons from this note only after restating them in project-independent terms.

The source material is the sibling project at `/home/fangzhou/projects/Anygine/Anygine`, especially:

- `Doc/WorkingContract.md`
- `Doc/AIWorkflow.md`
- `Doc/AICollaborationMethodology.md`
- `Doc/ProjectState.md`
- `Doc/DecisionLog.md`
- `Doc/ArchitectureOverview.md`
- `Doc/ModuleArchitecturePlan.md`
- `Doc/Architecture/BuildTargetPlan.md`
- `Doc/Architecture/PublicPrivateAPIPolicy.md`
- `Doc/Architecture/DependencyManagementPolicy.md`
- `Doc/Roadmap/RoadmapOverview.md`
- `Doc/Reference/ReportGuidelines.md`

The goal is not to copy Anygine's graphics-engine rules into every project. The goal is to extract the collaboration and governance pattern behind those rules.

## Research Summary

Anygine is a concrete Vulkan/C++ graphics engine. Its project documents contain domain-specific commitments such as Vulkan visibility, static-library-first CMake targets, Conan dependency management, public/private headers, and simulation-training goals.

The abstract framework behind those commitments is broader:

- Make durable rules explicit.
- Keep current state easy to recover.
- Separate evidence from decisions.
- Build through validated vertical slices.
- Preserve ownership boundaries.
- Assign every dependency to an owner.
- Keep experiments isolated until promoted.
- Require AI collaborators to check conflicts and surface technical risk.
- Provide validation feedback that humans can reproduce.

## Generalized Rules

### 1. Central Working Contract

Abstract rule:

- Each project should have one central guidance artifact that defines durable working rules and outranks descriptive documentation.

Anygine instance:

- `Doc/WorkingContract.md` is the central contract for development behavior, AI collaboration, documentation updates, and decision-making.

Generic application:

- A web app, data platform, game, research tool, or library can instantiate this as `WORKING_CONTRACT.md`, `project-guidance.json`, a governance document, or another clearly named artifact.

### 2. Short Current-State Snapshot

Abstract rule:

- Projects with nontrivial documentation should keep a short operational state document for fast context recovery.

Anygine instance:

- `Doc/ProjectState.md` summarizes the active phase, priorities, decisions that should not be reopened casually, open questions, validation steps, risks, and next actions.

Generic application:

- Any project can maintain a concise state snapshot that points to authoritative documents instead of duplicating them.

### 3. Separate Memory Types

Abstract rule:

- Rules, decisions, evidence, plans, logs, current state, and methodology should live in distinct records.

Anygine instance:

- Working rules live in `WorkingContract`.
- Decisions live in `DecisionLog`.
- Evidence lives in `Reference`.
- Roadmap state lives in `Roadmap`.
- Chronological work lives in `DevelopmentLog`.
- AI collaboration lessons live in `AICollaborationMethodology`.

Generic application:

- The exact filenames can change, but AI agents need a stable map from question type to source of truth.

### 4. Vertical Slice Growth

Abstract rule:

- Prefer small runnable slices that prove architecture under implementation pressure before broad framework expansion.

Anygine instance:

- Phase 1 focuses on a minimal engine vertical slice: build, run, window, loop, Vulkan frame, shader automation, renderer/material frame, simulation, physics abstraction, and tests.

Generic application:

- A backend service can use a request-to-storage slice.
- A frontend tool can use a load-edit-save slice.
- A data system can use an ingest-transform-query slice.

### 5. Boundary Visibility

Abstract rule:

- Important ownership boundaries should be visible in source layout, APIs, build targets, module documentation, and dependency rules.

Anygine instance:

- Library modules use `Public/` and `Private/`.
- Applications stay thin.
- Vulkan backend details are contained behind graphics boundaries.
- Experiments are isolated from runtime targets.

Generic application:

- A project can apply the same rule through packages, services, adapters, plugin boundaries, generated-code boundaries, or deployment units.

### 6. Dependency Ownership

Abstract rule:

- Every dependency should have a concrete owner and a documented reason.

Anygine instance:

- Conan 2 is preferred for normal C/C++ dependencies.
- Each dependency is linked only to its owning CMake target.
- Third-party types should not leak into public APIs unless intentionally part of the contract.

Generic application:

- The same pattern applies to npm, Python packages, Rust crates, service clients, SDKs, model weights, or hosted APIs.

### 7. Evidence Before Binding Decisions

Abstract rule:

- Analysis reports can recommend actions, but binding decisions should be recorded separately with rationale and consequences.

Anygine instance:

- Technical reports live under `Doc/Reference/`.
- Binding choices are recorded in `Doc/DecisionLog.md`.

Generic application:

- Architecture research, vendor comparisons, benchmarks, and prototype reviews should not silently become decisions without an explicit decision record.

### 8. Active Consistency Checks

Abstract rule:

- AI collaborators should compare new requests against durable guidance and flag material conflicts before executing contradictory work.

Anygine instance:

- The working contract requires AI to surface conflicts with the contract, decision log, architecture documents, and reference reports.

Generic application:

- AI agents should treat project guidance as an operational constraint, not as a passive archive.

### 9. Candid Technical Critique

Abstract rule:

- AI collaborators should surface hidden technical complexity, missing assumptions, and likely failure modes when they affect project direction.

Anygine instance:

- AI is expected to warn about Vulkan synchronization, renderer/RHI boundaries, asset pipeline design, build/dependency ownership, physics integration, simulation stepping, testing, diagnostics, and training interfaces.

Generic application:

- Each project should define its own high-risk domains where AI is expected to be especially direct.

### 10. Human-Reproducible Validation

Abstract rule:

- Completion summaries should include validation commands, expected results, and GUI/IDE-side checks when relevant.

Anygine instance:

- Phase task summaries include terminal commands, VSCode CMake Tools steps, launch configurations, and expected runtime behavior.

Generic application:

- Validation should not depend only on hidden AI-side command output. It should be reproducible in the project owner's normal environment.

### 11. Proportional Documentation Updates

Abstract rule:

- Documentation updates should match the durability and impact of the change.

Anygine instance:

- Small tasks may need only a final summary.
- Direction changes update the working contract, decision log, project state, roadmap, or methodology depending on impact.

Generic application:

- The framework should preserve useful memory without turning every task into documentation ceremony.

## Required Project Instance Mapping

A project that instantiates this framework should map the abstract rules to concrete artifacts:

| Abstract need | Project instance should define |
| --- | --- |
| Central rules | Primary contract or guidance file |
| Current state | Short state snapshot and update triggers |
| Decisions | Decision log or ADR policy |
| Evidence | Reference-report or analysis-record policy |
| Roadmap | Phase, task, status, and blocker tracking |
| Boundaries | Module/API/dependency/experiment ownership |
| AI behavior | Conflict checks, critique expectations, handoff rules |
| Validation | Commands, tests, visible behavior, human-side instructions |
| Documentation language | Durable documentation language and exceptions |

## How Anygine Can Use This Framework

Anygine can instantiate Anyplan by binding the generalized rules to its existing documents:

- `project.documentationLanguage`: English.
- `principles`: Vulkan visibility, lightweight systems, vertical slices, simulation-training readiness, transparent AI collaboration.
- `documents`: WorkingContract, ProjectState, DecisionLog, Roadmap, Reference, architecture documents, and module READMEs.
- `constraints`: public/private API boundaries, Conan-first dependency policy, static-library-first targets, diagnostics usage, project-relative paths, validation-layer policy.
- `workflows`: phase-task workflow from contract check through implementation, validation, roadmap update, and decision logging.
- `interfaces`: task brief, context snapshot, dependency proposal, boundary change, verification report, roadmap update, and decision entry.

This keeps Anygine concrete while letting the Anyplan framework remain portable.
