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

3. **Context Retrieval Layer**
   Defines how much project memory should be loaded for a task, which documents are default context, which are phase-level summaries, and which are on-demand deep sources.

4. **Role Layer**
   Defines the responsibilities, permissions, and handoff rules of human owners, AI collaborators, reviewers, maintainers, and visual tools.

5. **Workflow Layer**
   Represents development as explicit stages such as intent capture, context recovery, planning, implementation, validation, and record keeping.

6. **Boundary Layer**
   Defines ownership boundaries for modules, APIs, dependencies, experiments, tooling, and documentation.

7. **Verification Layer**
   Defines how AI-assisted work is checked through commands, tests, review, visible behavior, and human-verifiable instructions.

8. **Interface Layer**
   Defines structured objects exchanged between humans, AI agents, tools, and visual editors.

9. **Instance Layer**
   Maps the framework into a concrete project through a `guidance.json` file and related project documents.

## Instantiation Model

A project instance should include:

- `project`: identity, purpose, documentation language, context, and owners.
- `principles`: durable collaboration and engineering principles.
- `roles`: participants, permissions, and handoff rules.
- `workflows`: visualizable process stages.
- `constraints`: required or recommended rules.
- `interfaces`: structured descriptions exchanged by humans, AI agents, and tools.
- `documents`: authoritative document map, optionally including memory type, retrieval tier, context cost, read triggers, and invalidation cues.
- `changeControl`: rules for changing the framework, instance, and engine.
- `selfGovernance`: how the project records its own use of the framework.

Recommended path:

```text
instances/<project-name>/guidance.json
```

## Compatibility Contract

Visual engines and automation tools should not infer workflow structure from prose. They should read structured guidance fields first, then show prose documents as explanatory and editable artifacts.

Project dashboards (`instances/<project-id>/dashboard.json`) supply overview, roadmap, and task progress for the visual engine. Format: [spec/document-generation.md](spec/document-generation.md).

Zero-context AI onboarding: [spec/ai-entry.md](spec/ai-entry.md) (`docs/AI-Entry.md` per instance). Defect handoff: [spec/active-bug-reports.md](spec/active-bug-reports.md). Instance → framework feedback: [spec/instance-extraction-feedback.md](spec/instance-extraction-feedback.md).

New fields should be added so older tools can safely ignore them when possible. Breaking schema changes should include a version bump and migration note.

## Development Rule

Any framework change should answer three questions:

- Does it remain independent of Anyplan and any other concrete project instance?
- Can a concrete project instantiate it without copying domain-specific rules into the framework body?
- Can the visual engine read, display, edit, or safely ignore the change?
