#!/usr/bin/env bash
set -euo pipefail

mkdir -p wc2026-oracle/backend/data/raw
mkdir -p wc2026-oracle/backend/data/processed
mkdir -p wc2026-oracle/backend/model
mkdir -p wc2026-oracle/backend/api
mkdir -p wc2026-oracle/frontend/src/components
mkdir -p wc2026-oracle/frontend/src/pages

touch wc2026-oracle/backend/model/train.py
touch wc2026-oracle/backend/model/predict.py
touch wc2026-oracle/backend/model/simulator.py
touch wc2026-oracle/backend/api/main.py
touch wc2026-oracle/backend/requirements.txt
touch wc2026-oracle/backend/Dockerfile
touch wc2026-oracle/frontend/src/App.jsx
touch wc2026-oracle/frontend/package.json
touch wc2026-oracle/README.md
