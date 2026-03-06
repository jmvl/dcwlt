#!/bin/bash
# ngrok-qr.sh - Start ngrok and display QR code
# Usage: ./ngrok-qr.sh [port]

# Function to read port input
read_port() {
  local default_port=3000
  local port

  if [ -t 0 ]; then
    # Interactive terminal
    read -p "Enter port number (default: $default_port): " port
    port=${port:-$default_port}
  else
    # Non-interactive, use default
    port=$default_port
  fi

  # Validate port is a number
  if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
    echo "Invalid port. Using default: $default_port"
    port=$default_port
  fi

  echo "$port"
}

# Get port from argument or prompt
if [ -n "$1" ]; then
  PORT=$1
else
  PORT=$(read_port)
fi

# Create directories
mkdir -p /tmp/ngrok
QR_DIR="/tmp/ngrok-qr"
mkdir -p "$QR_DIR"

# Kill any existing ngrok processes
pkill -f "ngrok.*http.*$PORT" 2>/dev/null
sleep 1

echo "═══════════════════════════════════════════════"
echo "  Starting ngrok tunnel on port $PORT"
echo "═══════════════════════════════════════════════"
echo ""

# Start ngrok
ngrok http $PORT --log=stdout > /tmp/ngrok/tunnel.log 2>&1 &
NGROK_PID=$!

# Wait for tunnel to be ready
echo "Waiting for tunnel to initialize..."
sleep 5

# Extract the tunnel URL
URL=$(grep -o 'https://[a-z0-9]\{8,\}\.ngrok[^"]*' /tmp/ngrok/tunnel.log | head -1)

if [ -n "$URL" ]; then
  # Generate QR code filename
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  QR_FILE="$QR_DIR/ngrok-qr-$TIMESTAMP.png"

  echo ""
  echo "═══════════════════════════════════════════════"
  echo "  NGROK TUNNEL ACTIVE"
  echo "═══════════════════════════════════════════════"
  echo ""
  echo "  🌐 Local Port: $PORT"
  echo "  🔗 Tunnel URL: $URL"
  echo ""

  # Save QR code to file
  echo "$URL" | qrencode -o "$QR_FILE" -s 10 2>/dev/null

  if [ -f "$QR_FILE" ]; then
    echo "  ✓ QR code saved to: $QR_FILE"
    echo ""

    # Try to open the QR code image
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      open "$QR_FILE" 2>/dev/null && echo "  ✓ QR code opened in Preview"
    elif command -v xdg-open &> /dev/null; then
      # Linux
      xdg-open "$QR_FILE" 2>/dev/null && echo "  ✓ QR code opened in image viewer"
    fi
    echo ""
  fi

  echo "  Scan QR code to access from your phone:"
  echo ""

  # Also display in terminal if supported
  echo "$URL" | qrencode -t ANSIUTF8 2>/dev/null || echo "  [QR code display not supported in terminal]"

  echo ""
  echo "═══════════════════════════════════════════════"
  echo ""
  echo "  Press Ctrl+C to stop the tunnel"
  echo ""
  echo "  Tunnel log: /tmp/ngrok/tunnel.log"
  echo "  Direct URL: $URL"
  echo "  QR image:   $QR_FILE"
  echo "═══════════════════════════════════════════════"
  echo ""

  # Handle graceful shutdown
  trap "echo ''; echo 'Stopping ngrok...'; kill $NGROK_PID 2>/dev/null; pkill -f 'tail.*ngrok' 2>/dev/null; exit" INT TERM

  # Keep script running and show ngrok activity
  tail -f /tmp/ngrok/tunnel.log &
  TAIL_PID=$!

  wait $NGROK_PID
  kill $TAIL_PID 2>/dev/null
else
  echo ""
  echo "❌ Failed to extract tunnel URL"
  echo ""
  echo "Log output:"
  head -30 /tmp/ngrok/tunnel.log
  echo ""
  echo "Make sure ngrok is properly configured."
  kill $NGROK_PID 2>/dev/null
  exit 1
fi
