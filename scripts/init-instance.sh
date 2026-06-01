#!/usr/bin/env bash
# Scaffold a new Anyplan guidance instance and optional prose documents.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/init-instance.sh [options]

Create instances/<project-id>/guidance.json from the minimal template and
optionally scaffold docs/ProjectState.md and docs/ai-collaboration-log.md.

Options:
  --project-id ID          Required. Lowercase id (e.g. my-app).
  --project-name NAME      Required. Display name.
  --purpose TEXT           Required. One-line project purpose.
  --owner OWNER            Required. Repeatable or comma-separated owners.
  --context TEXT           Project context (default: bootstrap / early adoption).
  --lang LANG              documentationLanguage (default: English).
  --repo-root PATH         Repository root (default: current directory).
  --with-docs              Create docs/ProjectState.md and collaboration log.
  --force                  Overwrite existing instance file.
  -h, --help               Show this help.

Examples:
  scripts/init-instance.sh \\
    --project-id acme-api \\
    --project-name "Acme API" \\
    --purpose "HTTP API for customer onboarding" \\
    --owner "jane" \\
    --with-docs

  scripts/init-instance.sh \\
    --project-id acme-api \\
    --project-name "Acme API" \\
    --purpose "HTTP API for customer onboarding" \\
    --owner "jane,john" \\
    --repo-root /path/to/your/repo
EOF
}

REPO_ROOT="."
PROJECT_ID=""
PROJECT_NAME=""
PROJECT_PURPOSE=""
PROJECT_CONTEXT="Early adoption of the Anyplan guidance framework. Fill in phase, stack, and boundaries as the project matures."
DOCUMENTATION_LANGUAGE="English"
OWNERS=()
WITH_DOCS=0
FORCE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-id)
      PROJECT_ID="$2"
      shift 2
      ;;
    --project-name)
      PROJECT_NAME="$2"
      shift 2
      ;;
    --purpose)
      PROJECT_PURPOSE="$2"
      shift 2
      ;;
    --context)
      PROJECT_CONTEXT="$2"
      shift 2
      ;;
    --owner)
      IFS=',' read -r -a _owners <<<"$2"
      for o in "${_owners[@]}"; do
        o="$(echo "$o" | xargs)"
        [[ -n "$o" ]] && OWNERS+=("$o")
      done
      shift 2
      ;;
    --lang)
      DOCUMENTATION_LANGUAGE="$2"
      shift 2
      ;;
    --repo-root)
      REPO_ROOT="$2"
      shift 2
      ;;
    --with-docs)
      WITH_DOCS=1
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$PROJECT_ID" || -z "$PROJECT_NAME" || -z "$PROJECT_PURPOSE" ]]; then
  echo "Error: --project-id, --project-name, and --purpose are required." >&2
  usage >&2
  exit 1
fi

if [[ ${#OWNERS[@]} -eq 0 ]]; then
  echo "Error: at least one --owner is required." >&2
  exit 1
fi

if ! [[ "$PROJECT_ID" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "Error: --project-id must match ^[a-z][a-z0-9-]*$ (got: $PROJECT_ID)" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANYPLAN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE="$SCRIPT_DIR/templates/guidance.minimal.json"

REPO_ROOT="$(cd "$REPO_ROOT" && pwd)"
INSTANCE_DIR="$REPO_ROOT/instances/$PROJECT_ID"
INSTANCE_FILE="$INSTANCE_DIR/guidance.json"
INSTANCE_PATH="instances/$PROJECT_ID/guidance.json"
RECORD_PATH="docs/ai-collaboration-log.md"
TODAY="$(date +%Y-%m-%d)"

mkdir -p "$INSTANCE_DIR"

if [[ -f "$INSTANCE_FILE" && "$FORCE" -ne 1 ]]; then
  echo "Error: $INSTANCE_FILE already exists (use --force to overwrite)." >&2
  exit 1
fi

OWNERS_JSON="["
for i in "${!OWNERS[@]}"; do
  [[ $i -gt 0 ]] && OWNERS_JSON+=", "
  OWNERS_JSON+="\"${OWNERS[$i]}\""
done
OWNERS_JSON+="]"

escape_sed() {
  printf '%s' "$1" | sed -e 's/[\/&]/\\&/g' -e 's/"/\\"/g'
}

render_template() {
  local src="$1"
  local dest="$2"
  local id name purpose context lang owners instance record today
  id="$(escape_sed "$PROJECT_ID")"
  name="$(escape_sed "$PROJECT_NAME")"
  purpose="$(escape_sed "$PROJECT_PURPOSE")"
  context="$(escape_sed "$PROJECT_CONTEXT")"
  lang="$(escape_sed "$DOCUMENTATION_LANGUAGE")"
  owners="$(escape_sed "$OWNERS_JSON")"
  instance="$(escape_sed "$INSTANCE_PATH")"
  record="$(escape_sed "$RECORD_PATH")"
  today="$(escape_sed "$TODAY")"

  sed \
    -e "s/{{PROJECT_ID}}/$id/g" \
    -e "s/{{PROJECT_NAME}}/$name/g" \
    -e "s/{{PROJECT_PURPOSE}}/$purpose/g" \
    -e "s/{{PROJECT_CONTEXT}}/$context/g" \
    -e "s/{{DOCUMENTATION_LANGUAGE}}/$lang/g" \
    -e "s/{{PROJECT_OWNERS_JSON}}/$owners/g" \
    -e "s/{{INSTANCE_PATH}}/$instance/g" \
    -e "s/{{RECORD_PATH}}/$record/g" \
    -e "s/{{TODAY}}/$today/g" \
    "$src" >"$dest"
}

render_template "$TEMPLATE" "$INSTANCE_FILE"
echo "Created $INSTANCE_FILE"

if [[ "$WITH_DOCS" -eq 1 ]]; then
  mkdir -p "$REPO_ROOT/docs"
  STATE_FILE="$REPO_ROOT/docs/ProjectState.md"
  LOG_FILE="$REPO_ROOT/$RECORD_PATH"

  if [[ -f "$STATE_FILE" && "$FORCE" -ne 1 ]]; then
    echo "Skipped $STATE_FILE (already exists)."
  else
    render_template "$SCRIPT_DIR/templates/ProjectState.md" "$STATE_FILE"
    echo "Created $STATE_FILE"
  fi

  if [[ -f "$LOG_FILE" && "$FORCE" -ne 1 ]]; then
    echo "Skipped $LOG_FILE (already exists)."
  else
    render_template "$SCRIPT_DIR/templates/ai-collaboration-log.md" "$LOG_FILE"
    echo "Created $LOG_FILE"
  fi
fi

if command -v python3 >/dev/null 2>&1; then
  python3 -m json.tool "$INSTANCE_FILE" >/dev/null
  echo "JSON syntax: OK"
fi

if [[ -x "$ANYPLAN_ROOT/scripts/validate-guidance.sh" ]]; then
  echo ""
  echo "Next: validate against schema"
  echo "  $ANYPLAN_ROOT/scripts/validate-guidance.sh \"$INSTANCE_FILE\""
fi

echo ""
echo "Optional: open the visual engine (from Anyplan repo root):"
echo "  python3 -m http.server 5173"
echo "  # visit http://localhost:5173/engine/ and load your instance path when supported"
