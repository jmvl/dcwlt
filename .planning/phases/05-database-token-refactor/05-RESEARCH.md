# Phase 5: Database Token Refactor - Research

**Researched:** 2026-03-03
**Domain:** Convex database transactions, token balance management, Privy authentication
**Confidence:** HIGH

## Summary

This phase removes the Solana SPL token dependency and replaces it with a pure database (Convex) token system. The current architecture uses gas sponsorship (backend pays SOL fees) with Solana Pay QR codes containing `spl-token` parameters. The target architecture uses Convex atomic mutations for balance transfers, eliminating blockchain dependency entirely while keeping Privy for social auth.

**Primary recommendation:** Create a single atomic Convex mutation that debits sender balance, credits merchant balance, and creates transaction record in one ACID transaction. Convex guarantees atomicity via optimistic concurrency control (OCC).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Authentication Strategy
- **Keep Privy for social auth** - Privy handles Google/Apple OAuth, remains the authentication layer
- **Disable Solana wallet creation** - Privy config updated to not create embedded Solana wallets
- **Wallet addresses become opaque IDs** - Existing wallet addresses kept as user identifiers, no migration needed

#### Balance Management
- **Store balances in Convex wallets table** - Add `balance` field (number, in EVT tokens)
- **Atomic balance updates** - Use Convex transactions for debit/credit operations
- **No blockchain consensus needed** - Database is source of truth, not Solana

#### Payment Flow
- **Replace Solana transactions with Convex mutations** - Payment becomes: debit sender, credit merchant, create transaction record
- **Remove gas sponsorship backend** - `/api/sponsor-transaction` no longer needed
- **Simplify QR code format** - No longer need `spl-token` parameter in Solana Pay URLs

#### Data Migration
- **Migrate balances from Solana to Convex** - One-time script to read SPL token balances and populate database
- **Keep existing wallet addresses** - No changes to wallet address fields in any table
- **Transaction history preserved** - Only signature field becomes optional (no on-chain signature)

#### Code Removal
- **Remove @solana/web3.js from payment hooks** - usePayment no longer needs Solana imports
- **Remove @solana/spl-token dependency** - No SPL token operations
- **Remove gas sponsorship API route** - Delete `/api/sponsor-transaction`
- **Simplify useSolanaBalance hook** - Becomes useBalance, queries Convex instead of RPC

### Claude's Discretion
- Exact balance migration script implementation
- Error handling patterns for balance operations
- Whether to keep any Solana utilities for future use
- QR code format changes (keep Solana Pay compatible or simplify further?)

### Deferred Ideas (OUT OF SCOPE)
None - phase scope is well-defined.
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| convex | ^1.x | Database, real-time subscriptions, server functions | Already in use, provides ACID transactions |
| @privy-io/react-auth | ^2.x | Social authentication (Google/Apple OAuth) | Already in use, keep for auth only |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | ^5.x | Client-side query invalidation | Already in use for balance queries |
| qrcode | ^1.x | QR code generation | Keep for merchant QR codes |

### To Remove
| Library | Reason |
|---------|--------|
| @solana/web3.js | No longer needed - no blockchain transactions |
| @solana/spl-token | No longer needed - no SPL token operations |
| @solana/kit | No longer needed - no RPC calls |

**Installation:** No new packages needed. Removal commands:
```bash
cd pwa && npm uninstall @solana/web3.js @solana/spl-token
```

## Architecture Patterns

### Current Architecture (to be removed)
```
User scans QR
    → usePayment builds Solana transaction
    → Privy signs transaction
    → POST /api/sponsor-transaction
    → Backend signs as fee payer
    → Broadcasts to Solana Devnet
    → Updates Convex transaction status
```

### Target Architecture
```
User scans QR
    → usePayment calls Convex mutation
    → Mutation atomically:
       1. Validates sender balance
       2. Debits sender wallet
       3. Credits merchant wallet
       4. Creates transaction record (status=confirmed)
    → Real-time subscription updates both parties
```

