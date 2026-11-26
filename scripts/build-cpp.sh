#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cmake -S "$ROOT/engine/cpp" -B "$ROOT/build/cpp"
cmake --build "$ROOT/build/cpp" --config Release
echo "C++ core built successfully."
