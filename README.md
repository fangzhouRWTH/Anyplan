# Anyplan

Anyplan is a guidance framework and visual interaction engine for AI-assisted software development.

The repository has three responsibilities:

- Define a portable guidance standard for human-AI collaboration in software projects.
- Provide a visual engine that can browse, edit, and adjust instantiated project guidance.
- Use the framework to develop itself, so the framework is tested by its own workflow.

## Repository Map

- [framework/README.md](framework/README.md): overview of the portable AI collaboration framework.
- [framework/spec/guidance-document.md](framework/spec/guidance-document.md): guidance document specification.
- [framework/spec/anygine-derived-framework.md](framework/spec/anygine-derived-framework.md): generalized framework rules derived from the Anygine project documentation.
- [framework/schema/anyplan-guidance.schema.json](framework/schema/anyplan-guidance.schema.json): machine-readable schema for guidance instances.
- [instances/anyplan/guidance.json](instances/anyplan/guidance.json): Anyplan's own instantiated guidance document.
- [engine/index.html](engine/index.html): static visual interaction engine MVP.
- [docs/ai-collaboration-log.md](docs/ai-collaboration-log.md): self-governance record for this project.
- [docs/adr/0001-bootstrap-ai-collaboration-framework.md](docs/adr/0001-bootstrap-ai-collaboration-framework.md): initial architecture decision.
- [docs/adr/0002-english-docs-and-anygine-derived-framework.md](docs/adr/0002-english-docs-and-anygine-derived-framework.md): documentation-language and framework-derivation decision.

## Documentation Language

All project documentation must be written in English.

Development discussion may happen in another language, but durable project records, framework specifications, guidance instances, ADRs, logs, and documentation-facing UI text should use English unless a future recorded decision changes this rule.

## Open The Engine

Open [engine/index.html](engine/index.html) directly to use the embedded fallback example. To let the engine load
[instances/anyplan/guidance.json](instances/anyplan/guidance.json), start a static server from the repository root:

```bash
python3 -m http.server 5173
```

Then visit `http://localhost:5173/engine/`.

## First Working Contract

Anyplan treats AI-assisted development as a describable, inspectable, and adjustable system. Each project instance should declare:

- Project purpose, scope, current state, and documentation language.
- Human and AI roles, including authority and handoff rules.
- Workflow steps from intent capture to validation and record keeping.
- Engineering, documentation, communication, safety, and interaction constraints.
- Custom description interfaces for task briefs, context snapshots, workflow patches, guidance changes, and verification reports.
- Change-control rules for framework, instance, and engine updates.

## Anygine-Derived Direction

The first framework extraction is based on the sibling Anygine project at `/home/fangzhou/projects/Anygine/Anygine`.

Anygine's documentation shows a mature AI-assisted development pattern:

- A central working contract has higher authority than descriptive documents.
- Current project state is kept short for fast context recovery.
- Decisions, evidence, roadmap state, development history, and methodology are separated.
- Work grows through runnable vertical slices rather than broad speculative architecture.
- Public/private boundaries, dependency ownership, and validation instructions are documented.
- AI collaborators are expected to check conflicts, provide candid engineering critique, and leave useful verification evidence.

Anyplan generalizes those practices so projects outside graphics-engine development can instantiate the same collaboration model with their own domain-specific rules.
