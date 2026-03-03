---
path: /Users/jm/Codebase/dcwlt/pwa/src/utils/transactions.ts
type: util
updated: 2025-01-21
status: active
---

# transactions.ts

## Purpose

Solana SPL token transaction utilities for Event Token operations. Builds versioned SPL token transfer transactions with ATA creation, formats token amounts between display and base units, and fetches token balances from Solana Devnet.

## Exports

- `buildSPLTokenTransfer(params)` - Builds unsigned SPL token transfer transaction
- `formatTokenAmount(amountLamports)` - Converts base units to display format
- `parseTokenAmount(amountTokens)` - Converts display format to base units
- `getSPLTokenBalance(walletAddress, tokenMintAddress)` - Fetches balance from Solana
- `BuildTransferParams` - Transaction parameters interface
- `TOKEN_DECIMALS` - Event token decimals constant (9)
- `DEVNET_RPC` - Solana Devnet RPC URL constant

## Dependencies

- @solana/web3.js - Solana transaction building and RPC connection
- @solana/spl-token - SPL token instructions and ATA utilities

## Used By

TBD
