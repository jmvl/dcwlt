#!/bin/bash

# event-wallet Environment Reset Script
# Clears caches, cleans builds, kills conflicting processes, and reinstalls dependencies

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Change to event-wallet directory
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)
print_status "Working in: $PROJECT_ROOT"

echo ""
print_status "=== Step 1: Checking for running processes ==="

# Check for processes using common ports
PORTS=(8081 19000 19001 19002 19006 3000 3001)
PROCESSES_TO_KILL=()

for port in "${PORTS[@]}"; do
    PID=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$PID" ]; then
        PROCESS_INFO=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
        print_warning "Port $port is in use by PID $PID ($PROCESS_INFO)"
        PROCESSES_TO_KILL+=($PID)
    fi
done

# Check for specific process names
PROCESS_NAMES=("node" "expo" "java" "gradle" "adb")
for proc_name in "${PROCESS_NAMES[@]}"; do
    PIDS=$(pgrep -f "$proc_name" 2>/dev/null || true)
    for pid in $PIDS; do
        # Check if it's related to our project
        CMD=$(ps -p $pid -o command= 2>/dev/null || echo "")
        if echo "$CMD" | grep -qE "(expo|react-native|metro|gradle|event-wallet)" 2>/dev/null; then
            print_warning "Found $proc_name process (PID $pid): $(echo $CMD | cut -c1-60)"
            PROCESSES_TO_KILL+=($pid)
        fi
    done
done

# Kill processes if any found
if [ ${#PROCESSES_TO_KILL[@]} -gt 0 ]; then
    echo ""
    print_warning "The following processes will be killed:"
    for pid in "${PROCESSES_TO_KILL[@]}"; do
        echo "  - PID $pid"
    done

    # Ask for confirmation unless --force flag is used
    if [ "$1" != "--force" ]; then
        echo ""
        read -p "Kill these processes? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Skipping process termination"
        else
            for pid in "${PROCESSES_TO_KILL[@]}"; do
                print_status "Killing PID $pid..."
                kill $pid 2>/dev/null || true
                sleep 0.5
                # Force kill if still running
                if ps -p $pid > /dev/null 2>&1; then
                    kill -9 $pid 2>/dev/null || true
                fi
            done
            print_success "Processes terminated"
            sleep 1
        fi
    else
        for pid in "${PROCESSES_TO_KILL[@]}"; do
            kill $pid 2>/dev/null || true
        done
        print_success "Processes terminated (force mode)"
    fi
else
    print_success "No conflicting processes found"
fi

echo ""
print_status "=== Step 2: Clearing Metro bundler cache ==="

# Clear Expo/Metro cache
if [ -d "$PROJECT_ROOT/.expo" ]; then
    print_status "Removing .expo directory..."
    rm -rf "$PROJECT_ROOT/.expo"
    print_success ".expo cache cleared"
fi

if [ -d "$PROJECT_ROOT/.expo-shared" ]; then
    print_status "Removing .expo-shared directory..."
    rm -rf "$PROJECT_ROOT/.expo-shared"
    print_success ".expo-shared cache cleared"
fi

# Clear Metro bundler cache
print_status "Clearing Metro bundler cache..."
npx expo start -c --non-interactive 2>/dev/null || true
print_success "Metro cache cleared"

echo ""
print_status "=== Step 3: Cleaning Android build ==="

if [ -d "$PROJECT_ROOT/android" ]; then
    cd android
    print_status "Running Gradle clean..."
    ./gradlew clean --no-daemon
    print_success "Android build cleaned"

    # Clean build cache
    print_status "Cleaning Gradle build cache..."
    ./gradlew cleanBuildCache --no-daemon 2>/dev/null || true
    print_success "Gradle build cache cleared"

    cd "$PROJECT_ROOT"
else
    print_warning "Android directory not found, skipping Gradle clean"
fi

echo ""
print_status "=== Step 4: Removing dependencies ==="

if [ -d "$PROJECT_ROOT/node_modules" ]; then
    print_status "Removing node_modules..."
    rm -rf node_modules
    print_success "node_modules removed"
fi

if [ -f "$PROJECT_ROOT/package-lock.json" ]; then
    print_status "Removing package-lock.json..."
    rm -f package-lock.json
    print_success "package-lock.json removed"
fi

echo ""
print_status "=== Step 5: Reinstalling dependencies ==="

print_status "Running npm install..."
npm install
print_success "Dependencies installed"

echo ""
print_status "=== Step 6: Final cleanup ==="

# Clear any watchman cache if present
if command -v watchman &> /dev/null; then
    print_status "Clearing watchman cache..."
    watchman watch-del-all 2>/dev/null || true
    print_success "Watchman cache cleared"
fi

# Clear temp directories
if [ -d "$PROJECT_ROOT/tmp" ]; then
    print_status "Clearing tmp directory..."
    rm -rf "$PROJECT_ROOT/tmp"/*
fi

echo ""
echo "=========================================="
print_success "Environment reset complete!"
echo "=========================================="
echo ""
echo "You can now start the development server with:"
echo "  npx expo start --clear"
echo ""
echo "Or run the Android app directly:"
echo "  npx expo run:android"
echo ""
