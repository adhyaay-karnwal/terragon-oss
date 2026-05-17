#!/bin/bash

# Script to uninstall the Rover CLI

set -e

echo "🗑️  Uninstalling Rover CLI..."

# Unlink the global package
echo "📦 Removing global link..."
npm unlink -g @rover-labs/cli

echo "✅ Rover CLI has been uninstalled!"
echo ""
echo "To reinstall, run:"
echo "  pnpm -C apps/cli install:dev"