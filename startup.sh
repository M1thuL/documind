#!/bin/bash
# Azure App Service startup script
# Set as the startup command in Azure portal:
#   bash startup.sh

# Ensure /tmp dirs exist
mkdir -p /tmp/chroma_db

# Start with gunicorn (more stable than uvicorn on Azure free tier)
# Azure assigns the port via $PORT env var, default 8000
python -m gunicorn app.main:app \
  --workers 1 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind "0.0.0.0:${PORT:-8000}" \
  --timeout 120 \
  --keep-alive 5 \
  --log-level info
