---
phase: 1-pwa-foundation
plan: 03
subsystem: ui
tags: [pwa, beforeinstallprompt, react-hooks, nextjs, serwist]

# Dependency graph
requires:
  - phase: 1-pwa-foundation
    plan: 1-01
    provides: Next.js 16 project with PWA manifest and icons
  - phase: 1-pwa-foundation
    plan: 1-02
    provides: Serwist service worker with caching strategies
provides:
  - beforeinstallprompt event integration for Chrome/Edge native install
  - localStorage-based visit tracking for 2nd-visit prompt timing
  - iOS fallback instructions component
  - InstallPrompt component with design system styling
  - QR code for PWA URL distribution
affects: [2-auth-wallet, 3-payments, 4-features]

# Tech tracking
tech-stack:
  added: [qrcode (package)]
  patterns: [beforeinstallprompt event pattern, localStorage visit tracking, iOS user agent detection]

key-files:
  created:
    - pwa/app/hooks/useInstallPrompt.ts
    - pwa/app/components/InstallPrompt.tsx
    - pwa/public/qr-code.png
    - docs/qr-code-install.md
  modified:
    - pwa/app/page.tsx
    - pwa/package.json
    - pwa/package-lock.json

key-decisions:
  - "Used localStorage for visit count - prompts on 2nd visit (not aggressive)"
  - "Separate iOS component - Safari doesn't support beforeinstallprompt"
  - "Bottom banner placement - non-intrusive but visible"
  - "QR code uses local network IP for testing - update for production"

patterns-established:
  - "Pattern: Client-side only hooks - useInstallPrompt is 'use client'"
  - "Pattern: Conditional rendering by platform - iOS vs Chrome/Edge branches"
  - "Pattern: Fixed positioning for overlays - z-50, bottom-4, responsive width"

# Metrics
duration: 2.65min
completed: 2026-01-16
---

# Phase 1: Plan 3 Summary

**PWA install prompt with beforeinstallprompt event, localStorage visit tracking, iOS fallback instructions, and QR code distribution**

## Performance

- **Duration:** 2.65 min (159 seconds)
- **Started:** 2026-01-16T17:08:44Z
- **Completed:** 2026-01-16T17:11:23Z
- **Tasks:** 5
- **Files modified:** 7

## Accomplishments

- Implemented beforeinstallprompt event capture for Chrome/Edge native install dialogs
- Created localStorage-based visit tracking to show prompt on 2nd visit (not aggressive)
- Built iOS-specific fallback component with Share button instructions
- Integrated InstallPrompt component into home page with design system styling
- Generated QR code pointing to local network URL for testing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create install prompt hook** - `3e83faeb` (feat)
2. **Task 2: Create InstallPrompt component** - `82852f33` (feat)
3. **Task 3: Add install prompt to home page** - `86a46095` (feat)
4. **Task 4: Create QR code for app URL** - `bfe44747` (feat)
5. **Task 5: Test install flow** - `3c23fe64` (test)

**Plan metadata:** (to be committed after SUMMARY.md)

## Files Created/Modified

- `pwa/app/hooks/useInstallPrompt.ts` - Custom React hook for beforeinstallprompt event handling and visit tracking
- `pwa/app/components/InstallPrompt.tsx` - Install banner component with Chrome/Edge and iOS variants
- `pwa/app/page.tsx` - Updated to import and render InstallPrompt component
- `pwa/public/qr-code.png` - 512x512px QR code for PWA URL distribution
- `docs/qr-code-install.md` - Documentation for QR code usage and production deployment
- `pwa/package.json` - Added qrcode dev dependency
- `pwa/package-lock.json` - Lockfile updated with qrcode package

## Decisions Made

- **localStorage for visit tracking**: Chose localStorage over sessionStorage or cookies for simplicity and persistence across sessions. Visit count resets only when browser data is cleared.
- **2nd visit timing**: Prompt shows on 2nd visit (visitCount >= 1) to avoid being overly aggressive while still encouraging installs.
- **iOS component separation**: Created separate IOSInstallInstructions component rather than complex conditional rendering in single component for better code organization.
- **Bottom banner placement**: Fixed position at bottom-4 with responsive width (full on mobile, 384px on desktop) matches standard PWA install UX patterns.
- **Local network QR code**: QR code points to http://192.168.1.172:3000 for same-network testing. Must be regenerated for production with actual domain.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without blockers or issues.

## Authentication Gates

None - no external services requiring authentication.

## User Setup Required

None - no external service configuration required.

**Production deployment note:** Regenerate `pwa/public/qr-code.png` with production URL before deploying. See `docs/qr-code-install.md` for instructions.

## Next Phase Readiness

Phase 1 (PWA Foundation) is now **complete**. All three plans executed successfully:

1. **Plan 1-01**: Next.js 16 + PWA manifest with @ducanh2912/next-pwa
2. **Plan 1-02**: Serwist service worker with caching strategies
3. **Plan 1-03**: Install prompt with beforeinstallprompt and iOS fallback

**Ready for Phase 2: Auth + Wallet** which will implement:
- Privy authentication
- Solana wallet integration
- User registration/login flow
- Wallet balance display

**No blockers or concerns** - PWA is fully functional and ready for browser testing.

---

*Phase: 1-pwa-foundation*
*Plan: 03*
*Completed: 2026-01-16*
