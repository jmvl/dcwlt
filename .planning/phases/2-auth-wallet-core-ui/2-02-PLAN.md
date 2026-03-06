---
phase: 2-auth-wallet-core-ui
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - pwa/package.json
  - pwa/convex/schema.ts
  - pwa/convex/users.ts
  - pwa/convex/wallets.ts
  - pwa/convex/_generated/api.ts
  - pwa/convex/_generated/dataModel.ts
  - pwa/convex/_generated/actions.ts
  - pwa/convex/.env.local
autonomous: true
must_haves:
  truths:
    - "Convex backend initialized with database schema"
    - "User schema exists with wallet address field"
    - "Wallet schema exists for balance tracking"
    - "Public query to get user by wallet address"
    - "Public query to get wallet balance"
  artifacts:
    - path: "pwa/convex/schema.ts"
      provides: "Convex database schema for users and wallets"
      min_lines: 20
      contains: "defineSchema"
    - path: "pwa/convex/users.ts"
      provides: "User queries and mutations"
      min_lines: 20
      exports: ["getOrCreateUser", "updateUser"]
    - path: "pwa/convex/wallets.ts"
      provides: "Wallet balance queries with real-time updates"
      min_lines: 20
      exports: ["getBalance", "updateBalance"]
  key_links:
    - from: "pwa/convex/users.ts"
      to: "pwa/convex/schema.ts"
      via: "v.access queries"
      pattern: "ctx.db.query.*users"
    - from: "pwa/convex/wallets.ts"
      to: "pwa/convex/schema.ts"
      via: "v.access queries"
      pattern: "ctx.db.query.*wallets"
---

<objective>
Set up Convex backend with user and wallet schemas for real-time balance tracking.

Purpose: Create the data layer that will store user wallet addresses and token balances, enabling real-time subscriptions for balance updates.

Output: Working Convex backend with users and wallets tables, plus queries for accessing data.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@pwa/package.json
</context>

<tasks>
<task type="auto">
  <name>Task 1: Install and initialize Convex</name>
  <files>pwa/package.json, pwa/convex/</files>
  <action>Install Convex dependencies and initialize project:

```bash
cd pwa
npm install convex
npx convex dev
```

When prompted:
- Select "Create a new project"
- Follow the setup flow (creates convex/ directory with schema.ts)
- This will generate:
  - convex/schema.ts (database schema)
  - convex/_generated/ directory (type-safe API)
  - .env.local with NEXT_PUBLIC_CONVEX_URL and CONVEX_DEPLOYMENT_KEY

Accept defaults for project name and deployment.
</action>
  <verify>convex/ directory exists with schema.ts and _generated/</verify>
  <done>Convex initialized with project</done>
</task>

<task type="auto">
  <name>Task 2: Define user and wallet schemas</name>
  <files>pwa/convex/schema.ts</files>
  <action>Replace default schema.ts with user and wallet tables:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User accounts - linked to Privy wallet addresses
  users: defineTable({
    // Primary identifier: Solana wallet address from Privy
    walletAddress: v.string(),
    // OAuth provider (google, apple)
    oauthProvider: v.optional(v.string()),
    // OAuth email (for recovery)
    email: v.optional(v.string()),
    // Account creation timestamp
    createdAt: v.number(),
    // Last active timestamp
    lastActiveAt: v.number(),
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_email", ["email"]),

  // Wallet balances - tracks token holdings
  wallets: defineTable({
    // Reference to users table
    userId: v.id("users"),
    // Wallet address (denormalized for queries)
    walletAddress: v.string(),
    // Event Token balance (in smallest unit, e.g., lamports)
    tokenBalance: v.number(),
    // Fiat equivalent (USD)
    fiatBalance: v.optional(v.number()),
    // Last balance update timestamp
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_wallet", ["walletAddress"]),
});
```

Key design decisions:
- walletAddress as primary user identifier (from Privy)
- Denormalized walletAddress in wallets table for efficient queries
- Separate tables for user profile vs wallet balance
- Timestamps for tracking activity
</action>
  <verify>schema.ts has users and wallets tables with indexes</verify>
  <done>Database schema defined</done>
</task>

<task type="auto">
  <name>Task 3: Create user queries and mutations</name>
  <files>pwa/convex/users.ts</files>
  <action>Create convex/users.ts with user operations:

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create user by wallet address
export const getOrCreateUser = mutation({
  args: {
    walletAddress: v.string(),
    oauthProvider: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (existing) {
      // Update last active
      await ctx.db.patch(existing._id, {
        lastActiveAt: Date.now(),
      });
      return existing;
    }

    // Create new user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      walletAddress: args.walletAddress,
      oauthProvider: args.oauthProvider,
      email: args.email,
      createdAt: now,
      lastActiveAt: now,
    });

    // Create wallet record with zero balance
    await ctx.db.insert("wallets", {
      userId,
      walletAddress: args.walletAddress,
      tokenBalance: 0,
      updatedAt: now,
    });

    return await ctx.db.get(userId);
  },
});

// Get current user by wallet address
export const getUser = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    return user;
  },
});
```
</action>
  <verify>users.ts has getOrCreateUser mutation and getUser query</verify>
  <done>User CRUD operations defined</done>
</task>

<task type="auto">
  <name>Task 4: Create wallet queries for balance</name>
  <files>pwa/convex/wallets.ts</files>
  <action>Create convex/wallets.ts with balance operations:

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get wallet balance by wallet address (for real-time subscriptions)
export const getBalance = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (!wallet) {
      return null;
    }

    return {
      tokenBalance: wallet.tokenBalance,
      fiatBalance: wallet.fiatBalance,
      updatedAt: wallet.updatedAt,
    };
  },
});

// Update wallet balance (called by backend top-up endpoint)
export const updateBalance = mutation({
  args: {
    walletAddress: v.string(),
    newTokenBalance: v.number(),
    fiatBalance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    await ctx.db.patch(wallet._id, {
      tokenBalance: args.newTokenBalance,
      fiatBalance: args.fiatBalance,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(wallet._id);
  },
});
```
</action>
  <verify>wallets.ts has getBalance query and updateBalance mutation</verify>
  <done>Wallet balance operations defined</done>
</task>

<task type="auto">
  <name>Task 5: Run convex dev to generate types</name>
  <files>pwa/convex/_generated/</files>
  <action>Run convex dev to generate type-safe API:

```bash
cd pwa
npx convex dev
```

This will:
- Read schema.ts
- Generate convex/_generated/api.ts (type-safe function references)
- Generate convex/_generated/dataModel.ts (TypeScript types)
- Generate convex/_generated/actions.ts
- Create .env.local with CONVEX deployment variables

Keep the dev command running to enable real-time updates during development.
</action>
  <verify>_generated/ directory contains api.ts, dataModel.ts, actions.ts</verify>
  <done>Type-safe Convex API generated</done>
</task>
</tasks>

<verification>
Before declaring plan complete:
- [ ] convex/ directory exists with schema.ts, users.ts, wallets.ts
- [ ] _generated/ directory contains type definitions
- [ ] Schema has users and wallets tables with proper indexes
- [ ] npx convex dev runs without errors
</verification>

<success_criteria>
- All tasks completed
- Convex backend initialized
- Schema defined for users and wallets
- Queries and mutations created
- Type-safe API generated
</success_criteria>

<output>
After completion, create `.planning/phases/2-auth-wallet-core-ui/2-02-SUMMARY.md` with:
- Accomplishments
- Files created/modified
- Decisions made
- Next phase readiness
</output>
