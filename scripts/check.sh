#!/usr/bin/env bash
set -euo pipefail
echo "Checking Zaad project structure..."
test -f web/index.html
test -f web/app.js
test -f engine/cpp/zaad_core.cpp
test -f backend/python/main.py
test -f database/schema.sql
echo "Core files are present."
