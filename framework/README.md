# AI Collaboration Guidance Framework

This framework turns implicit human-AI development habits into readable, inspectable, and project-instantiable guidance.

It is intentionally independent of a specific repository, language, build system, domain, or AI agent implementation. A concrete project instantiates the framework by declaring its own purpose, authority model, workflow, constraints, interfaces, and documentation map.

## Design Goals

- **Portable**: the framework body can be reused by many projects.
- **Instantiable**: each project can inherit the common structure and fill in project-specific context.
- **Visualizable**: workflows, constraints, interfaces, and document relationships can be browsed and edited interactively.
- **Auditable**: AI-assisted work should leave useful evidence when it affects future development.
- **Self-governing**: work on this framework should follow the framework itself.

## Framework Layers

1. **Authority Layer**
   Defines which documents, decisions, people, and tools have priority when guidance conflicts.

2. **Memory Layer**
   Defines how project memory is divided into working rules, current state, decisions, evidence, roadmap state, development history, and methodology.

3. **Role Layer**
   Defines the responsibilities, permissions, and handoff rules of human owners, AI collaborators, reviewers, maintainers, and visual tools.

4. **Workflow Layer**
   Represents development as explicit stages such as intent capture, context recovery, planning, implementation, validation, and record keeping.

5. **Boundary Layer**
   Defines ownership boundaries for modules, APIs, dependencies, experiments, tooling, and documentation.

6. **Verification Layer**
   Defines how AI-assisted work is checked through commands, tests, review, visible behavior, and human-verifiable instructions.

7. **Interface Layer**
   Defines structured objects exchanged between humans, AI agents, tools, and visual editors.

8. **Instance Layer**
   Maps the framework into a concrete project through a `guidance.json` file and related project documents.

## Anygine-Derived Abstraction

The initial framework extraction comes from Anygine, a Vulkan graphics engine project that already uses AI-assisted development documentation.

The Anygine project contributes several reusable patterns:

- Use a central working contract as the highest-level durable rule document.
- Keep a short current-state snapshot for fast context recovery.
- Separate rules, current assumptions, decisions, evidence, roadmap state, chronological logs, and methodology.
- Prefer runnable vertical slices before large speculative subsystem design.
- Preserve important technical boundaries instead of hiding ownership, lifetime, dependencies, or platform assumptions.
- Require dependency ownership and public/private API rules.
- Treat AI as an engineering collaborator that must validate, critique, and record meaningful work.
- Provide validation instructions that the project owner can reproduce outside the AI conversation.

Anyplan generalizes those patterns into a domain-independent guidance framework. A project such as Anygine can instantiate the framework by binding the abstract rules to concrete choices such as Vulkan visibility, C++20, CMake targets, Conan dependency policy, public/private headers, shader tooling, and simulation-oriented roadmap phases.

## Instantiation Model

A project instance should include:

- `project`: identity, purpose, documentation language, context, and owners.
- `principles`: durable collaboration and engineering principles.
- `roles`: participants, permissions, and handoff rules.
- `workflows`: visualizable process stages.
- `constraints`: required or recommended rules.
- `interfaces`: structured descriptions exchanged by humans, AI agents, and tools.
- `documents`: authoritative document map.
- `changeControl`: rules for changing the framework, instance, and engine.
- `selfGovernance`: how the project records its own use of the framework.

Recommended path:

```text
instances/<project-name>/guidance.json
```

## Compatibility Contract

Visual engines and automation tools should not infer workflow structure from prose. They should read structured guidance fields first, then show prose documents as explanatory and editable artifacts.

New fields should be added so older tools can safely ignore them when possible. Breaking schema changes should include a version bump and migration note.

## Development Rule

Any framework change should answer three questions:

- Does it remain independent of Anyplan and Anygine?
- Can a concrete project instantiate it without copying domain-specific rules into the framework body?
- Can the visual engine read, display, edit, or safely ignore the change?
