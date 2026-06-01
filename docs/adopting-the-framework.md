# Adopting the Anyplan Framework in Your Project

This guide explains how to take the portable Anyplan collaboration framework from clone to a **project guidance instance** that AI tools can follow. It covers Git setup, command-line scaffolding, optional scripts, prose documents, validation, the visual engine, and when to use **Cursor** or **Codex**.

For conceptual background, read [framework/README.md](../framework/README.md) and [framework/spec/guidance-document.md](../framework/spec/guidance-document.md).

## What You Are Building

| Artifact | Purpose |
| --- | --- |
| `instances/<project-id>/guidance.json` | Structured **central working contract** for AI and humans |
| `docs/ProjectState.md` | Short **current-state** snapshot for fast context recovery |
| `docs/ai-collaboration-log.md` | Chronological record of meaningful AI-assisted work |
| `docs/adr/*.md` | Binding **decisions** (create when needed) |
| Agent entrypoint (optional) | `.cursor/rules/*.mdc` or `AGENTS.md` pointing agents at the instance |

The framework body stays in `framework/` (portable). Your repository holds the **instance** and project-specific docs.

## Choose an Integration Model

### Model A — Submodule (recommended for active teams)

Keep Anyplan as a Git submodule inside your application repository. Your app repo owns `instances/` and `docs/`; the submodule supplies schema, spec, engine, and scripts.

```bash
cd /path/to/your-app
git submodule add <ANYPLAN_REPO_URL> anyplan
git submodule update --init --recursive
```

Run scripts via `anyplan/scripts/...`. Validate with `anyplan/scripts/validate-guidance.sh instances/<id>/guidance.json`.

### Model B — Sibling clone (quick trial)

Clone Anyplan next to your project and pass `--repo-root` to scripts pointing at your app tree.

```bash
git clone <ANYPLAN_REPO_URL> ~/tools/anyplan
cd /path/to/your-app
~/tools/anyplan/scripts/init-instance.sh \
  --project-id my-app \
  --project-name "My App" \
  --purpose "One-line purpose" \
  --owner "your-handle" \
  --repo-root . \
  --with-docs
```

### Model C — Copy framework files (offline / fork)

Copy `framework/`, `scripts/`, and optionally `engine/` into your monorepo. You maintain schema updates yourself. Use only when submodule or sibling access is impractical.

## Step 1 — Clone Anyplan

```bash
git clone <ANYPLAN_REPO_URL>
cd Anyplan   # repository root; adjust if cloned elsewhere
```

Optional: pin a tag or commit your team trusts for schema stability.

## Step 2 — Scaffold a Guidance Instance

From the Anyplan repository (or with `--repo-root` pointing at your app repo):

```bash
chmod +x scripts/init-instance.sh scripts/validate-guidance.sh

scripts/init-instance.sh \
  --project-id my-app \
  --project-name "My App" \
  --purpose "Describe what this software delivers" \
  --owner "alice" \
  --context "Stack, stage, and boundaries in one or two sentences." \
  --with-docs
```

With Model A (submodule), run the same command from your app repo:

```bash
anyplan/scripts/init-instance.sh \
  --project-id my-app \
  --project-name "My App" \
  --purpose "..." \
  --owner "alice" \
  --repo-root . \
  --with-docs
```

This creates:

- `instances/my-app/guidance.json` — minimal valid instance from [scripts/templates/guidance.minimal.json](../scripts/templates/guidance.minimal.json)
- `docs/ProjectState.md` — when `--with-docs` is set
- `docs/ai-collaboration-log.md` — when `--with-docs` is set

Use `--force` only when you intend to overwrite an existing instance.

## Step 3 — Validate the Instance

```bash
scripts/validate-guidance.sh instances/my-app/guidance.json
```

The validator checks JSON syntax and, when available, JSON Schema compliance.

Install a validator if the script reports it skipped schema checks:

```bash
# Option A: Node.js (ajv-cli via npx, no global install required)
node --version

# Option B: Python jsonschema
python3 -m pip install jsonschema
```

## Step 4 — Enrich Guidance (Manual or AI-Assisted)

A minimal instance is enough to start; a useful instance maps **your real documents, tools, and risks**.

### 4a — Manual checklist

Edit `instances/<project-id>/guidance.json` and update:

1. **`project`** — purpose, context, owners, documentation language.
2. **`principles`** — durable judgment rules (4–8 is a good target).
3. **`constraints`** — required repo/quality/safety rules; put **real commands** in `validation`.
4. **`documents`** — every authoritative path (README, ADRs, CI, architecture). Add retrieval metadata when the doc set grows ([ADR 0003](adr/0003-bounded-context-retrieval.md)).
5. **`workflows`** — adjust step actions to name your test/lint/review tools.
6. **`selfGovernance.recordPath`** — ensure it matches your collaboration log.

Keep `docs/ProjectState.md` under one screen where possible.

### 4b — AI-assisted enrichment (Cursor or Codex)

Use when the repository already has README, contracts, ADRs, or architecture notes.

1. Complete Steps 1–3 so a minimal instance exists.
2. Open [scripts/prompts/instantiate-from-existing-docs.md](../scripts/prompts/instantiate-from-existing-docs.md).
3. Replace placeholders (`ANYPLAN_ROOT`, `TARGET_REPO_ROOT`, `PROJECT_ID`).
4. Paste the prompt into:
   - **Cursor**: Agent mode with the target repository open; attach or @-mention key docs.
   - **Codex** (or OpenAI coding agents): same prompt with repository access enabled.
