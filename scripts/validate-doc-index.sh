#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANYPLAN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCHEMA="$ANYPLAN_ROOT/framework/schema/anyplan-doc-index.schema.json"
TARGET="${1:-$ANYPLAN_ROOT/instances/anyplan/doc-index.json}"

[[ "${1:-}" == "-h" || "${1:-}" == "--help" ]] && {
  echo "Usage: scripts/validate-doc-index.sh [path-to-doc-index.json]"
  exit 0
}

[[ -f "$TARGET" ]] || { echo "Error: not found: $TARGET" >&2; exit 1; }

echo "Validating: $TARGET"
python3 -m json.tool "$TARGET" >/dev/null
echo "JSON syntax: OK"

python3 - "$SCHEMA" "$TARGET" <<'PY'
import json, sys
try:
    import jsonschema
except ImportError:
    sys.exit(2)
with open(sys.argv[1], encoding="utf-8") as f:
    schema = json.load(f)
with open(sys.argv[2], encoding="utf-8") as f:
    data = json.load(f)
jsonschema.validate(instance=data, schema=schema)
print("Schema validation: OK (jsonschema)")
PY
