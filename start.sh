#!/bin/sh
set -e

echo "=== WestMarch Portal Startup ==="

echo "[1/2] Running database migrations..."
cd /app
npx prisma db push --skip-generate

echo "[2/2] Starting server..."
exec node server.js
