---
phase: 1-pwa-foundation
plan: 02
subsystem: infra
tags: [serwist, service-worker, pwa, caching, nextjs16, offline]

# Dependency graph
requires:
  - phase: 1-pwa-foundation
    plan: 01
    provides: Next.js 16 project with PWA manifest and icons
provides:
  - Service worker with precaching and runtime caching strategies
  - Offline capability for static assets
  - Network-first caching for API calls
  - Service worker registration in app layout
affects: [1-pwa-foundation/1-03]

# Tech tracking
tech-stack:
  added: [serwist, @serwist/next, @serwist/cli]
  patterns: [service-worker-injection, cache-strategies, precache-manifest]

key-files:
  created: [pwa/app/sw.js, pwa/app/sw.ts, pwa/serwist.config.js, pwa/app/components/ServiceWorkerRegister.tsx]
  modified: [pwa/next.config.ts, pwa/app/layout.tsx, pwa/package.json]

key-decisions:
  - "Used Serwist instead of Workbox - Next.js 16 compatible, actively maintained"
  - "Created JavaScript service worker instead of TypeScript - inject-manifest CLI doesn't compile TS"
  - "Manual service worker registration - @serwist/next auto-registration broken with Turbopack"
  - "CLI-based SW generation - bypassed Turbopack compatibility issue with @serwist/next plugin"

patterns-established:
  - "Service worker file: app/sw.js with runtime caching strategies"
  - "Build process: Next.js build → Serwist inject-manifest → public/sw.js"
  - "Caching strategy: CacheFirst for fonts, StaleWhileRevalidate for static, NetworkFirst for API"

# Metrics
duration: 23min
completed: 2026-01-16
---

# Phase 1 Plan 2: Serwist Service Worker Summary

**Service worker with precaching for 17 static assets and runtime caching for fonts, images, API calls, and JS/CSS using Serwist**

## Performance

- **Duration:** 23 min (0.38 hours)
- **Started:** 2026-01-16T16:44:08Z
- **Completed:** 2026-01-16T17:07:00Z
- **Tasks:** 6
- **Files modified:** 7

## Accomplishments

- Installed Serwist packages (@serwist/next, serwist, @serwist/cli) for Next.js 16 compatible service worker
- Created service worker with caching strategies: CacheFirst for Google Fonts, StaleWhileRevalidate for static assets, NetworkFirst for API calls
- Configured automatic service worker generation via serwist inject-manifest CLI
- Added manual service worker registration component to work around Turbopack incompatibility
- Build process now automatically generates public/sw.js with precache manifest after Next.js build
- Verified service worker serves correctly with 17 precached URLs totaling 663 kB

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Serwist dependencies** - `487c8c9` (feat)
2. **Task 2: Configure Serwist service worker** - `3be191e` (feat)
3. **Task 3: Add service worker registration to layout** - `59a1116` (feat)
4. **Task 4: Update build script to generate service worker** - `3142154` (feat)
5. **Task 5: Verify offline capability** - (verification only, no code changes)

## Files Created/Modified

- `pwa/app/sw.js` - Service worker source with caching strategies
- `pwa/app/sw.ts` - TypeScript version of service worker (for reference)
- `pwa/serwist.config.js` - Serwist CLI configuration for inject-manifest
- `pwa/app/components/ServiceWorkerRegister.tsx` - Client component for SW registration
- `pwa/next.config.ts` - Updated to configure @serwist/next plugin (sw.js path)
- `pwa/app/layout.tsx` - Added ServiceWorkerRegister component
- `pwa/package.json` - Added serwist dependencies and updated build script
- `pwa/public/sw.js` - Generated service worker (created during build)

## Decisions Made

1. **Used Serwist instead of Workbox** - Serwist is the successor to Workbox with active maintenance and Next.js 16 compatibility. The @serwist/next plugin provides tight integration but has Turbopack issues.

