#!/bin/sh
set -e

echo "=== WestMarch Portal Startup ==="

echo "[1/3] Checking data directory..."
mkdir -p /app/data

echo "[2/3] Running database migrations..."
cd /app
npx prisma db push --skip-generate --accept-data-loss

echo "[3/3] Starting server..."
exec node server.js
