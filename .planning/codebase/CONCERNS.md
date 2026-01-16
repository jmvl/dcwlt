# Codebase Concerns

**Analysis Date:** 2026-01-16

## Tech Debt

**TEST_MODE Hardcoded in Web3Auth Context:**
- Issue: `event-wallet/src/contexts/Web3AuthContext.tsx` has `const TEST_MODE = true` hardcoded at line 69, bypassing Web3Auth initialization entirely
- Files: `event-wallet/src/contexts/Web3AuthContext.tsx`
- Impact: Real Gmail login doesn't work - all users get a fake `TestWallet1234` address. This breaks the core authentication flow
- Fix approach: Remove TEST_MODE flag or make it environment-configurable. For POC completion, this must be set to `false` and Web3Auth properly initialized

**Unimplemented Payment Logic:**
- Issue: QR scanner screen has `// TODO: Implement payment logic` at line 46 - payment button only navigates back without executing transaction
- Files: `event-wallet/src/screens/QRScannerScreen.tsx`
- Impact: Users cannot complete QR payments, breaking the merchant payment flow
- Fix approach: Implement Solana Pay transaction using `@solana/web3.js` and user's Web3Auth private key to sign and send transfer

**Hardcoded Backend URLs:**
- Issue: `event-wallet/src/services/api.ts` has `const API_BASE = 'http://localhost:3000'` hardcoded
- Files: `event-wallet/src/services/api.ts`
- Impact: Cannot connect to backend from physical devices (emulator vs real device), no environment-specific configuration
- Fix approach: Move to environment config or detect emulator vs device

**Token Address in Constants vs .env:**
- Issue: Token address is hardcoded in `event-wallet/src/config/constants.ts` but should be in .env for flexibility
- Files: `event-wallet/src/config/constants.ts`, `backend/.env.example`, `merchant/.env.example`
- Impact: Token address must be updated in multiple places; risk of mismatch between services
- Fix approach: Mobile app should read from environment config or fetch from backend at runtime

## Known Bugs

**Web3Auth TEST_MODE Bypass:**
- Symptoms: All logins result in `TestWallet1234` address, real Gmail OAuth never happens
- Files: `event-wallet/src/contexts/Web3AuthContext.tsx`
- Trigger: Every login attempt
- Workaround: None - this completely breaks authentication

**Payment Button Does Nothing:**
- Symptoms: Tapping "Pay" in QR scanner closes scanner without executing transaction
- Files: `event-wallet/src/screens/QRScannerScreen.tsx` line 46
- Trigger: Scanning a merchant QR code and tapping "Pay"
- Workaround: None - payments cannot be completed

**Bank Wallet File Path Hardcoded in .env.example:**
- Symptoms: `backend/.env.example` suggests `/Users/jm/bank-wallet.json` which won't exist for other developers
- Files: `backend/.env.example` line 3
- Trigger: New developer setup
- Workaround: Manually update path to correct bank wallet location

## Security Considerations

**Private Key Exposure in Test Mode:**
- Risk: While using `TestWallet1234` is harmless, the real Web3Auth flow handles private keys that could be exposed if logging is enabled
- Files: `event-wallet/src/contexts/Web3AuthContext.tsx`, `event-wallet/src/utils/solana.ts`
- Current mitigation: Console.log statements present but no secrets logged in production
- Recommendations: Remove all `console.log` statements before any production deployment. Ensure `__DEV__` guards around all sensitive logging

**.env Files in Git:**
- Risk: `backend/.env` and `merchant/.env` exist and are tracked (visible in git status)
- Files: `backend/.env`, `merchant/.env`
- Current mitigation: Not mitigated - .env files should be in .gitignore
- Recommendations: Add `.env` to `.gitignore` in all three services. Rotate any credentials that were committed

**No Input Validation on Wallet Addresses:**
- Risk: Backend accepts any wallet address string without format validation before creating transactions
- Files: `backend/src/server.ts` line 106-114
- Current mitigation: Solana SDK will throw on invalid addresses
- Recommendations: Validate address format with `PublicKey` constructor before processing

**Rate Limiting Configuration:**
- Risk: Rate limits are configurable but default values may be too permissive (10 topups/minute)
- Files: `backend/.env.example` lines 14-22
- Current mitigation: Rate limiting is implemented but defaults generous
- Recommendations: Lower defaults for production: 3 topups/minute per IP

## Performance Bottlenecks

**Synchronous Solana RPC Calls:**
- Problem: Balance fetch and top-up requests block until RPC response, no caching
- Files: `event-wallet/src/screens/DashboardScreen.tsx` lines 48-106
- Cause: Direct `connection.getParsedTokenAccountsByOwner()` calls without memoization or caching
- Improvement path: Implement balance caching with 30-second TTL, show stale balance while fetching

**ATA Creation on Every Top-Up:**
- Problem: `getOrCreateAssociatedTokenAccount` is called even when account exists, adding RPC roundtrip
- Files: `backend/src/server.ts` lines 154-162
- Cause: Function checks existence internally but still costs RPC call
- Improvement path: Minimal impact for POC, but for production could cache known ATAs

