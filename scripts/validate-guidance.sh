#!/usr/bin/env bash
# Validate a guidance JSON file against framework/schema/anyplan-guidance.schema.json
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/validate-guidance.sh [path-to-guidance.json]

Defaults to instances/anyplan/guidance.json relative to the Anyplan repository root.

Requires one of:
  - Node.js + npx (uses ajv-cli), or
  - Python 3 + jsonschema (pip install jsonschema)

Always checks JSON syntax with python3 -m json.tool when python3 is available.
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANYPLAN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCHEMA="$ANYPLAN_ROOT/framework/schema/anyplan-guidance.schema.json"
TARGET="${1:-$ANYPLAN_ROOT/instances/anyplan/guidance.json}"

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ ! -f "$TARGET" ]]; then
  echo "Error: guidance file not found: $TARGET" >&2
  exit 1
fi

if [[ ! -f "$SCHEMA" ]]; then
  echo "Error: schema not found: $SCHEMA" >&2
  exit 1
fi

echo "Validating: $TARGET"
echo "Schema:     $SCHEMA"

if command -v python3 >/dev/null 2>&1; then
  python3 -m json.tool "$TARGET" >/dev/null
  echo "JSON syntax: OK"
else
  echo "Warning: python3 not found; skipping JSON syntax check." >&2
fi

validate_with_jsonschema() {
  if ! command -v python3 >/dev/null 2>&1; then
    return 1
  fi
  python3 - "$SCHEMA" "$TARGET" <<'PY'
import json
import sys

schema_path, data_path = sys.argv[1], sys.argv[2]

try:
    import jsonschema
except ImportError:
    sys.exit(2)

with open(schema_path, encoding="utf-8") as f:
    schema = json.load(f)
with open(data_path, encoding="utf-8") as f:
    data = json.load(f)

jsonschema.validate(instance=data, schema=schema)
print("Schema validation: OK (jsonschema)")
PY
}

validate_with_ajv() {
  if ! command -v npx >/dev/null 2>&1; then
    return 1
  fi
  npx --yes ajv-cli@5 validate -s "$SCHEMA" -d "$TARGET" --spec=draft2020
}

_py_status=0
validate_with_jsonschema || _py_status=$?

if [[ "$_py_status" -eq 0 ]]; then
  exit 0
fi

if validate_with_ajv 2>/dev/null; then
  echo "Schema validation: OK (ajv-cli)"
  exit 0
fi

if [[ "$_py_status" -eq 2 ]]; then
  echo "" >&2
  echo "Schema validation skipped: install a validator." >&2
  echo "  Option A: pip install jsonschema" >&2
  echo "  Option B: Node.js — re-run this script (uses npx ajv-cli)" >&2
  exit 2
fi

echo "Schema validation failed." >&2
exit 1
