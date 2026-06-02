# AI Prompt: Extract Instance Feedback Into Anyplan Framework

Use in **Cursor** or **Codex** when a concrete project (e.g. Anygine) has documentation patterns worth porting to the portable Anyplan framework.

---

You are extracting **portable collaboration patterns** from a concrete project into the Anyplan framework repository.

## Inputs

- **Source instance repo:** SOURCE_REPO_ROOT (e.g. `/path/to/Anygine`)
- **Framework repo:** ANYPLAN_ROOT (e.g. `/path/to/Anyplan`)
- **Topic:** TOPIC (e.g. `AI-Entry`, `active-bug-reports`, `phase-context`, `debug-handoff`)

## Read first

1. ANYPLAN_ROOT/framework/spec/instance-extraction-feedback.md
2. ANYPLAN_ROOT/docs/research/ (existing extraction notes)
3. SOURCE_REPO_ROOT — documents listed for TOPIC (WorkingContract, GuidanceManifest, ActiveBugReports, ProjectState, AIWorkflow, etc.)

## Rules

- **Do not** copy domain-specific rules (Vulkan, CMake, language choices, product features) into `framework/`.
- **Do** restate patterns in project-independent language in `framework/spec/`.
- Research drafts go to ANYPLAN_ROOT/docs/research/ only.
- Binding framework direction changes need an ADR draft under ANYPLAN_ROOT/docs/adr/.
- Update ANYPLAN_ROOT/instances/anyplan/guidance.json, docs/AI-Entry.md, and dashboard when Anyplan itself adopts the pattern.

## Deliverables

1. **Extraction research note** (if new topic): `docs/research/<source>-<topic>-extraction.md` with sections: Source, Problem, Instance solution, Abstract rule, Generic application, Not portable, Recommended framework changes.

2. **Framework spec** create or update under `framework/spec/`.

3. **Templates** under `framework/templates/` or `scripts/templates/` if instances need scaffolds.

4. **ADR outline** or full ADR if authority or onboarding model changes.

5. **Anyplan instance sync:** `docs/AI-Entry.md`, `guidance.json` documents[], principles if needed.

6. **Source backport checklist** (paths in SOURCE_REPO_ROOT): e.g. add `Doc/AI-Entry.md`, update manifest startup path—without copying Anyplan framework files into the product repo.

7. **VerificationReport:** validation scripts run, residual gaps.

## Output format

1. ContextSnapshot (files read)
2. Classification table: portable / instance-only / research-only
3. Proposed file list with one-line purpose each
4. VerificationReport
5. Open questions for human owner
