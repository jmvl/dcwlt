---
path: /Users/jm/Codebase/dcwlt/pwa/src/utils/solanaPay.ts
type: util
updated: 2025-01-21
status: active
---

# solanaPay.ts

## Purpose

Solana Pay URL parser and validator. Parses Solana Pay URLs matching format `solana:<address>?amount=X&spl-token=TOKEN&reference=REF&label=LBL&message=MSG`. Validates URL scheme and Base58 address format, extracts all query parameters, and provides type-safe interfaces.

## Exports

- `isValidSolanaPayURL(url)` - Validates Solana Pay URL format
- `parseSolanaPayURL(url)` - Parses URL into components (recipient, amount, splToken, reference, label, message)
- `ParsedSolanaPayURL` - TypeScript interface for parsed URL
- `SOLANA_PAY_URL_PATTERN` - Regex pattern for validation

## Dependencies

- None (standard URL and regex APIs)

## Used By

TBD