**No Request Batching:**
- Problem: Multiple concurrent balance fetches could overwhelm RPC endpoint
- Files: `event-wallet/src/screens/DashboardScreen.tsx`
- Cause: No debouncing on pull-to-refresh
- Improvement path: Add 500ms debounce to refresh button

## Fragile Areas

**Web3Auth Initialization Order:**
- Files: `event-wallet/src/contexts/Web3AuthContext.tsx`, `event-wallet/polyfills.ts`, `event-wallet/App.tsx`
- Why fragile: Requires polyfills to load before ANY Web3Auth import, and lazy-loading must happen after React mount
- Safe modification: Never import Web3Auth at module level. Always use dynamic imports inside async functions
- Test coverage: None - initialization errors only caught at runtime on device

**Bank Wallet File Loading:**
- Files: `backend/src/server.ts` lines 78-101
- Why fragile: Server starts even if wallet file is missing, only fails when `/api/topup` is called
- Safe modification: Add startup validation that fails fast if wallet file doesn't exist
- Test coverage: Partial - health check reports wallet status but doesn't validate file contents

**Camera Permissions on Android:**
- Files: `event-wallet/src/screens/QRScannerScreen.tsx`
- Why fragile: React Native camera permissions vary by Android version and device manufacturer
- Safe modification: Add explicit permission request with fallback handling
- Test coverage: None - requires physical device testing

**Solana Devnet RPC Reliability:**
- Files: `event-wallet/src/config/constants.ts` line 2
- Why fragile: Public RPC endpoints can be slow or unavailable
- Safe modification: Add fallback RPC URLs or implement retry logic
- Test coverage: None - network-dependent

## Scaling Limits

**Single Bank Wallet:**
- Current capacity: Bank wallet holds 1,000,000 tokens pre-minted
- Limit: When tokens run out, top-ups fail with "insufficient funds"
- Scaling path: Implement automated minting from bank wallet, or multiple bank wallets with load balancing

**No Database:**
- Current capacity: All state in Solana blockchain or memory
- Limit: Cannot track transaction history, rate limit state per user, or analytics
- Scaling path: Add PostgreSQL or similar for transaction logging, user tracking

**Rate Limiting is In-Memory:**
- Current capacity: `express-rate-limit` stores state in process memory
- Limit: Doesn't work across multiple backend instances, resets on server restart
- Scaling path: Redis-backed rate limiting for distributed systems

**Merchant Terminal State:**
- Current capacity: Static HTML page with no session management
- Limit: Cannot track which merchants are active, payment history, or analytics
- scaling path: Add merchant authentication and database

## Dependencies at Risk

**@web3auth/react-native-sdk:**
- Risk: Version `^8.1.0` - React Native SDKs can have breaking changes with Expo updates
- Impact: If Expo upgrades past SDK 51, Web3Auth may break
- Migration plan: Check Web3Auth documentation for Expo 52 compatibility, pin Expo version if incompatible

**@solana/web3.js:**
- Risk: Version `^1.95.0` - Major version 2.0 is in beta with breaking API changes
- Impact: Future upgrade will require code changes for transaction building
- Migration plan: Pin to v1.x until v2 is stable, budget upgrade work

**react-native-vision-camera:**
- Risk: Version `^4.7.3` - Camera APIs frequently change with Android updates
- Impact: QR scanning may break on new Android versions
- Migration plan: Test on new Android OS versions promptly, update camera library

## Missing Critical Features

**Transaction History:**
- Problem: Users cannot see past top-ups or payments
- Blocks: Accounting, debugging payment issues, user trust
- Priority: Medium - POC can work without it

**Error Recovery:**
- Problem: Failed transactions leave no trace, no retry mechanism
- Blocks: Production reliability
- Priority: High for production, Low for POC

**Merchant Payment Confirmation:**
- Problem: Merchant terminal has no way to verify payment was received
- Blocks: Real merchant usage
- Priority: High - payments can't be confirmed without this

**Logout State Persistence:**
- Problem: App doesn't remember logout across restarts in test mode
- Blocks: Clean user experience
- Priority: Low - minor UX issue

## Test Coverage Gaps

**No Mobile App Tests:**
- What's not tested: All React Native components, navigation, Web3Auth flow, QR scanning
- Files: `event-wallet/src/**/*.tsx`
- Risk: UI changes break without detection, manual testing required for every change
- Priority: High - core app functionality has zero automated tests

**No Integration Tests:**
- What's not tested: End-to-end flow of login → top-up → scan → pay
- Files: Cross-service integration
- Risk: Service integration points break undetected
- Priority: Medium - manual testing catches major issues

**Payment Transaction Not Tested:**
- What's not tested: Actual Solana transfer from user wallet to merchant
- Files: `event-wallet/src/screens/QRScannerScreen.tsx` (unimplemented)
- Risk: Payment logic won't work when implemented
- Priority: High - this is the core value transaction

**Rate Limit Tests Present:**
- Files: `backend/tests/rateLimit.test.ts`, `backend/tests/integration/rateLimit.integration.test.ts`
- Coverage: 80% threshold configured in jest.config.js but not enforced

---

*Concerns audit: 2026-01-16*
