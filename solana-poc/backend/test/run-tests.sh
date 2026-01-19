#!/bin/bash

# Test Runner Script for Solana POC Backend
# This script prepares the environment and runs tests

set -e

echo "=========================================="
echo "  Solana POC Backend Test Runner"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend server is running
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 3001 is already in use${NC}"
    echo "Please stop the backend server before running tests:"
    echo "  pkill -f 'node.*server.js' || kill \$(lsof -t -i:3001)"
    echo ""
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env with test encryption key..."
    echo "ENCRYPTION_KEY=$(node -e 'console.log(require(\"crypto\").randomBytes(32).toString(\"hex\"))')" > .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed${NC}"
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Check if token config exists
if [ ! -f data/token-config.json ]; then
    echo -e "${YELLOW}⚠️  Token configuration not found${NC}"
    echo "Some integration tests will fail without token setup."
    echo "To set up tokens, run: npm run setup:token"
    echo ""
    echo "Running tests without token configuration..."
    echo ""
else
    echo -e "${GREEN}✓ Token configuration found${NC}"
    echo ""
fi

# Run tests
echo "=========================================="
echo "  Running Tests"
echo "=========================================="
echo ""

npm test -- "$@"

# Exit with test status
TEST_STATUS=$?

echo ""
if [ $TEST_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "Common issues:"
    echo "1. Port 3001 already in use - Stop the backend server"
    echo "2. Token not configured - Run: npm run setup:token"
    echo "3. Dependencies missing - Run: npm install"
fi

exit $TEST_STATUS
