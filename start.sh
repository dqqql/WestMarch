#!/bin/sh
set -e

echo "=== WestMarch Portal Startup ==="

echo "[1/3] Checking database..."
if [ ! -f /app/data/dev.db ]; then
    echo "Database not found, creating new database..."
    touch /app/data/dev.db
fi

echo "[2/3] Running database migrations..."
cd /app
npx prisma db push --skip-generate

echo "[3/3] Starting server..."
exec node server.js
