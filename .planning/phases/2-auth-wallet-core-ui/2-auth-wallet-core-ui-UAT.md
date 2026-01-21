---
status: complete
phase: 2-auth-wallet-core-ui
source: 2-01-SUMMARY.md, 2-02-SUMMARY.md, 2-03-SUMMARY.md, 2-04-SUMMARY.md
started: 2025-01-17T00:00:00Z
updated: 2025-01-17T00:00:00Z
---

## UAT Complete

All 12 tests completed. See test results below.

## Summary

total: 12
passed: 8
issues: 3
pending: 0
skipped: 1

## Test Results Summary

### Passed Tests (8/12)
1. ✅ App builds successfully
2. ✅ Home page displays login button
3. ✅ Google OAuth login works
4. ✅ Wallet address displayed after login
5. ✅ Dashboard link appears after login
6. ✅ Dashboard displays balance
7. ✅ Real-time balance updates
8. ✅ Logout functionality

### Issues (3/12)
1. ❌ PWA is installable (service worker disabled - Turbopack incompatibility)
2. ❌ User email not stored in Convex (createFromPrivy mutation missing email param)
3. ❌ Service worker caches assets (intentionally disabled)

### Skipped (1/12)
1. ⏭️ Apple OAuth login works (not enabled in Privy dashboard)

## Tests

### 1. App builds successfully
expected: Run `cd pwa && npm run build` and verify build completes without errors. The Next.js 16 PWA with Turbopack should compile successfully, including PWA manifest, service worker configuration, and all components (PrivyProvider, LoginButton, BalanceDisplay, dashboard).
result: pass

### 2. PWA is installable
expected: Opening the app in a browser shows the install prompt (on Chrome/Edge) or iOS install instructions. The app has a valid PWA manifest with icons, name, and theme color.
result: issue
reported: "Service Worker registration failed: TypeError: Failed to register a ServiceWorker for scope ('http://localhost:3000/') with script ('http://localhost:3000/sw.js'): ServiceWorker script evaluation failed"
severity: major

### 3. Home page displays login button
expected: The home page (http://localhost:3000) shows a "Sign in to Wallet" button with the app branding. The button is styled with the primary color (#13a4ec) and is clickable.
result: pass

### 4. Google OAuth login works
expected: Clicking "Sign in to Wallet" opens a Privy modal showing Google as an authentication option. Selecting Google opens OAuth flow. After completing OAuth, user is redirected back to the app.
result: pass

### 5. Apple OAuth login works
expected: In the Privy modal, Apple is shown as an authentication option (if enabled). Selecting Apple opens OAuth flow. After completing OAuth, user is redirected back to the app.
result: skipped
reason: Apple not enabled in Privy dashboard

### 6. Wallet address displayed after login
expected: After successful OAuth login, the home page displays the user's Solana wallet address. The address is truncated (7 chars...7 chars) and displayed prominently with the "Connected to Wallet" label.
result: pass

### 7. Dashboard link appears after login
expected: After login, a "View Dashboard" button appears on the home page. Clicking it navigates to /dashboard route.
result: pass
notes: Fixed Convex useQuery integration (useQuery returns data directly, not wrapped). Dashboard now accessible and displays balance correctly.

### 8. Dashboard displays balance
expected: The dashboard page shows a large balance display as the primary element. It shows "0 EVT" (since no top-up yet) with a toggle button to mask/unmask the balance.
result: pass
notes: User confirmed: balance displays 0.00 EVT, eye icon toggle works, shows/hides balance correctly.

### 9. Real-time balance updates
expected: When balance changes (via setMockBalance mutation or future top-up), the dashboard balance updates automatically without page refresh. The Convex subscription pushes the update to the UI.
result: pass
notes: User confirmed: "raw balance is updating in real time" in test mode. Convex useQuery subscription working correctly. Balance changes appear instantly without page refresh.

### 10. User record created in Convex
expected: After first login, a user record is created in Convex database with fields: walletAddress, createdAt, lastActiveAt, oauthProvider, email. The user has an associated wallet record with tokenBalance set to 0.
result: issue
reported: "User record exists with all expected fields except email is unset. Record: {walletAddress, createdAt, lastActiveAt, oauthProvider: 'privy'}. Wallet record exists with tokenBalance: 0."
severity: minor
notes: Root cause: createFromPrivy mutation (convex/users.ts:63) doesn't accept email parameter. Can be fixed by passing email from Privy user object.

### 11. Logout functionality
expected: When authenticated, the login button changes to show wallet address. Clicking it or a logout option signs the user out, returning to the unauthenticated "Sign in to Wallet" state.
result: pass
notes: User confirmed: "Sign Out" button appears and works properly. Logout redirects to unauthenticated state.

### 12. Service worker caches assets
expected: After loading the app, opening DevTools Application tab shows the service worker is active. The cache storage contains cached assets (Google Fonts, static files, API responses per cache strategies).
result: issue
reported: "No service worker registered for localhost:3000 (intentionally disabled). User seeing Chrome extension service workers in DevTools, not from PWA."
severity: major
notes: Agent verified: Service worker intentionally disabled due to Turbopack incompatibility. No localhost:3000 service worker found (as designed).

## Summary

total: 12
passed: 8
issues: 3
pending: 0
skipped: 1
status: complete

## Gaps

- truth: "Service worker registers successfully and caches assets"
  status: failed
  reason: "Service worker intentionally disabled due to Turbopack incompatibility with Serwist"
  severity: major
  test: 2, 12
  root_cause: "Serwist-generated sw.js contains ES6 imports incompatible with service worker context. Turbopack doesn't bundle workers properly. See https://github.com/serwist/serwist/issues/54"
  artifacts: ["pwa/app/components/ServiceWorkerRegister.tsx"]
  missing: ["Service worker registration and caching"]
  debug_session: "Temporarily disabled in ServiceWorkerRegister.tsx. App functions correctly without it for development."
- truth: "User email is stored in Convex database"
  status: failed
  reason: "Email field is unset in Convex user record. createFromPrivy mutation doesn't accept email parameter."
  severity: minor
  test: 10
  root_cause: "convex/users.ts:63 createFromPrivy mutation doesn't accept email parameter. usePrivyAuth hook doesn't pass email from Privy user object."
  artifacts: ["pwa/convex/users.ts", "pwa/app/hooks/usePrivyAuth.ts"]
  missing: ["Email capture and storage from Privy user"]
  debug_session: "User record created with all other fields. Email can be added later if needed."
