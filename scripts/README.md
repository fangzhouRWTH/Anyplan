# Anyplan Scripts

Command-line helpers for adopting the framework in your repository.

| Script | Description |
| --- | --- |
| [init-instance.sh](init-instance.sh) | Scaffold `instances/<project-id>/guidance.json` and optional `docs/` stubs |
| [validate-guidance.sh](validate-guidance.sh) | Validate guidance JSON against [framework/schema/anyplan-guidance.schema.json](../framework/schema/anyplan-guidance.schema.json) |

Templates live under [templates/](templates/). AI bootstrap prompt: [prompts/instantiate-from-existing-docs.md](prompts/instantiate-from-existing-docs.md).

Full walkthrough: [docs/adopting-the-framework.md](../docs/adopting-the-framework.md).

```bash
chmod +x scripts/init-instance.sh scripts/validate-guidance.sh

scripts/init-instance.sh \
  --project-id my-app \
  --project-name "My App" \
  --purpose "What this project delivers" \
  --owner "me" \
  --with-docs

scripts/validate-guidance.sh instances/my-app/guidance.json
```
