#!/usr/bin/env bash
# Validate a dashboard JSON file against framework/schema/anyplan-dashboard.schema.json
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANYPLAN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCHEMA="$ANYPLAN_ROOT/framework/schema/anyplan-dashboard.schema.json"
TARGET="${1:-$ANYPLAN_ROOT/instances/anyplan/dashboard.json}"

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: scripts/validate-dashboard.sh [path-to-dashboard.json]"
  exit 0
fi

if [[ ! -f "$TARGET" ]]; then
  echo "Error: dashboard file not found: $TARGET" >&2
  exit 1
fi

echo "Validating: $TARGET"
echo "Schema:     $SCHEMA"

if command -v python3 >/dev/null 2>&1; then
  python3 -m json.tool "$TARGET" >/dev/null
  echo "JSON syntax: OK"
fi

python3 - "$SCHEMA" "$TARGET" <<'PY'
import json
import sys

schema_path, data_path = sys.argv[1], sys.argv[2]

try:
    import jsonschema
except ImportError:
    print("Install jsonschema: pip install jsonschema", file=sys.stderr)
    sys.exit(2)

with open(schema_path, encoding="utf-8") as f:
    schema = json.load(f)
with open(data_path, encoding="utf-8") as f:
    data = json.load(f)

jsonschema.validate(instance=data, schema=schema)
print("Schema validation: OK (jsonschema)")
PY
