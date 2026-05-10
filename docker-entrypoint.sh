#!/bin/sh
set -e

# Find server.js - in standalone mode it's at /app/server.js
if [ -f /app/server.js ]; then
  SERVER_PATH="/app/server.js"
elif [ -f /app/apps/www/server.js ]; then
  SERVER_PATH="/app/apps/www/server.js"
else
  echo "ERROR: server.js not found!"
  exit 1
fi

echo "Starting Next.js server ($SERVER_PATH)..."
node "$SERVER_PATH" &
NEXT_PID=$!

sleep 3

echo "Starting cron worker..."
node /app/cron-worker.mjs &
CRON_PID=$!

cleanup() {
  echo "Shutting down..."
  kill $NEXT_PID 2>/dev/null
  kill $CRON_PID 2>/dev/null
  wait
  exit 0
}

trap cleanup SIGTERM SIGINT

wait $NEXT_PID $CRON_PID
