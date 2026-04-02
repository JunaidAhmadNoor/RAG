#!/usr/bin/env bash
set -euo pipefail

# Railway/Railpack expects a start script at the build root.
# We run uvicorn from the FastAPI app package under `backend/app`.
cd "$(dirname "$0")"

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"