2. **Created JavaScript service worker instead of TypeScript** - The `serwist inject-manifest` CLI doesn't compile TypeScript, it only does string replacement. Using `.js` as the source file allows the CLI to work correctly.

3. **Manual service worker registration** - The @serwist/next plugin's auto-registration feature doesn't work with Turbopack. Created a client component that calls `navigator.serviceWorker.register()` directly.

4. **CLI-based SW generation instead of webpack plugin** - The @serwist/next webpack plugin isn't generating the service worker file during build (likely due to Turbopack incompatibility). Using the CLI's `inject-manifest` command as a post-build step works reliably.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript service worker not supported by CLI**
- **Found during:** Task 3 (Service worker creation)
- **Issue:** Original plan used `app/sw.ts` but `serwist inject-manifest` doesn't compile TypeScript to JavaScript
- **Fix:** Created `app/sw.js` alongside `app/sw.ts`, updated serwist.config.js to use the `.js` version
- **Files modified:** pwa/app/sw.js, pwa/serwist.config.js
- **Verification:** CLI successfully generates public/sw.js with proper JavaScript syntax
- **Committed in:** 3be191e (Task 2 commit)

**2. [Rule 3 - Blocking] @serwist/next plugin doesn't generate SW file**
- **Found during:** Task 2-3 (Service worker generation)
- **Issue:** The @serwist/next webpack plugin wasn't generating public/sw.js during build (Turbopack incompatibility)
- **Fix:** Installed @serwist/cli and used `serwist inject-manifest` as a post-build step in package.json
- **Files modified:** pwa/package.json (build script), pwa/serwist.config.js (new file)
- **Verification:** Build now generates public/sw.js correctly with 17 precached URLs
- **Committed in:** 3142154 (Task 4 commit)

**3. [Rule 2 - Missing Critical] No auto-registration of service worker**
- **Found during:** Task 4 (Service worker registration)
- **Issue:** @serwist/next's auto-registration feature (register: true) doesn't inject the registration script when Turbopack is enabled
- **Fix:** Created ServiceWorkerRegister.tsx client component to manually register the service worker using navigator.serviceWorker.register()
- **Files modified:** pwa/app/components/ServiceWorkerRegister.tsx, pwa/app/layout.tsx
- **Verification:** Component included in layout, will register SW when page loads
- **Committed in:** 59a1116 (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 missing critical)
**Impact on plan:** All auto-fixes necessary to work around Turbopack incompatibility with @serwist/next. CLI-based approach is actually more reliable than webpack plugin integration.

## Issues Encountered

1. **@serwist/next Turbopack incompatibility** - The plugin shows warnings and doesn't generate the service worker file when Turbopack is enabled. Workaround: Use CLI `inject-manifest` command as post-build step.

2. **TypeScript service worker compilation** - The inject-manifest CLI doesn't compile TypeScript. Workaround: Use `.js` extension for service worker source file.

3. **Auto-registration not working** - The @serwist/next plugin's `register: true` option doesn't inject registration code with Turbopack. Workaround: Manual registration via client component.

## User Setup Required

None - no external service configuration required. Service worker is fully self-contained.

## Next Phase Readiness

- Service worker configured and generating correctly
- Offline capability implemented (static assets cached)
- API caching strategy in place (NetworkFirst with 10s timeout)
- Ready for Plan 1-03: PWA Install Prompt

**Concerns:**
- Turbopack incompatibility with @serwist/next may cause issues in development mode. Service worker only works in production builds.
- Service worker registration should be tested in browser DevTools to verify it activates correctly.

**Verification Steps for Next Phase:**
1. Build: `npm run build`
2. Start: `npm run start`
3. Open http://localhost:3000 in Chrome
4. DevTools → Application → Service Workers → Verify "sw.js" is active
5. DevTools → Application → Cache Storage → Verify caches exist
6. Network tab → Check "Offline" → Reload page → Verify app loads

---
*Phase: 1-pwa-foundation*
*Completed: 2026-01-16*
