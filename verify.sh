#!/bin/bash

echo "Verifying Infracost MCP Server Installation..."
echo ""

# Check Node.js version
echo "1. Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "   Node.js: $NODE_VERSION"

# Check if required files exist
echo ""
echo "2. Checking required files..."
FILES=(
  "dist/index.js"
  "dist/api.js"
  "dist/cli.js"
  "dist/tools.js"
  "dist/types.js"
  "package.json"
  "tsconfig.json"
  ".env"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✓ $file exists"
  else
    echo "   ✗ $file missing"
  fi
done

# Check if index.js is executable
echo ""
echo "3. Checking executable permissions..."
if [ -x "dist/index.js" ]; then
  echo "   ✓ dist/index.js is executable"
else
  echo "   ✗ dist/index.js is not executable"
fi

# Check environment variables
echo ""
echo "4. Checking environment variables..."
if [ -f ".env" ]; then
  source .env
  if [ -n "$INFRACOST_SERVICE_TOKEN" ]; then
    echo "   ✓ INFRACOST_SERVICE_TOKEN is set"
  else
    echo "   ✗ INFRACOST_SERVICE_TOKEN is not set"
  fi

  if [ -n "$INFRACOST_API_KEY" ]; then
    echo "   ✓ INFRACOST_API_KEY is set"
  else
    echo "   ✗ INFRACOST_API_KEY is not set"
  fi
else
  echo "   ✗ .env file not found"
fi

# Check if infracost CLI is installed (optional)
echo ""
echo "5. Checking Infracost CLI (optional)..."
if command -v infracost &> /dev/null; then
  INFRACOST_VERSION=$(infracost --version)
  echo "   ✓ Infracost CLI is installed: $INFRACOST_VERSION"
else
  echo "   ℹ Infracost CLI not found (optional - required for CLI-based tools)"
fi

echo ""
echo "Verification complete!"
echo ""
echo "To start the server, run:"
echo "  npm start"
echo ""
echo "Or directly:"
echo "  node dist/index.js"
