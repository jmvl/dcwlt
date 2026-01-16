# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Frictionless payments at scale
**Current focus:** Ready for Phase 3 Top-Up + Payments

## Current Position

Phase: 3 of 4 (Top-Up + Payments) - Next phase
Plan: Planning phase
Status: Phase 2 complete, ready to proceed
Last activity: 2026-01-16 — Phase 2 verified complete (15/15 must-haves)

Progress: ████████░░ 62%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 11.9 min
- Total execution time: 1.39 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1-pwa-foundation | 3 | 3 | 11.5 min |
| 2-auth-wallet-core-ui | 4 | 7 | 12.0 min |

**Recent Trend:**
- Last 3 plans: 17 min (2-01), 0 min (2-02 - already complete), 1 min (2-03), 17 min (2-04)
- Trend: Steady pace, SSR build fixes added time to 2-04

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

**From Plan 1-01:**
1. Used `@ducanh2912/next-pwa` instead of `next-pwa` - actively maintained for Next.js 16
2. Added `turbopack: {}` config to resolve webpack/turbopack conflict with PWA plugin
3. Separated viewport export for Next.js 16 compatibility (themeColor, viewport config)
4. Created Python PIL script for icon generation (portable, no ImageMagick dependency)
5. Used single `"purpose": "any"` value instead of `"any maskable"` due to TypeScript type constraints

**From Plan 1-02:**
6. Used Serwist instead of Workbox - Next.js 16 compatible, actively maintained
7. Created JavaScript service worker instead of TypeScript - inject-manifest CLI doesn't compile TS
8. Manual service worker registration - @serwist/next auto-registration broken with Turbopack
9. CLI-based SW generation - bypassed Turbopack compatibility issue with @serwist/next plugin
10. Cache strategies: CacheFirst for Google Fonts, StaleWhileRevalidate for static assets, NetworkFirst for API calls

**From Plan 1-03:**
11. localStorage for visit tracking - prompts on 2nd visit (not aggressive)
12. Separate iOS component - Safari doesn't support beforeinstallprompt
13. Bottom banner placement - non-intrusive but visible
14. QR code uses local network IP for testing - update for production

**From Plan 2-01:**
15. Modal-based Privy auth - single login button shows Google/Apple in Privy UI (cleaner UX)
16. SSR-safe PrivyProvider - useState + useEffect pattern for client-side only initialization
17. Embedded Solana wallet auto-creation on login - users-without-wallets setting

**From Plan 2-02:**
18. Convex stub types with any annotations - enables build without deployment configuration
19. Denormalized walletAddress in wallets table - avoids join for balance queries
20. Separate users/wallets tables - user profile independent from balance data
21. Auto-create wallet with zero balance - ensures wallet record exists on user creation
22. Index on walletAddress in both tables - primary lookup pattern for all operations

**From Plan 2-03:**
23. Auth bridge via useEffect - usePrivyAuth hook listens to Privy auth state and triggers Convex user creation
24. Idempotent user creation - createFromPrivy checks for existing user before inserting, preventing duplicates
25. Nested providers: PrivyAuthProvider (outer) -> ConvexClientProvider (inner) - maintains SSR-safe pattern
26. Auto-user creation on login - no separate registration step, user records created automatically on first auth

**From Plan 2-04:**
27. SSR-safe Convex provider with dummy client - provides dummy ConvexReactClient during build, real client in browser
28. Stub function references with string identifiers - enables Convex functions to be referenced during build without real types
29. force-dynamic export on real-time pages - prevents SSR pre-rendering issues with Convex hooks
30. Module index re-exports - created convex/_generated/index.ts for cleaner imports and better module resolution

### Pending Todos

None yet.

### Blockers/Concerns

**Privy app ID required:** Need to create Privy app and configure NEXT_PUBLIC_PRIVY_APP_ID before testing OAuth flow. See .planning/phases/2-auth-wallet-core-ui/2-01-SUMMARY.md for setup instructions.

**Convex deployment not configured:** Convex backend initialized but deployment requires interactive authentication (npx convex dev). Stub types allow build to proceed. Full type generation and deployment setup needed before production. See .planning/phases/2-auth-wallet-core-ui/2-02-SUMMARY.md for details.

**Turbopack incompatibility:** @serwist/next plugin doesn't work with Turbopack in development mode. Service worker only generated in production builds. May need to revisit if SW debugging becomes difficult.

**Install prompt not yet tested:** Install prompt components created but not verified in browser. Should test on both Chrome/Edge (native prompt) and iOS Safari (manual instructions).

**Production QR code:** Current QR code points to local network URL (192.168.1.172:3000). Must regenerate with production domain before deployment.

**Balance display shows zero:** Current balance display shows 0 EVT for all users. Needs Phase 3 top-up flow to add tokens, or manual use of setMockBalance mutation for testing.

## Session Continuity

Last session: 2026-01-16
Stopped at: Completed Plan 2-04 (Real-Time Balance Display) - Phase 2 complete
Resume file: None
