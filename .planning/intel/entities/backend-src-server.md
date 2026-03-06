---
path: /Users/jm/Codebase/dcwlt/backend/src/server.ts
type: service
updated: 2025-01-21
status: active
---

# backend/src/server.ts

## Purpose

Backend server for simulated Visa top-up flow. Loads bank wallet keypair from file, provides /api/topup endpoint that transfers Event Tokens from bank wallet to user wallet on Solana Devnet, and includes health check and status endpoints.

## Exports

- Express app - HTTP server with top-up, health, and status endpoints

## Dependencies

- express - HTTP server framework
- cors - Cross-origin middleware
- dotenv - Environment variable loading
- @solana/web3.js - Solana transaction building and RPC
- @solana/spl-token - SPL token transfer instructions
- BANK_WALLET_PATH - Path to bank wallet keypair file
- TOKEN_ADDRESS - Event Token mint address

## Used By

TBD
