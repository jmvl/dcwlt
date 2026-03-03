---
path: /Users/jm/Codebase/dcwlt/pwa/app/confirm-payment/page.tsx
type: component
updated: 2025-01-21
status: active
---

# confirm-payment/page.tsx

## Purpose

Payment confirmation page for Solana Pay transactions. Displays payment details from QR code scan, validates parameters, executes token transfer using sponsored transaction flow, and shows success/error states with explorer links.

## Exports

- `ConfirmPaymentPage` - Payment confirmation page with transaction execution

## Dependencies

- [[pwa-app-components-PaymentConfirmation]] - Payment details display component
- [[pwa-app-hooks-usePayment]] - Sponsored transaction execution hook
- [[pwa-src-utils-transactions]] - Token amount parsing utilities
- api.merchants - Convex merchant lookup for payment routing
- api.transactions - Convex transaction record creation

## Used By

TBD