### Recommended Project Structure
```
pwa/
├── convex/
│   ├── wallets.ts        # Add transferMutation (atomic debit/credit)
│   ├── transactions.ts   # Simplify - remove Solana-specific logic
│   └── schema.ts         # No changes needed
├── app/
│   ├── hooks/
│   │   ├── usePayment.ts      # Complete rewrite - Convex only
│   │   ├── useBalance.ts      # Rename from useSolanaBalance
│   │   └── useSolanaBalance.ts # DELETE
│   ├── api/
│   │   └── sponsor-transaction/ # DELETE entire directory
│   └── components/
│       ├── QRCodeGenerator.tsx # Simplify URL format
│       └── PrivyProvider.tsx   # Disable Solana wallet creation
└── src/
    └── utils/
        ├── transactions.ts     # DELETE (Solana utilities)
        └── solanaPay.ts        # Simplify or DELETE
```

### Pattern 1: Atomic Balance Transfer Mutation
**What:** Single mutation that atomically transfers balance between two wallets
**When to use:** All payment operations - ensures no partial state
**Example:**
```typescript
// Source: Convex documentation on OCC and atomic transactions
// https://docs.convex.dev/database/advanced/occ

export const transferBalance = mutation({
  args: {
    senderWalletAddress: v.string(),
    recipientWalletAddress: v.string(),
    amount: v.number(), // In EVT tokens (not lamports)
    merchantId: v.optional(v.id("merchants")),
    itemId: v.optional(v.id("groupItems")),
  },
  handler: async (ctx, args) => {
    // 1. Get sender wallet
    const senderWallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.senderWalletAddress))
      .first();

    if (!senderWallet) {
      throw new Error("Sender wallet not found");
    }

    // 2. Validate sufficient balance
    if (senderWallet.tokenBalance < args.amount) {
      throw new Error("Insufficient balance");
    }

    // 3. Get recipient wallet
    const recipientWallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.recipientWalletAddress))
      .first();

    if (!recipientWallet) {
      throw new Error("Recipient wallet not found");
    }

    // 4. Debit sender (atomic with rest of operation)
    await ctx.db.patch(senderWallet._id, {
      tokenBalance: senderWallet.tokenBalance - args.amount,
      fiatBalance: (senderWallet.tokenBalance - args.amount) * 0.1,
      updatedAt: Date.now(),
    });

    // 5. Credit recipient (atomic with rest of operation)
    await ctx.db.patch(recipientWallet._id, {
      tokenBalance: recipientWallet.tokenBalance + args.amount,
      fiatBalance: (recipientWallet.tokenBalance + args.amount) * 0.1,
      updatedAt: Date.now(),
    });

    // 6. Create transaction record (status is always confirmed for DB transfers)
    const transactionId = await ctx.db.insert("transactions", {
      merchantId: args.merchantId,
      itemId: args.itemId,
      customerWallet: args.senderWalletAddress,
      amount: args.amount,
      timestamp: Date.now(),
      status: "confirmed", // Always confirmed - no blockchain delay
      // signature is optional - leave undefined for DB transfers
    });

    return {
      success: true,
      transactionId,
      newSenderBalance: senderWallet.tokenBalance - args.amount,
    };
  },
});
```

### Pattern 2: Simplified usePayment Hook
**What:** Hook that calls Convex mutation instead of Solana transaction
**When to use:** All payment operations
**Example:**
```typescript
// Simplified usePayment - Convex only, no Solana
export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single mutation for atomic transfer
  const transferBalance = useMutation(api.wallets.transferBalance);

  const executePayment = useCallback(
    async (params: PaymentParams): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await transferBalance({
          senderWalletAddress: params.senderWalletAddress,
          recipientWalletAddress: params.recipient,
          amount: Number(params.amount), // Already in EVT, not lamports
          merchantId: params.merchantId,
          itemId: params.itemId,
        });

        return {
          success: true,
          transactionId: result.transactionId,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || "Payment failed",
        };
      } finally {
        setLoading(false);
      }
    },
    [transferBalance]
  );

  return { executePayment, loading, error };
}
```

