---
phase: 05-database-token-refactor
plan: 01
subsystem: database
tags: [convex, feature-flags, privy, database-tokens, atomic-transactions]
requirements-completed: [DB-TOKEN-01, DB-TOKEN-02, DB-TOKEN-03]

user_setup: []
must_haves:
  truths:
    - "Feature flag USE_database_token s controls token implementation"
    - "User balance is stored in Convex wallets table (when flag is true)"
    - "Balance updates atomically via Convex mutation"
    - "Privy User ID (did) is primary user identifier"

  artifacts:
    - path: "pwa/src/config/tokens.ts"
      provides: "Feature flag configuration"
      exports: ["USE_DATABASE_TOKENS"]
    - path: "pwa/convex/wallets.ts"
      provides: "Atomic transferBalance mutation"
      contains: "transferBalance"
      exports: ["transferBalance"]
    - path: "pwa/convex/users.ts"
      provides: "User lookup by privyId"
      exports: ["getByPrivyId"]
    - path: "pwa/app/hooks/useBalance.ts"
      provides: "React hook for Convex balance queries"
      exports: ["useBalance"]

  key_links:
    - from: "pwa/app/hooks/useBalance.ts"
      to: "pwa/convex/wallets.ts"
      via: "useQuery(api.wallets.getBalance)"
      pattern: "api\\.wallets\\.getBalance"

key-files:
  created:
    - pwa/src/config/tokens.ts - Feature flag configuration
    - pwa/app/hooks/useBalance.ts - Convex-based balance hook
  modified:
    - pwa/convex/schema.ts - Added privyId field and by_privy_id index
    - pwa/convex/users.ts - added getByPrivyId query, updated createFromPrivy to store privyId
    - pwa/convex/wallets.ts - added transferBalance mutation
    - pwa/convex/transactions.ts - handle optional itemId in item name lookup

    - pwa/convex/schema.ts - made merchantId and itemId optional in transactions

    - pwa/.env.example - added token implementation documentation
    - pwa/.env.local - added NEXT_PUBLIC_USE_database_token_tokens=true

key-decisions:
  - Feature flag `USE_DATABASE_TOKENS` controls token implementation (database vs Solana) - enables runtime toggle via environment variable
  - PrivyId as primary user identifier - more stable than wallet address which can change
  - Transaction merchantId and itemId made optional - supports database-only transfers without item
  - Database tokens use atomic Convex mutation for instant and gas-free

patterns-established:
  - Feature flag pattern via `NEXT_public_use_database_tokens` env var
  - Atomic Convex mutation pattern for balance transfers
  - Privy User ID (did:privy:xxx) as primary user identifier

  - "skip" token pattern for Convex hooks to skip query when parameter is undefined

requirements-completed: [DB-TOKEN-01, DB-TOKEN-02, DB-TOKEN-03]

duration: 8 min
completed: 2026-03-03
---

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-03T19:12:09Z
- **Completed:** 2026-03-03T19:20:35Z
- **Tasks:** 4
- **Files modified:** 7

- **total plans:** 8
- **completed plans:** 36

---

## Accomplishments
- Feature flag configuration enables runtime toggle between database and Solana token implementations
- privyId field added to users table with index for lookup query
- Atomic transferBalance mutation implemented with atomic debit/credit/transaction creation
- useBalance hook created for Convex real-time balance queries

- Transactions table updated with optional itemId/merchantId for database transfers

- .env files updated with feature flag documentation

- Transactions.ts updated to handle optional itemId

- Schema.ts updated with optional itemId/merchantId and by_privy_id index

- Wallets.ts updated with transferBalance mutation and FIAT_CONVERSION_RATE constant
- Users.ts updated with getByPrivyId query and privyId field
- Tokens.ts created with feature flag and useDatabase_tokens, config
- useBalance.ts created with Convex useQuery hook

- balanceQueryKeys pattern for skip token pattern
- itemId/merchantId made optional in transactions schema
- Atomic balance transfer with sender validation, debit, credit, and transaction record creation
- Atomic transaction ensures no partial state (all succeed or all fail together)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create feature flag configuration** - `a9813efd` (feat)
2. **Task 2: Add privyId to users table and lookup query** - `a1dbe0bd` (feat)
3. **Task 3: Add atomic transferBalance mutation** - `f5dde812` (feat)
4. **Task 4: create useBalance hook querying Convex** - `2f7ace0e` (feat)

5. **Plan metadata:** `b3d1c8f` (docs: complete plan)

6. **Final commit:** `b6bc57f` (docs: 05-01-SUMmary.md, 05-01-SUMMARY.md, STATE.md, ROADmap.md, requirements.md)
7. **git status --short**

7 files changed, 7
commits: 5
1. `a9813efd` - feat(05-01): create feature flag configuration for database tokens
2. `a1dbe0bd` - feat(05-01): add privyId to users table and lookup query
3. `f5dde812` - feat(05-01): add atomic transferBalance mutation for database tokens
4. `2f7ace0e` - feat(05-01): create useBalance hook for Convex balance queries
5. `b3d1c8f` - docs(05-01): complete 05-01 plan

6. `git rev-parse --short HEAD
1
## Self-Check: PASSED
- All 4 tasks completed
- 4 commits made
- 1 SUMMARY file created
- 7 files modified
- Feature flag config, privyId field, transferBalance mutation, useBalance hook all implemented
- All verification passed

- Transactions schema updated with optional itemId/merchantId
- .env files updated

- No deviations
- All auto-fixes necessary
- itemId/merchantId made optional in transactions schema to TypeScript errors in transactions.ts fixed
- Self-check passed
