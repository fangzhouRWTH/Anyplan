# AI Prompt: Instantiate Anyplan Guidance From an Existing Project

Use this prompt in **Cursor** (Agent/Chat with repository context) or **OpenAI Codex** (or similar coding agents) after you have cloned or vendored the Anyplan framework and run `scripts/init-instance.sh` for a minimal skeleton.

Copy everything below the line into the agent. Replace placeholders in ALL CAPS.

---

You are helping adopt the Anyplan AI collaboration framework in an existing software repository.

## Repository layout

- Anyplan framework root: ANYPLAN_ROOT (e.g. `./anyplan` submodule or sibling clone path)
- Target application repository root: TARGET_REPO_ROOT
- New project id: PROJECT_ID (lowercase, hyphenated)
- Guidance instance path: `instances/PROJECT_ID/guidance.json` under TARGET_REPO_ROOT

## Read first (in order)

1. ANYPLAN_ROOT/framework/README.md
2. ANYPLAN_ROOT/framework/spec/guidance-document.md
3. ANYPLAN_ROOT/docs/adopting-the-framework.md
4. TARGET_REPO_ROOT/instances/PROJECT_ID/guidance.json (minimal instance if already created)
5. TARGET_REPO_ROOT/README.md and any existing docs: WorkingContract, ADR folders, architecture docs, CI config

## Your task

Enrich the guidance instance so it becomes the **central working contract** for AI-assisted work on THIS project. Do not copy domain rules from other projects into portable framework files.

### Deliverables

1. **Updated** `instances/PROJECT_ID/guidance.json`:
   - Accurate `project.purpose`, `project.context`, and `owners`
   - At least 4 `principles` grounded in how this repo actually works
   - `roles` and `handoffRules` matching team expectations
   - `workflows`: keep `default-collaboration-loop` unless the team uses a different process; adjust step `actions`/`checks` to name real tools (test runners, linters, deploy checks)
   - `constraints` with runnable `validation` hints (reference real commands)
   - `documents`: map every authoritative doc you find (README, ADRs, state doc, CI, package manifests). Add `memoryType`, `authority`, `retrievalTier`, `defaultRead`, and `contextCost` when the doc set is non-trivial
   - `interfaces`: keep TaskBrief, ContextSnapshot, VerificationReport; add project-specific interfaces only if needed (e.g. dependency proposal, API boundary change)

2. **Updated or created** prose (English for durable docs unless the instance says otherwise):
   - `docs/ProjectState.md` — short current phase, priorities, validation commands, risks
   - `docs/ai-collaboration-log.md` — append one bootstrap entry describing this instantiation

3. **Optional** `.cursor/rules/anyplan.mdc` or `AGENTS.md` snippet (see ANYPLAN_ROOT/docs/adopting-the-framework.md) pointing agents to the guidance instance and validation script.

### Rules

- Framework files under ANYPLAN_ROOT/framework/ are **read-only** unless the user explicitly asked to change the portable standard.
- Separate **evidence** (reports, spikes) from **decisions** (ADRs). Do not treat research as binding rules.
- Prefer bounded context: task-scope and current-state docs first; deep architecture only when task risk requires it.
- After editing JSON, run: `ANYPLAN_ROOT/scripts/validate-guidance.sh TARGET_REPO_ROOT/instances/PROJECT_ID/guidance.json`
- Report a VerificationReport: commands run, pass/fail, and anything not verified.

### Output format

1. ContextSnapshot (files read, structure summary, risks)
2. Summary of changes by file path
3. VerificationReport
4. Open questions for the human owner
