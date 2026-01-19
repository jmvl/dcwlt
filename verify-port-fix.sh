#!/bin/bash

# Port Fix Verification Script
# This script verifies that the port conflict fix is working correctly

echo "=================================="
echo "Port Fix Verification"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check merchant configuration
echo "Checking merchant configuration..."
if grep -q "PORT=3001" /Users/jm/Codebase/dcwlt/merchant/.env; then
    echo -e "${GREEN}✓${NC} Merchant .env has PORT=3001"
else
    echo -e "${RED}✗${NC} Merchant .env missing PORT=3001"
fi

if grep -q "process.env.PORT || 3001" /Users/jm/Codebase/dcwlt/merchant/src/server.ts; then
    echo -e "${GREEN}✓${NC} Merchant server.ts defaults to 3001"
else
    echo -e "${RED}✗${NC} Merchant server.ts missing default 3001"
fi

echo ""
echo "Checking solana-poc configuration..."
if grep -q "process.env.PORT || 3002" /Users/jm/Codebase/dcwlt/solana-poc/backend/server.js; then
    echo -e "${GREEN}✓${NC} Solana POC server.js defaults to 3002"
else
    echo -e "${RED}✗${NC} Solana POC server.js missing default 3002"
fi

echo ""
echo "Running configuration tests..."
node /Users/jm/Codebase/dcwlt/test-port-simple.test.js

echo ""
echo "=================================="
echo "Verification Complete"
echo "=================================="
