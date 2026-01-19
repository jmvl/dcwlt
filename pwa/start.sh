#!/bin/bash

# Start.sh script for PWA development
# Starts both Next.js dev server and Convex dev agent

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the pwa folder
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}Error: package.json not found. Are you in the pwa folder?${NC}"
    echo "Please run this script from the pwa directory."
    exit 1
fi

# Verify it's actually the pwa folder
if [[ ! -d "app" && ! -f "next.config.js" && ! -f "next.config.mjs" ]]; then
    echo -e "${YELLOW}Warning: This doesn't look like the pwa folder.${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}=== PWA Development Environment Starter ===${NC}"
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all development servers...${NC}"

    # Kill Convex dev
    if [[ -n "$CONVEX_PID" ]]; then
        echo "Stopping Convex dev agent (PID: $CONVEX_PID)..."
        kill $CONVEX_PID 2>/dev/null
    fi

    # Kill Next.js dev
    if [[ -n "$NEXT_PID" ]]; then
        echo "Stopping Next.js dev server (PID: $NEXT_PID)..."
        kill $NEXT_PID 2>/dev/null
    fi

    # Kill any lingering processes on ports
    lsof -ti:3000 | xargs -r kill -9 2>/dev/null
    pgrep -f "convex dev" | xargs -r kill -9 2>/dev/null

    echo -e "${GREEN}All servers stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# ============================================
# STEP 1: Start Convex Dev Agent
# ============================================
echo -e "${BLUE}[1/2]${NC} Starting Convex dev agent..."

# Check if Convex is already running
if pgrep -f "convex dev" > /dev/null; then
    echo -e "${YELLOW}Convex dev is already running${NC}"
else
    # Start Convex in background with deployment from env, redirect output to log file
    CONVEX_DEPLOYMENT=cool-flamingo-776 npx convex dev > /tmp/convex-dev.log 2>&1 &
    CONVEX_PID=$!

    # Wait for Convex to be ready
    echo -n "  Waiting for Convex..."
    for i in {1..30}; do
        if grep -q "Convex functions ready" /tmp/convex-dev.log 2>/dev/null; then
            echo -e " ${GREEN}✓ Ready${NC}"
            break
        fi
        echo -n "."
        sleep 0.2
    done

    # Check if Convex started successfully
    if ! kill -0 $CONVEX_PID 2>/dev/null; then
        echo -e " ${RED}✗ Failed${NC}"
        echo -e "${RED}Error: Convex dev failed to start${NC}"
        echo "Check /tmp/convex-dev.log for details"
        exit 1
    fi

    echo -e "  ${GREEN}PID: $CONVEX_PID${NC}"
fi

# ============================================
# STEP 2: Start Next.js Dev Server
# ============================================
echo -e "${BLUE}[2/2]${NC} Starting Next.js dev server..."

# Check if port 3000 is in use
PORT=3000
EXISTING_PID=$(lsof -ti:$PORT 2>/dev/null)

if [[ -n "$EXISTING_PID" ]]; then
    echo -e "${YELLOW}Port $PORT is in use (PID: $EXISTING_PID)${NC}"
    echo "  Killing existing process..."
    kill -9 $EXISTING_PID 2>/dev/null
    sleep 1
fi

# Start Next.js in background
npm run dev > /tmp/next-dev.log 2>&1 &
NEXT_PID=$!

# Wait for Next.js to be ready
echo -n "  Waiting for Next.js..."
for i in {1..60}; do
    if lsof -ti:$PORT > /dev/null; then
        echo -e " ${GREEN}✓ Ready${NC}"
        break
    fi
    echo -n "."
    sleep 0.5
done

# Check if Next.js started successfully
if ! kill -0 $NEXT_PID 2>/dev/null; then
    echo -e " ${RED}✗ Failed${NC}"
    echo -e "${RED}Error: Next.js failed to start${NC}"
    echo "Check /tmp/next-dev.log for details"
    cleanup
    exit 1
fi

echo -e "  ${GREEN}PID: $NEXT_PID${NC}"

# ============================================
# STARTUP COMPLETE
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Development environment ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Frontend:${NC}   http://localhost:3000"
echo -e "${BLUE}Convex logs:${NC} tail -f /tmp/convex-dev.log"
echo -e "${BLUE}Next logs:${NC}   tail -f /tmp/next-dev.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Keep script running and monitor processes
while true; do
    # Check if processes are still running
    if ! kill -0 $CONVEX_PID 2>/dev/null; then
        echo -e "${RED}✗ Convex dev agent died!${NC}"
        cleanup
        exit 1
    fi

    if ! kill -0 $NEXT_PID 2>/dev/null; then
        echo -e "${RED}✗ Next.js dev server died!${NC}"
        cleanup
        exit 1
    fi

    sleep 2
done
