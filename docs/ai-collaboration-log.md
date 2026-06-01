# AI Collaboration Log

This document records how Anyplan uses its own AI collaboration framework while developing the framework.

## 2026-06-01 Bootstrap

### TaskBrief

- `intent`: Establish the first closed loop for the AI collaboration guidance framework, project instance, and visual interaction engine.
- `scope`: Framework documents, schema, Anyplan instance configuration, static visual engine, and project README.
- `acceptance`: Documents are readable independently, the instance JSON can be consumed by tools, and the engine can display and edit workflows and constraints.
- `unknowns`: Whether the engine should later move to React/Vite, whether persistent backend write support is needed, and whether multi-project workspace management is needed.

### ContextSnapshot

- `filesRead`: Repository root, git status, current branch, and remote information.
- `currentStructure`: The repository initially contained only `.git`; the `main` branch had no commits.
- `risks`: The empty repository had no existing technology stack constraints, so the first version used static HTML/CSS/JS to avoid premature dependencies.

### Workflow Steps Used

- Capture intent.
- Recover context.
- Plan change.
- Implement change.
- Verify change.
- Record decision.

### ChangedArtifacts

- `README.md`
- `framework/README.md`
- `framework/spec/guidance-document.md`
- `framework/schema/anyplan-guidance.schema.json`
- `instances/anyplan/guidance.json`
- `engine/index.html`
- `engine/styles.css`
- `engine/app.js`
- `docs/adr/0001-bootstrap-ai-collaboration-framework.md`
- `docs/ai-collaboration-log.md`

### Verification

- `python3 -m json.tool framework/schema/anyplan-guidance.schema.json`: passed.
- `python3 -m json.tool instances/anyplan/guidance.json`: passed.
- `python3 -c "import json, jsonschema; ..."`: Anyplan instance passed Draft 2020-12 schema validation.
- `node --check engine/app.js`: passed.
- `python3 -m http.server 5173` plus `curl -I`: `/engine/` and `/instances/anyplan/guidance.json` both returned 200.

### OpenQuestions

- Should the visual engine become a full frontend application framework?
- Should guidance documents support multilingual presentation while keeping durable records in English?
- Should workflow adjustments export patches instead of complete JSON?

## 2026-06-01 English Documentation and Anygine-Derived Framework

### TaskBrief

- `intent`: Set project documentation language to English and refine Anyplan's guidance framework by abstracting reusable rules from the sibling Anygine project.
- `scope`: Existing Anyplan documents, framework specifications, schema, guidance instance, visual-engine documentation-facing text, collaboration log, and ADRs.
- `acceptance`: Durable Anyplan documents are written in English; framework rules are clearly derived from Anygine at an abstract level; Anygine can instantiate the framework without making the portable framework graphics-engine-specific.
- `unknowns`: Whether future visual-editor state should preserve multilingual labels separately from durable project documentation.

### ContextSnapshot

- `filesRead`: Anyplan repository files; Anygine `Doc/WorkingContract.md`, `Doc/AIWorkflow.md`, `Doc/AICollaborationMethodology.md`, `Doc/ProjectState.md`, `Doc/DecisionLog.md`, architecture documents, roadmap overview, and reference report guidelines.
- `currentStructure`: Anyplan contains a portable framework, project instance JSON, JSON schema, static visual engine, ADRs, and collaboration log.
- `risks`: Directly copying Anygine's Vulkan, C++, CMake, and Conan rules into Anyplan would make the framework too domain-specific.

### Extracted Anygine Patterns

- Central working contract as the highest-level durable rule document.
- Short current-state snapshot for fast context recovery.
- Separation of rules, current assumptions, decisions, evidence, roadmap state, development history, and methodology.
- Vertical-slice development before broad speculative frameworks.
- Explicit module, API, dependency, experiment, and application boundaries.
- Dependency ownership and public/private API rules.
- Active AI consistency checks against durable guidance.
- Candid AI technical critique in high-risk project domains.
- Human-reproducible validation instructions.
- Proportional documentation updates.

### ChangedArtifacts

- `README.md`
- `framework/README.md`
- `framework/spec/guidance-document.md`
- `framework/spec/anygine-derived-framework.md`
- `framework/schema/anyplan-guidance.schema.json`
- `instances/anyplan/guidance.json`
- `engine/index.html`
- `engine/app.js`
- `docs/ai-collaboration-log.md`
- `docs/adr/0002-english-docs-and-anygine-derived-framework.md`

### Verification

- `rg -n -P "[\\x{4e00}-\\x{9fff}]" README.md framework docs instances engine`: no durable Chinese prose remains in current project documentation or guidance-facing engine text.
- `python3 -m json.tool instances/anyplan/guidance.json`: passed.
- `python3 -m json.tool framework/schema/anyplan-guidance.schema.json`: passed.
- `python3 -c "import json, jsonschema; ..."`: Anyplan instance passed Draft 2020-12 schema validation.
- `node --check engine/app.js`: passed.
- `python3 -m http.server 5173` plus `curl -I`: `/engine/` and `/instances/anyplan/guidance.json` both returned 200.

### OpenQuestions

- Should project instances define a formal authority graph instead of only a document map?
- Should the schema support first-class document authority and memory-type fields?
- Should the visual engine generate `GuidanceChange` and `WorkflowPatch` objects instead of exporting full guidance JSON?
