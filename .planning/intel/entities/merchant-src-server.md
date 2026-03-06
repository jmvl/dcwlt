---
path: /Users/jm/Codebase/dcwlt/merchant/src/server.ts
type: service
updated: 2025-01-21
status: active
---

# merchant/src/server.ts

## Purpose

Merchant terminal server for generating payment QR codes. Provides /api/qr/:amount endpoint that generates Solana Pay QR codes for specified amounts, validates merchant wallet and token addresses, and serves static files for merchant terminal interface.

## Exports

- Express app - HTTP server with QR generation and status endpoints

## Dependencies

- express - HTTP server framework
- dotenv - Environment variable loading
- qrcode - QR code generation
- @solana/web3.js - Solana address validation
- MERCHANT_WALLET - Merchant wallet address for receiving payments
- TOKEN_ADDRESS - Event Token mint address

## Used By

TBD
