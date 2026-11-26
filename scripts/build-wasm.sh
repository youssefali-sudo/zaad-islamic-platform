#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if ! command -v emcc >/dev/null 2>&1; then
  echo "Emscripten (emcc) is required to build the browser WebAssembly module." >&2
  exit 1
fi
emcc "$ROOT/engine/cpp/wasm_api.cpp" -O3 -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_zaad_clamp_counter","_zaad_completed_total","_zaad_page_goal_remaining"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -o "$ROOT/web/zaad-core.js"
echo "C++ WebAssembly module generated in web/."
