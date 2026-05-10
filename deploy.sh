#!/bin/sh
set -e

echo "=== Terragon Deployment Script ==="

if [ ! -f .env.production ]; then
  echo "ERROR: .env.production not found!"
  echo "Copy .env.production.example to .env.production and fill in your values."
  exit 1
fi

echo "Building Docker images..."
docker compose build

echo "Pushing database schema..."
docker compose run --rm app node -e "
const { execSync } = require('child_process');
execSync('pnpm -C packages/shared drizzle-kit-push-prod', { stdio: 'inherit', env: process.env });
"

echo "Starting services..."
docker compose up -d

echo ""
echo "=== Deployment complete ==="
echo "App should be running at http://localhost:3000"
echo "Run 'docker compose logs -f' to see logs"
