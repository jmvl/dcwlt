---
path: /Users/jm/Codebase/dcwlt/pwa/app/api/sponsor-transaction/route.ts
type: api
updated: 2025-01-21
status: active
---

# sponsor-transaction/route.ts

## Purpose

API endpoint implementing gas sponsorship for Solana transactions. Receives partially signed transactions from clients, validates fee payer and security (unauthorized transfer checks), adds backend fee payer signature, and broadcasts to Solana Devnet with confirmation polling.

## Exports

- `POST` - API route handler for sponsored transactions

## Dependencies

- @solana/web3.js - Solana transaction processing and RPC connection
- bs58 - Base58 encoding/decoding for wallet keys
- FEE_PAYER_PRIVATE_KEY - Backend wallet keypair for gas sponsorship
- FEE_PAYER_ADDRESS - Expected fee payer address for validation
- NEXT_PUBLIC_SOLANA_RPC_URL - Solana RPC endpoint (default: Devnet)

## Used By

TBD