### Pattern 3: Simplified QR Code Format
**What:** QR code without `spl-token` parameter
**When to use:** Merchant QR code generation
**Example:**
```typescript
// Current format (Solana Pay):
const solanaPayUrl = `solana:${merchantAddress}?amount=${itemPrice}&spl-token=${TOKEN_MINT_ADDRESS}&reference=${itemId}`;

// Simplified format (database tokens):
// Option A: Keep Solana Pay compatible (remove spl-token only)
const simplifiedUrl = `solana:${merchantAddress}?amount=${itemPrice}&reference=${itemId}`;

// Option B: Custom format (not Solana Pay compatible)
const customUrl = `dcwlt:${merchantAddress}?amount=${itemPrice}&reference=${itemId}`;
```

### Anti-Patterns to Avoid
- **Splitting debit and credit into separate mutations:** Breaks atomicity, can leave balances inconsistent
- **Keeping Solana RPC calls for balance queries:** Defeats the purpose - use Convex subscriptions
- **Not handling concurrent payments:** Convex OCC handles this, but validate balance in same mutation
- **Keeping signature field required:** Database transfers have no on-chain signature

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Atomic transactions | Manual begin/commit | Convex mutations | Built-in ACID, automatic rollback |
| Balance validation | Client-side check | Mutation validation | Server-side is authoritative |
| Real-time updates | Polling or webhooks | Convex subscriptions | Built-in, efficient |
| Concurrent payment conflicts | Manual locking | Convex OCC | Automatic conflict detection |

**Key insight:** Convex mutations are atomic by default. All db operations within a single mutation handler execute in one ACID transaction. If any operation fails or throws, all changes are rolled back automatically.

## Common Pitfalls

### Pitfall 1: Optimistic Concurrency Conflicts
**What goes wrong:** Two payments from same wallet at same time cause one to fail
**Why it happens:** Convex uses OCC - if read set changes between read and write, mutation retries
**How to avoid:** Convex handles this automatically with retries. Keep mutations fast.
**Warning signs:** Occasional "Transaction conflict" errors (normal, will auto-retry)

### Pitfall 2: Balance Inconsistency
**What goes wrong:** Sender debited but merchant not credited
**Why it happens:** Splitting operations across multiple mutations
**How to avoid:** Always use single mutation for debit + credit + transaction record
**Warning signs:** Sum of all balances doesn't match total supply

### Pitfall 3: Race Condition on Balance Check
**What goes wrong:** Balance check passes but debit fails due to concurrent payment
**Why it happens:** Checking balance in separate operation from debit
**How to avoid:** Check and debit in same mutation - Convex guarantees atomicity
**Warning signs:** "Insufficient balance" errors that shouldn't occur

### Pitfall 4: Keeping Unnecessary Solana Code
**What goes wrong:** Dead code, bundle size, confusion about data source
**Why it happens:** Fear of removing too much
**How to avoid:** Delete all Solana-related code - no blockchain dependency
**Warning signs:** @solana imports still present, RPC calls in codebase

### Pitfall 5: QR Code Backward Compatibility
**What goes wrong:** Old QR codes with `spl-token` parameter cause errors
**Why it happens:** Merchants have printed QR codes
**How to avoid:** Parser should ignore unknown parameters, only require `recipient` and `amount`
**Warning signs:** QR scan fails with "Invalid parameter" error

## Code Examples

### Simplified useBalance Hook
```typescript
// Rename from useSolanaBalance to useBalance
// Query Convex instead of Solana RPC

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useBalance(walletAddress: string | undefined) {
  const balance = useQuery(
    api.wallets.getBalance,
    walletAddress ? { walletAddress } : "skip"
  );

  return {
    balance: balance?.tokenBalance ?? 0,
    isLoading: balance === undefined,
  };
}
```

