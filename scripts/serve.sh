#!/usr/bin/env bash
# Build doc-index.json, start HTTP server, and open the visual engine in a browser.
set -euo pipefail

INSTANCE=""
PORT=""
NO_BROWSER=0

usage() {
  cat <<'EOF'
Usage: scripts/serve.sh [instance] [port] [--no-browser]

  instance       Project id (default: anyplan)
  port           HTTP port (default: 5173)
  --no-browser   Do not open a browser tab (CI / SSH)

Environment:
  ANYPLAN_NO_BROWSER=1   Same as --no-browser

Examples:
  scripts/serve.sh
  scripts/serve.sh my-app 8080
  scripts/serve.sh anyplan 5173 --no-browser
EOF
}

for arg in "$@"; do
  case "$arg" in
    -h|--help)
      usage
      exit 0
      ;;
    --no-browser)
      NO_BROWSER=1
      ;;
    *)
      if [[ -z "$INSTANCE" ]]; then
        INSTANCE="$arg"
      elif [[ -z "$PORT" ]]; then
        PORT="$arg"
      else
        echo "Unknown argument: $arg" >&2
        usage >&2
        exit 1
      fi
      ;;
  esac
done

INSTANCE="${INSTANCE:-anyplan}"
PORT="${PORT:-5173}"
[[ "${ANYPLAN_NO_BROWSER:-}" == "1" ]] && NO_BROWSER=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
URL="http://localhost:${PORT}/engine/?instance=${INSTANCE}"

cd "$REPO_ROOT"

echo "==> Building document index for instance: $INSTANCE"
python3 "$SCRIPT_DIR/build-doc-index.py" --project-id "$INSTANCE" --repo-root "$REPO_ROOT"

if [[ -x "$SCRIPT_DIR/validate-doc-index.sh" ]]; then
  "$SCRIPT_DIR/validate-doc-index.sh" "$REPO_ROOT/instances/$INSTANCE/doc-index.json" || true
fi

open_browser() {
  if [[ "$NO_BROWSER" -eq 1 ]]; then
    return 0
  fi
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 &
  else
    python3 -m webbrowser "$URL" >/dev/null 2>&1 || true
  fi
}

echo ""
echo "==> Starting HTTP server on port $PORT"
echo "    $URL"

python3 -m http.server "$PORT" &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Brief pause so the server accepts connections before the browser opens.
sleep 0.4
open_browser

if [[ "$NO_BROWSER" -eq 0 ]]; then
  echo "    Browser opened (use --no-browser to skip)"
fi
echo "    Press Ctrl+C to stop"
echo ""

wait "$SERVER_PID"
