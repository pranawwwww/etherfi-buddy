#!/bin/sh
echo "PORT is set to: $PORT"
exec gunicorn main:app --bind "0.0.0.0:${PORT}" --workers 4 --worker-class uvicorn.workers.UvicornWorker --timeout 60
