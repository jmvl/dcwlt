# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Frictionless payments at scale
**Current focus:** Phase 2 Auth + Wallet - Plan 1 of 4

## Current Position

Phase: 2 of 4 (Auth and Wallet Core UI)
Plan: 01 of 4 (Privy Social Auth)
Status: In progress, ready for next plan
Last activity: 2026-01-16 — Completed Plan 2-01

Progress: ████░░░░░░░ 25%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 12.75 min
- Total execution time: 0.85 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1-pwa-foundation | 3 | 3 | 11.5 min |
| 2-auth-wallet-core-ui | 1 | 4 | 17 min |

**Recent Trend:**
- Last 3 plans: 23 min (1-02), 2.65 min (1-03), 17 min (2-01)
- Trend: Stable

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
18. Convex stub types with any annotations - enables build without full Convex dev setup

### Pending Todos

None yet.

### Blockers/Concerns

**Privy app ID required:** Need to create Privy app and configure NEXT_PUBLIC_PRIVY_APP_ID before testing OAuth flow. See .planning/phases/2-auth-wallet-core-ui/2-01-SUMMARY.md for setup instructions.

**Convex any types:** Current Convex handlers use explicit `any` types for ctx/args parameters. Should regenerate proper types with `npx convex dev` when project is fully configured.

**Turbopack incompatibility:** @serwist/next plugin doesn't work with Turbopack in development mode. Service worker only generated in production builds. May need to revisit if SW debugging becomes difficult.

**Install prompt not yet tested:** Install prompt components created but not verified in browser. Should test on both Chrome/Edge (native prompt) and iOS Safari (manual instructions).

**Production QR code:** Current QR code points to local network URL (192.168.1.172:3000). Must regenerate with production domain before deployment.

## Session Continuity

Last session: 2026-01-16
Stopped at: Completed Plan 2-01 (Privy Social Auth) - Phase 2, Plan 1 of 4
Resume file: None
