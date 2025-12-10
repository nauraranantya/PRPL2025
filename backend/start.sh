#!/bin/bash
# Run migrations first
alembic upgrade head

# Then start the server
uvicorn app.main:app --host 0.0.0.0 --port $PORT
