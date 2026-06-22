#!/bin/sh
set -eu

echo "Applying database migrations..."

for attempt in $(seq 1 30); do
  if npx --no-install prisma migrate deploy; then
    break
  fi

  if [ "$attempt" -eq 30 ]; then
    echo "Database migrations failed after $attempt attempts."
    exit 1
  fi

  echo "Database is not ready yet. Retrying in 2 seconds..."
  sleep 2
done

echo "Seeding categories..."
node dist/prisma/seed.js

echo "Starting backend API..."
exec node dist/src/server.js
