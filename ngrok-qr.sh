#!/bin/bash
# ngrok-qr.sh - Start ngrok and display QR code

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

# Create log directory
mkdir -p /tmp/ngrok

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
  clear
  echo "═══════════════════════════════════════════════"
  echo "  NGROK TUNNEL ACTIVE"
  echo "═══════════════════════════════════════════════"
  echo ""
  echo "  🌐 Local Port: $PORT"
  echo "  🔗 Tunnel URL: $URL"
  echo ""
  echo "  Scan QR code to access from your phone:"
  echo ""
  echo "$URL" | qrencode -t ANSIUTF8
  echo ""
  echo "═══════════════════════════════════════════════"
  echo ""
  echo "  Press Ctrl+C to stop the tunnel"
  echo ""
  echo "  Tunnel log: /tmp/ngrok/tunnel.log"
  echo "═══════════════════════════════════════════════"
  echo ""

  # Handle graceful shutdown
  trap "echo ''; echo 'Stopping ngrok...'; kill $NGROK_PID 2>/dev/null; exit" INT TERM

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
