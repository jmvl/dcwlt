# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Frictionless payments at scale
**Current focus:** Ready for Phase 3 Top-Up + Payments

## Current Position

Phase: 3.5 of 5 (Merchant Management)
Plan: 03 of 4 (Event Creation System)
Status: In progress, Plan 03 complete
Last activity: 2026-01-18 — Completed Plan 03.5-03 (Event Creation System)

Progress: ██████████ 81%

## Performance Metrics

**Velocity:**
- Total plans completed: 11
- Average duration: 12.1 min
- Total execution time: 2.23 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1-pwa-foundation | 3 | 3 | 11.5 min |
| 2-auth-wallet-core-ui | 4 | 7 | 12.0 min |
| 3-topup-payments | 2 | 2 | 24.5 min |
| 3.5-merchant-management | 2 | 2 | 8.5 min |

**Recent Trend:**
- Last 3 plans: 8 min (3.5-01), 9 min (3.5-03)
- Trend: Merchant management plans completing quickly with no deviations

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

**From Plan 3-01:**
31. Mock top-up with 2-second delay - simulates network request for realistic UX
32. Mock transaction signature format - `mock_${timestamp}_${random}` provides unique IDs
33. Separate success screen for top-ups - displays signature with "View Dashboard" button
34. TopUpBundle component state management - maintains own loading/purchased state for clean separation
35. Next.js 16 router API - use URL string syntax, not object with pathname/query (fixed bug in scan page)

**From Plan 3-02:**
36. html5-qrcode library for QR scanning - cross-platform PWA compatibility with iOS Safari
37. 100ms DOM render delay - prevents React 18 Strict Mode race condition with element initialization
38. Always-render scanner element - never conditionally render to maintain stable DOM reference
39. Separate parse/validate functions - isValidSolanaPayURL() returns boolean, parseSolanaPayURL() throws errors
40. Camera permission handling with retry UI - user-friendly error states for permission denial

**From Plan 3.5-01:**
41. Mock wallet generation for POC - deterministic base58 encoding from email hash
42. Email validation in both client and server - defense in depth for duplicate prevention
43. No wallet display in merchant registration - merchants never see their wallet address

**From Plan 3.5-03:**
44. Events table supports both predefined and custom types - type field stores standard categories (Concert, Sports, Festival) while customType stores custom names when type="Custom"
45. Date stored as ISO string - using ISO date strings (e.g., "2026-07-15") for better readability and easier date manipulation, no future date validation
46. Color-coded type badges for events - each predefined type has distinct color (Concert=blue, Sports=green, Festival=purple, Custom=gray) for quick visual scanning
47. Conditional custom type field - custom type input only appears when "Custom" selected, keeping form clean while guiding user input

### Pending Todos

None yet.

### Blockers/Concerns

**Privy app ID required:** Need to create Privy app and configure NEXT_PUBLIC_PRIVY_APP_ID before testing OAuth flow. See .planning/phases/2-auth-wallet-core-ui/2-01-SUMMARY.md for setup instructions.

**Convex deployment not configured:** Convex backend initialized but deployment requires interactive authentication (npx convex dev). Stub types allow build to proceed. Full type generation and deployment setup needed before production. See .planning/phases/2-auth-wallet-core-ui/2-02-SUMMARY.md for details.

**Turbopack incompatibility:** @serwist/next plugin doesn't work with Turbopack in development mode. Service worker only generated in production builds. May need to revisit if SW debugging becomes difficult.

**Install prompt not yet tested:** Install prompt components created but not verified in browser. Should test on both Chrome/Edge (native prompt) and iOS Safari (manual instructions).

**Production QR code:** Current QR code points to local network URL (192.168.1.172:3000). Must regenerate with production domain before deployment.

**Balance display shows zero:** Current balance display shows 0 EVT for all users. Needs Phase 3 top-up flow to add tokens, or manual use of setMockBalance mutation for testing. **RESOLVED**: Plan 03-01 completed - mock top-up flow now adds tokens to balance.

## Session Continuity

Last session: 2026-01-18
Stopped at: Completed Plan 03.5-03 (Event Creation System) - Phase 3.5 in progress
Resume file: None
