# Phase 5: Database Token Refactor - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning (UPDATED with feature flag decision)
**Source:** User discussion via /gsd:plan-phase

<domain>
## Phase Boundary

This phase adds a database-based token system as an alternative to Solana SPL tokens, with a feature flag to toggle between implementations. All token balances can be stored in Convex, with the option to switch back to blockchain if needed.

**In Scope:**
- Add feature flag `USE_DATABASE_TOKENS` to toggle between implementations
- Store balances in Convex wallets table (when flag is true)
- Create database-based payment flow (when flag is true)
- Keep Solana code behind feature flag (can re-enable later)
- Keep Privy for social auth (Google/Apple login)
- Use Privy User ID (did) as user identifier instead of wallet address

**Out of Scope:**
- History page improvements (Phase 6)
- Offline support (Phase 6)
- New payment features
- UI changes beyond flow simplification
- Removing Solana dependencies entirely (keep for feature flag)
</domain>

<decisions>
## Implementation Decisions

### Authentication Strategy
- **Keep Privy for social auth** - Privy handles Google/Apple OAuth, remains the authentication layer
- **Keep Solana wallet creation enabled** - Privy still creates wallets (needed if we switch back)
- **Use Privy User ID as primary identifier** - `user.id` (did:privy:xxx) instead of wallet address
- **Wallet address still available** - Kept for Solana mode, but not primary key

### Feature Flag Architecture
- **Environment variable** - `USE_DATABASE_TOKENS=true|false`
- **Default to database** - New installations use database by default
- **Runtime toggle** - Can switch without code deploy (via env var)
- **Graceful migration** - Existing users with Solana balances can be migrated

### Balance Management
- **Store balances in Convex wallets table** - Add `balance` field (number, in EVT tokens)
- **Atomic balance updates** - Use Convex transactions for debit/credit operations
- **Dual-track during migration** - Both Solana and database balances can exist

### Payment Flow
- **Feature-flagged implementations** - `usePayment` switches based on flag
- **Database mode**: Convex mutations (instant, no gas)
- **Solana mode**: Existing blockchain flow (gas sponsorship)
- **QR code format unchanged** - Keep Solana Pay format for compatibility

### Data Model Changes
- **Add `privyId` field to users table** - Primary identifier (did:privy:xxx)
- **Add `balance` field to wallets table** - Database token balance
- **Keep `walletAddress` field** - Still needed for Solana mode
- **Migration script** - Copy Solana balances to database field

### Claude's Discretion
- Exact feature flag implementation (env var vs config file)
- Migration script timing and execution
- Error handling patterns for balance operations
- Whether to sync balances between Solana and database
</decisions>

<specifics>
## Specific Ideas

### Feature Flag Implementation
```typescript
// src/config/tokens.ts
export const USE_DATABASE_TOKENS = process.env.NEXT_PUBLIC_USE_DATABASE_TOKENS === 'true';

// usePayment hook
export function usePayment(senderWalletAddress: string | undefined, senderPrivyId: string | undefined) {
  if (USE_DATABASE_TOKENS) {
    return useDatabasePayment(senderPrivyId);
  } else {
    return useSolanaPayment(senderWalletAddress);
  }
}
```

### Current Architecture (Solana mode)
- `usePayment` hook builds Solana transactions, signs with Privy, sends to sponsor backend
- `useSolanaBalance` queries Solana RPC for SPL token balance
- `/api/sponsor-transaction` signs as fee payer and broadcasts to Solana
- Gas sponsorship required for every payment

### Target Architecture (Database mode)
- `usePayment` calls Convex mutation to transfer balance
- `useBalance` queries Convex for balance (real-time via subscriptions)
- No backend API needed for payments
- Instant confirmation (no blockchain wait)

### Key Files to Modify
- `pwa/src/config/tokens.ts` - NEW: Feature flag configuration
- `pwa/app/hooks/usePayment.ts` - Add feature flag branching
- `pwa/app/hooks/useBalance.ts` - NEW: Database balance hook
- `pwa/convex/wallets.ts` - Add balance field, transfer mutation
- `pwa/convex/users.ts` - Add privyId field, lookup by privyId
- `pwa/app/topup/page.tsx` - Add feature flag branching
- Existing Solana hooks - Keep but conditionally use
</specifics>

<deferred>
## Deferred Ideas

None - phase scope is well-defined.

</deferred>

---

*Phase: 05-database-token-refactor*
*Context gathered: 2026-03-03 via /gsd:plan-phase*
*Updated: 2026-03-03 with feature flag and Privy ID decisions*
