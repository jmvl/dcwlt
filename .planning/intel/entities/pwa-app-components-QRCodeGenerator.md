---
path: /Users/jm/Codebase/dcwlt/pwa/app/components/QRCodeGenerator.tsx
type: component
updated: 2025-01-21
status: active
---

# QRCodeGenerator.tsx

## Purpose

QR code generation modal for merchant payments. Creates Solana Pay URL QR codes, displays payment received success state when transactions are detected via real-time subscription, and auto-dismisses after 5 seconds on success.

## Exports

- `QRCodeGenerator` - Modal QR generator with real-time payment detection

## Dependencies

- qrcode - QR code generation library
- api.transactions - Live merchant transaction subscription
- lucide-react - UI icons (X, CheckCircle2, ArrowRight)
- 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq - Event Token mint address on Solana Devnet

## Used By

TBD
