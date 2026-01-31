#!/bin/bash

# Script to build and install the Rover CLI as rover for development

set -e

echo "🚀 Building and installing Rover CLI as rover..."

# Get the script directory (apps/cli/scripts)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to the CLI directory (parent of scripts)
cd "$SCRIPT_DIR/.."

# Install dependencies if needed
echo "📦 Installing dependencies..."
pnpm install

# Build the CLI
echo "🔨 Building CLI..."
pnpm build

# Create a global link
echo "🔗 Creating global link..."

# Just run npm link - it will use the bin name from package.json
npm link

echo "✅ Rover CLI installed as rover!"
echo ""
echo "You can now use the 'rover' command from anywhere:"
echo "  rover auth - Authenticate with Rover"
echo "  rover pull <threadId> - Pull thread data"
echo ""
echo "To uninstall later, run:"
echo "  npm unlink -g @rover-labs/cli"