5. Require the agent to run validation before finishing:

   ```bash
   anyplan/scripts/validate-guidance.sh instances/my-app/guidance.json
   ```

Review the diff like any other code change. AI should not silently redefine framework authority or copy another project's domain rules into your instance.

For a worked extraction pattern (concrete project → abstract rules → instance fields), see [docs/research/anygine-framework-extraction.md](research/anygine-framework-extraction.md).

## Step 5 — Wire AI Tools to the Instance

### Cursor

Create a project rule that loads on every session, for example `.cursor/rules/anyplan.mdc`:

```markdown
---
description: Anyplan central guidance for this repository
alwaysApply: true
---

Before non-trivial implementation work:

1. Read `instances/my-app/guidance.json` (central working contract).
2. Read `docs/ProjectState.md` for current phase and validation commands.
3. Follow the active workflow in the guidance instance (default: `default-collaboration-loop`).
4. On structural guidance edits, run `anyplan/scripts/validate-guidance.sh instances/my-app/guidance.json`.
5. Record durable work in `docs/ai-collaboration-log.md`; use ADRs for binding decisions.

Do not treat research notes or third-party case studies as binding unless mapped in the instance.
```

Adjust paths if Anyplan lives in a submodule (`anyplan/instances/...`).

You can also add a short pointer in the repository root `AGENTS.md` if your team uses it.

### Codex / other coding agents

- Add the same instructions to the agent's system or project instructions file your team maintains.
- Pass the prompt in [scripts/prompts/instantiate-from-existing-docs.md](../scripts/prompts/instantiate-from-existing-docs.md) for bootstrap or major refreshes.
- Ensure the agent can run shell validation or you run it in CI (see below).

## Step 6 — Browse with the Visual Engine (Optional)

From the Anyplan repository root:

```bash
python3 -m http.server 5173
```

Open `http://localhost:5173/engine/`. The MVP loads [instances/anyplan/guidance.json](../instances/anyplan/guidance.json) when served over HTTP. Use it to inspect workflows, constraints, and document maps. The engine does not yet write changes back to disk; edit JSON in your editor or via AI and re-validate.

To point the engine at your instance in a fork, adjust `engine/app.js` load path or serve your repo root that contains `instances/<id>/guidance.json`.

## Step 7 — Day-to-Day Workflow

For each meaningful task, AI collaborators should:

1. Produce a **TaskBrief** (intent, scope, acceptance, unknowns).
2. Recover context → **ContextSnapshot** + **RetrievalScope** (bounded reads).
3. Check **constraints** and raise **GuidanceConflict** when needed.
4. Implement the smallest useful change.
5. Emit a **VerificationReport** with reproducible commands.
6. Update `docs/ProjectState.md`, ADRs, or the collaboration log when impact is durable.

Human owners approve changes to central authority, schema semantics, or product direction.

## Optional — CI Validation

Add a job that fails when guidance JSON is invalid:

```yaml
# Example GitHub Actions step
- name: Validate Anyplan guidance
  run: |
    anyplan/scripts/validate-guidance.sh instances/my-app/guidance.json
```

Requires Node or Python jsonschema on the runner, or a pre-installed `ajv-cli`.

## Optional — Create ADR and Research Layout

```bash
mkdir -p docs/adr docs/research
```

- **ADR**: record binding decisions (`docs/adr/0001-title.md`). Register each ADR in `guidance.json` → `documents`.
- **Research**: spikes and case studies under `docs/research/`; not binding until restated in the instance or an ADR.

## Script Reference

| Script | Purpose |
| --- | --- |
| [scripts/init-instance.sh](../scripts/init-instance.sh) | Create `instances/<id>/guidance.json` and optional prose stubs |
| [scripts/validate-guidance.sh](../scripts/validate-guidance.sh) | JSON + schema validation |
| [scripts/templates/guidance.minimal.json](../scripts/templates/guidance.minimal.json) | Minimal instance template |
| [scripts/prompts/instantiate-from-existing-docs.md](../scripts/prompts/instantiate-from-existing-docs.md) | Cursor/Codex bootstrap prompt |

See [scripts/README.md](../scripts/README.md) for a short index.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Putting Vulkan/domain rules in `framework/` | Keep domain rules in your instance only |
| One giant README as the only contract | Add `guidance.json` + short `ProjectState.md` |
| Loading all docs every task | Use `retrievalTier` and phase summaries |
| Skipping validation after JSON edits | Run `validate-guidance.sh` |
| AI edits without collaboration log | Append a proportional entry for durable work |

## Minimal Success Criteria

You have adopted the framework successfully when:

- [ ] `instances/<project-id>/guidance.json` validates against the schema.
- [ ] The document map lists real paths that exist (or are explicitly planned).
- [ ] At least one constraint references a command your team actually runs.
- [ ] Cursor or Codex instructions point to the instance before implementation work.
- [ ] `docs/ProjectState.md` reflects the current phase and validation commands.

## Next Steps

- Compare your instance with [instances/anyplan/guidance.json](../instances/anyplan/guidance.json) for a full-featured reference.
- Read [docs/adr/0003-bounded-context-retrieval.md](adr/0003-bounded-context-retrieval.md) when the documentation set grows.
- Contribute framework improvements only through portable changes in `framework/` plus an ADR in the Anyplan repo.
