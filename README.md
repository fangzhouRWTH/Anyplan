# Anyplan

Anyplan is a guidance framework and visual interaction engine for AI-assisted software development.

The repository has three responsibilities:

- Define a portable guidance standard for human-AI collaboration in software projects.
- Provide a visual engine that can browse, edit, and adjust instantiated project guidance.
- Use the framework to develop itself, so the framework is tested by its own workflow.

## Adopting the Framework in Your Project

See **[docs/adopting-the-framework.md](docs/adopting-the-framework.md)** for a step-by-step guide: Git clone or submodule, scaffold `instances/<project-id>/guidance.json` with [scripts/init-instance.sh](scripts/init-instance.sh), validate with [scripts/validate-guidance.sh](scripts/validate-guidance.sh), optional Cursor/Codex prompts, and wiring agents to the central guidance instance.

## Repository Map

- [docs/adopting-the-framework.md](docs/adopting-the-framework.md): how to apply Anyplan in your own repository.
- [framework/README.md](framework/README.md): overview of the portable AI collaboration framework.
- [framework/spec/guidance-document.md](framework/spec/guidance-document.md): guidance document specification.
- [framework/schema/anyplan-guidance.schema.json](framework/schema/anyplan-guidance.schema.json): machine-readable schema for guidance instances.
- [instances/anyplan/guidance.json](instances/anyplan/guidance.json): Anyplan's own instantiated guidance document.
- [engine/index.html](engine/index.html): static visual interaction engine MVP.
- [docs/research/README.md](docs/research/README.md): concrete project research notes and extraction studies.
- [docs/adr/README.md](docs/adr/README.md): architecture and project decision records.
- [docs/ai-collaboration-log.md](docs/ai-collaboration-log.md): self-governance record for this project.

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
- Context retrieval depth, including task-scope documents, phase summaries, and on-demand deep sources.
- Engineering, documentation, communication, safety, and interaction constraints.
- Custom description interfaces for task briefs, context snapshots, workflow patches, guidance changes, and verification reports.
- Change-control rules for framework, instance, and engine updates.

## Research Notes

Concrete project research, extraction notes, and case studies belong under `docs/research/`.

Research documents may inform the framework, but they are not part of the portable framework definition. When a research finding becomes a general rule, the framework should restate it in project-independent terms.
