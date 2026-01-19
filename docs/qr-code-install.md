# PWA Installation QR Code

The QR code in `pwa/public/qr-code.png` links to the Event Wallet PWA.

## Usage

- Print on stadium seat backs
- Include on event flyers
- Display at venue entrance

## User Flow

1. User scans QR code with phone camera
2. Opens in default browser (Chrome/Safari)
3. Sees "Install Event Wallet" prompt (on 2nd visit or via manual trigger)
4. Installs PWA to home screen
5. Opens app in standalone mode (no browser UI)

## Testing

For local testing, generate QR code with:
- URL: `http://localhost:3000` (must be on same network)
- Use: `qrcode "http://192.168.x.x:3000" > qr-code.png`

## Production

For production, regenerate the QR code with your production URL:
```bash
cd pwa
node generate-qr.js  # Uses localhost
# Or manually specify:
qrcode "https://your-domain.com" > public/qr-code.png
```

## Current QR Code

The current QR code points to: `http://192.168.1.172:3000`

This is the local network IP for testing. Update for production deployment.
