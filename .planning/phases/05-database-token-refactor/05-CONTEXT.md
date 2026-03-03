# Phase 5: Database Token Refactor - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning
**Source:** User discussion via /gsd:plan-phase

<domain>
## Phase Boundary

This phase removes the Solana SPL token dependency and replaces it with a pure database (Convex) token system. All token balances will be stored and managed in Convex, eliminating the need for blockchain transactions, gas sponsorship, and complex wallet signing flows.

**In Scope:**
- Remove all Solana/web3.js dependencies from payment flow
- Store balances in Convex wallets table
- Simplify payment flow to database mutations
- Remove gas sponsorship backend
- Keep Privy for social auth (Google/Apple login)
- Keep wallet addresses as user identifiers

**Out of Scope:**
- History page improvements (Phase 6)
- Offline support (Phase 6)
- New payment features
- UI changes beyond flow simplification
</domain>

<decisions>
## Implementation Decisions

### Authentication Strategy
- **Keep Privy for social auth** - Privy handles Google/Apple OAuth, remains the authentication layer
- **Disable Solana wallet creation** - Privy config updated to not create embedded Solana wallets
- **Wallet addresses become opaque IDs** - Existing wallet addresses kept as user identifiers, no migration needed

### Balance Management
- **Store balances in Convex wallets table** - Add `balance` field (number, in EVT tokens)
- **Atomic balance updates** - Use Convex transactions for debit/credit operations
- **No blockchain consensus needed** - Database is source of truth, not Solana

### Payment Flow
- **Replace Solana transactions with Convex mutations** - Payment becomes: debit sender, credit merchant, create transaction record
- **Remove gas sponsorship backend** - `/api/sponsor-transaction` no longer needed
- **Simplify QR code format** - No longer need `spl-token` parameter in Solana Pay URLs

### Data Migration
- **Migrate balances from Solana to Convex** - One-time script to read SPL token balances and populate database
- **Keep existing wallet addresses** - No changes to wallet address fields in any table
- **Transaction history preserved** - Only signature field becomes optional (no on-chain signature)

### Code Removal
- **Remove @solana/web3.js from payment hooks** - usePayment no longer needs Solana imports
- **Remove @solana/spl-token dependency** - No SPL token operations
- **Remove gas sponsorship API route** - Delete `/api/sponsor-transaction`
- **Simplify useSolanaBalance hook** - Becomes useBalance, queries Convex instead of RPC

### Claude's Discretion
- Exact balance migration script implementation
- Error handling patterns for balance operations
- Whether to keep any Solana utilities for future use
- QR code format changes (keep Solana Pay compatible or simplify further?)
</decisions>

<specifics>
## Specific Ideas

### Current Architecture (to be removed)
- `usePayment` hook builds Solana transactions, signs with Privy, sends to sponsor backend
- `useSolanaBalance` queries Solana RPC for SPL token balance
- `/api/sponsor-transaction` signs as fee payer and broadcasts to Solana
- Gas sponsorship required for every payment
- Complex transaction building with ATA creation, transfer instructions

### Target Architecture
- `usePayment` becomes simple: call Convex mutation to transfer balance
- `useBalance` queries Convex for balance (already real-time via subscriptions)
- No backend API needed for payments
- Instant confirmation (no blockchain wait)
- Simpler error handling (database errors only)

### Key Files to Modify
- `pwa/app/hooks/usePayment.ts` - Complete rewrite
- `pwa/app/hooks/useSolanaBalance.ts` - Rename to useBalance, query Convex
- `pwa/convex/wallets.ts` - Add balance field, transfer mutation
- `pwa/app/api/sponsor-transaction/route.ts` - Delete
- `pwa/app/topup/page.tsx` - Simplify to database update
- `pwa/src/lib/privy.ts` - Disable Solana wallet creation
</specifics>

<deferred>
## Deferred Ideas

None - phase scope is well-defined.

</deferred>

---

*Phase: 05-database-token-refactor*
*Context gathered: 2026-03-03 via /gsd:plan-phase*
