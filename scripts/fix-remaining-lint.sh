#!/bin/bash

echo "🔧 Fixing remaining ESLint issues..."

# Run ESLint with auto-fix first
echo "📝 Running ESLint auto-fix..."
npm run lint:fix

# Run Prettier to fix formatting
echo "🎨 Running Prettier..."
npm run format

# Check remaining issues
echo "🔍 Checking remaining issues..."
npm run lint

echo "✅ Lint fixes completed!"