---
path: /Users/jm/Codebase/dcwlt/pwa/convex/merchants.ts
type: service
updated: 2025-01-21
status: active
---

# merchants.ts

## Purpose

Convex merchant account management. Handles merchant registration with pending status, approval/rejection workflow, email lookup, wallet address updates, and admin queries for merchant management dashboard.

## Exports

- `registerMerchant` - Register new merchant with pending status
- `getMerchantByEmail` - Lookup merchant by email
- `getPendingMerchants` - Get all pending merchants (admin review)
- `getMerchantByWallet` - Lookup merchant by wallet address (payment routing)
- `approveMerchant` - Approve pending merchant application
- `rejectMerchant` - Reject merchant application with reason
- `getAllMerchants` - Get all merchants sorted by created date
- `getMerchantsByStatus` - Get merchants filtered by status
- `getMerchantWithDetails` - Get merchant by ID with full details
- `updateMerchantWalletAddress` - Update merchant's wallet address

## Dependencies

- convex/server - Mutation and query handlers
- convex/values - Argument validators

## Used By

TBD
