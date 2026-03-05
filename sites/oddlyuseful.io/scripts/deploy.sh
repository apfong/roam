#!/bin/bash

# Deploy oddlyuseful.io to Vercel
# Usage: ./scripts/deploy.sh [--prod]

set -e

echo "🚀 Deploying oddlyuseful.io to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Change to project directory
cd "$(dirname "$0")/.."

# Check if we have a Vercel token
if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  VERCEL_TOKEN environment variable not set"
    echo "   Please set it or run 'vercel login' first"
fi

# Deploy based on flag
if [ "$1" == "--prod" ] || [ "$1" == "-p" ]; then
    echo "📦 Deploying to production..."
    vercel --prod
else
    echo "📦 Deploying to preview..."
    vercel
fi

echo "✅ Deploy complete!"
echo ""
echo "💡 To deploy to production next time:"
echo "   ./scripts/deploy.sh --prod"
echo ""
echo "🔗 Manage deployments:"
echo "   https://vercel.com/dashboard"