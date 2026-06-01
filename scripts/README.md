# Anyplan Scripts

Command-line helpers for adopting the framework in your repository.

| Script | Description |
| --- | --- |
| [init-instance.sh](init-instance.sh) | Scaffold `instances/<project-id>/guidance.json` and optional `docs/` stubs |
| [validate-guidance.sh](validate-guidance.sh) | Validate guidance JSON against [framework/schema/anyplan-guidance.schema.json](../framework/schema/anyplan-guidance.schema.json) |
| [validate-dashboard.sh](validate-dashboard.sh) | Validate dashboard JSON against [framework/schema/anyplan-dashboard.schema.json](../framework/schema/anyplan-dashboard.schema.json) |
| [build-doc-index.py](build-doc-index.py) | Scan repo markdown and write `instances/<id>/doc-index.json` |
| [validate-doc-index.sh](validate-doc-index.sh) | Validate doc-index JSON |
| [serve.sh](serve.sh) | Build doc-index, start HTTP server, open engine in browser (`--no-browser` to skip) |

Templates live under [templates/](templates/). AI bootstrap prompt: [prompts/instantiate-from-existing-docs.md](prompts/instantiate-from-existing-docs.md).

Full walkthrough: [docs/adopting-the-framework.md](../docs/adopting-the-framework.md).

```bash
chmod +x scripts/init-instance.sh scripts/validate-guidance.sh

scripts/init-instance.sh \
  --project-id my-app \
  --project-name "My App" \
  --purpose "What this project delivers" \
  --owner "me" \
  --with-docs \
  --with-dashboard

scripts/validate-guidance.sh instances/my-app/guidance.json
scripts/validate-dashboard.sh instances/my-app/dashboard.json
scripts/build-doc-index.py --project-id my-app --repo-root .
scripts/serve.sh my-app 5173
```