### Privy Config Without Solana Wallets
```typescript
// Disable Solana wallet creation
<PrivyProvider
  appId={appId}
  config={{
    // Remove solana RPC config entirely
    embeddedWallets: {
      solana: {
        createOnLogin: 'off', // Disable Solana wallet creation
      },
    },
    appearance: {
      theme: 'dark',
      accentColor: '#13a4ec',
    },
  }}
>
```

### Migration Script (Claude's Discretion)
```typescript
// One-time script to migrate SPL token balances to Convex
// Run from admin context with Solana access

import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

async function migrateBalances() {
  const connection = new Connection("https://api.devnet.solana.com");
  const tokenMint = new PublicKey("4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq");

  // Get all wallet addresses from Convex
  const wallets = await convex.query(api.wallets.getAllWallets);

  for (const wallet of wallets) {
    try {
      const walletPubkey = new PublicKey(wallet.walletAddress);
      const tokenAccount = await getAssociatedTokenAddress(tokenMint, walletPubkey);

      const balance = await connection.getTokenAccountBalance(tokenAccount);
      const onChainBalance = balance.value.uiAmount || 0;

      // Update Convex with on-chain balance
      await convex.mutation(api.wallets.updateBalance, {
        walletAddress: wallet.walletAddress,
        newTokenBalance: onChainBalance,
      });

      console.log(`Migrated ${wallet.walletAddress}: ${onChainBalance} EVT`);
    } catch (err) {
      // Token account doesn't exist - balance is 0
      await convex.mutation(api.wallets.updateBalance, {
        walletAddress: wallet.walletAddress,
        newTokenBalance: 0,
      });
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Solana SPL tokens | Convex database tokens | Phase 5 | Instant confirmation, no gas fees |
| Gas sponsorship backend | Not needed | Phase 5 | Simpler architecture |
| Solana Pay QR with spl-token | Simplified QR format | Phase 5 | Backward compatible |
| React Query for Solana RPC | Convex subscriptions | Phase 5 | Real-time by default |

**Deprecated/outdated:**
- Gas sponsorship pattern: No longer needed - no blockchain transactions
- SPL token ATA creation: No longer needed - database-only
- Solana RPC balance queries: Replaced by Convex subscriptions

## Open Questions

1. **QR Code Format**
   - What we know: Current format is Solana Pay compatible with `spl-token` parameter
   - What's unclear: Should we keep Solana Pay compatibility or switch to custom format?
   - Recommendation: Keep Solana Pay compatible format (remove `spl-token` only) for potential future blockchain integration

2. **Migration Timing**
   - What we know: Need one-time script to read SPL balances
   - What's unclear: When to run migration (before or after code deployment)?
   - Recommendation: Run migration before deploying new code, verify balances match

3. **Transaction Signature Field**
   - What we know: Field is optional in schema, currently populated with Solana signatures
   - What's unclear: Should we generate mock signatures for audit trail?
   - Recommendation: Leave field undefined for database transfers - cleaner than fake signatures

## Sources

### Primary (HIGH confidence)
- Convex OCC Documentation - https://docs.convex.dev/database/advanced/occ (atomic transactions, conflict handling)
- Convex Understanding - https://docs.convex.dev/understanding/ (ACID compliance, serializable isolation)
- Convex High-Throughput Mutations - https://stack.convex.dev/high-throughput-mutations-via-precise-queries (scaling patterns)

### Secondary (MEDIUM confidence)
- Project source code analysis - usePayment.ts, wallets.ts, transactions.ts, QRCodeGenerator.tsx
- STATE.md decision log - Previous architecture decisions and patterns

### Tertiary (LOW confidence)
- Privy documentation - embedded wallet configuration (need to verify `createOnLogin: 'off'` syntax)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Convex already in use, patterns well-documented
- Architecture: HIGH - Clear understanding of current and target architecture
- Pitfalls: HIGH - Convex OCC documentation is comprehensive
- Privy config: MEDIUM - Need to verify exact config syntax for disabling Solana wallets

**Research date:** 2026-03-03
**Valid until:** 30 days (Convex API stable, Privy config may change)
