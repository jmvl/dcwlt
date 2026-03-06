# Pitfalls Research: High-Frequency Event Wallet PWA

**Domain:** Real-time payment PWA with blockchain settlement (Solana, Convex, Privy)
**Researched:** 2025-01-16
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Solana RPC Rate Limit Exhaustion

**What goes wrong:**
Public Devnet RPC endpoints are heavily rate-limited. When 20,000 users simultaneously try to check balances or send transactions, requests start failing with 429 errors. Transactions fail to submit, balance updates stall, and the app becomes unusable during peak event periods.

**Why it happens:**
Developers test with 1-10 users and assume public RPC endpoints will scale. Free RPC providers (devnet.solana.com, api.mainnet-beta.solana.com) have strict rate limits (often ~100 requests/second) that are invisible during development but catastrophic at scale.

**How to avoid:**
- Use Helius Business Tier or QuickNode dedicated endpoints for production
- Implement request queuing and exponential backoff in Convex Actions
- Cache balance reads in Convex database (don't fetch from RPC for every display)
- Use WebSocket subscriptions for balance updates instead of polling
- Monitor RPC usage and set alerts at 70% of rate limit

**Warning signs:**
- Intermittent 429 errors during load testing
- Balance inconsistencies between users
- Transactions that "never confirm" but don't fail
- Increasing latency on balance checks during testing

**Phase to address:**
**Phase 1: Foundation & Auth** — Set up dedicated RPC endpoints during initial infrastructure setup. Test with 100+ concurrent users before Phase 2.

**Severity:** CRITICAL — Can completely break the app during events

---

### Pitfall 2: Transaction Drops Due to Network Congestion

**What goes wrong:**
Transactions disappear without confirmation or error. Users tap "Pay," see a spinner, then... nothing. No error, no success, funds not moved. The transaction was dropped by the network due to congestion but never retried.

**Why it happens:**
Solana transactions use blockhash for replay protection (expires in ~2 minutes). During network congestion, validators drop transactions with low or no priority fees. The transaction expires before being processed, but the app doesn't detect the drop.

**How to avoid:**
- Always include priority fees (0.0001 SOL minimum for devnet, higher for mainnet)
- Implement transaction lifecycle monitoring: track submitted → confirmed → finalized states
- Auto-retry with increased priority fees on timeout (30-60 second window)
- Use Jito bundles via Helius for guaranteed inclusion during congestion
- Show clear timeout messaging: "Network is busy. Retrying with higher fees..."
- Log dropped transactions for monitoring

**Warning signs:**
- Transactions stuck in "pending" state for >60 seconds
- User reports of "I paid but nothing happened"
- Balance unchanged after successful payment UX
- No transaction signature on Solana Explorer

**Phase to address:**
**Phase 3: Payments & QR Scanning** — Implement retry logic and priority fee estimation during payment flow. Test under simulated congestion.

**Severity:** CRITICAL — Direct financial impact and user trust

---

### Pitfall 3: Optimistic UI Rollback Without User Notification

**What goes wrong:**
User scans QR, taps "Pay," sees balance drop instantly (optimistic update), walks away from merchant. 30 seconds later, transaction fails on-chain. Balance reverts, but user has already left. Merchant claims non-payment, user claims they paid. Support nightmare.

**Why it happens:**
Developers implement optimistic updates for speed (<200ms UX goal) but don't plan graceful rollback. When backend transaction fails (insufficient funds, network error), UI silently reverts, confusing users who already saw success state.

**How to avoid:**
- Never show "success" confirmation until on-chain settlement
- Show "Processing..." state with countdown during optimistic update
- If transaction fails, show explicit error with clear explanation
- Play haptic feedback on success (not on optimistic update)
- Queue failed transactions for manual retry (not automatic silent retry)
- Log all rollbacks for monitoring

**Warning signs:**
- User balance fluctuates without explanation
- Support tickets for "missing funds" after payments
- Transactions in Convex but not on Solana
- Negative user feedback on payment reliability

**Phase to address:**
**Phase 2: Real-Time Balance & State** — Design optimistic update state machine with explicit rollback UX. Test failure scenarios extensively.

**Severity:** HIGH — Major user trust and support impact

---

### Pitfall 4: ATA (Associated Token Account) Creation Failures

**What goes wrong:**
First-time SPL token transfer fails because recipient doesn't have an Associated Token Account. User tops up via Stripe, backend tries to transfer tokens, transaction fails. User paid Stripe but received no tokens. Support disaster.

**Why it happens:**
SPL tokens require an Associated Token Account (ATA) for each token-wallet pair. `getOrCreateAssociatedTokenAccount` is commonly used, but account creation can fail due to:
- Insufficient rent exemption funds (0.0009 SOL minimum)
- Incorrect account order in transaction instruction
- Network congestion during ATA creation
- Race conditions when multiple transfers to same new wallet

**How to avoid:**
- Always check if ATA exists before attempting transfer
- Use `getOrCreateAssociatedTokenAccount` with proper error handling
- Include rent exemption amount in top-up calculations
- Create ATA proactively during wallet creation (not during transfer)
- Implement retry logic specifically for ATA creation failures
- Log ATA creation failures separately from transfer failures

**Warning signs:**
- "Account could not be parsed as token account" errors
- Transfers to newly created wallets failing consistently
- "Invalid account owner" errors in transaction logs
- Support tickets for "paid but no tokens received"

**Phase to address:**
**Phase 1: Foundation & Auth** — Create ATA during wallet creation flow. Test with fresh wallets repeatedly.

**Severity:** HIGH — Blocks user onboarding, causes payment disputes

---

### Pitfall 5: Privy Auth State Drift

**What goes wrong:**
User is logged in on PWA, but Privy auth session times out in background. User taps "Pay," app tries to sign transaction with expired session. Privy shows iframe login prompt, user confused ("I'm already logged in!"). Payment flow breaks at critical moment.

**Why it happens:**
Privy embedded wallet sessions expire (typically 7 days), but Convex queries may still show user as authenticated. App state and Privy auth state drift apart. Developers check Convex auth but not Privy session validity before initiating transactions.

**How to avoid:**
- Check `privy.isAuthenticated()` before every wallet operation
- Implement session refresh prompts before expiration ("Your session expires in 1 day")
- Show clear "Re-authenticate required" message if signing fails
- Store Privy session expiration in Convex for proactive refresh
- Handle Privy iframe authentication failures gracefully
- Test with expired sessions deliberately

**Warning signs:**
- "User not authenticated" errors during payment flow
- Users reported as logged in but unable to sign transactions
- Privy iframe appearing unexpectedly during payments
- Inconsistent auth state across browser tabs

**Phase to address:**
**Phase 1: Foundation & Auth** — Implement auth state synchronization and session monitoring. Test with session expiry scenarios.

**Severity:** HIGH — Blocks payments, frustrates users at critical moments

---

### Pitfall 6: PWA Service Worker Stale Code

**What goes wrong:**
You deploy a critical bugfix to production. Users who installed the PWA continue using old code because service worker caches aggressively. Some users see broken UI for days despite your fix being live. Support tickets pile up.

**Why it happens:**
Service workers cache assets indefinitely by default. When you deploy new code, existing PWAs don't know to update. Users see cached code until they:
- Manually clear browser cache (unlikely)
- Reinstall the PWA (unlikely)
- Hit the arbitrary "update check" timing (24+ hours)

**How to avoid:**
- Use `skipWaiting()` in service worker for immediate updates
- Implement update prompts: "New version available. Refresh to update."
- Set short cache max-age for API responses (5-10 minutes)
- Use Serwist's built-in update detection and notification
- Test service worker update flow in staging before production
- Add version number to UI for support debugging

**Warning signs:**
- Support reports of bugs you already fixed
- Users seeing different UI versions simultaneously
- "Clear your cache" becoming a common support response
- Deployment "successful" but bugs persist for some users

**Phase to address:**
**Phase 1: Foundation & Auth** — Configure Serwist with `skipWaiting: true` and update notification. Test update flow end-to-end.

**Severity:** MEDIUM — Support overhead, delayed bugfixes

---

### Pitfall 7: iOS Safari PWA Camera Access Failure

**What goes wrong:**
User installs PWA on iPhone. Tries to scan QR payment code. Camera doesn't launch. Screen stays black or shows error. User can't pay. Merchant line backs up. Event staff frustrated.

**Why it happens:**
iOS Safari has restrictive camera permissions for PWAs. Some QR scanning libraries (notably html5-qrcode, issue #713) fail to launch camera in PWA mode on iOS. Browser works fine, but installed PWA breaks.

**How to avoid:**
- Test QR scanning on physical iOS device (not simulator)
- Use qr-scanner library (better iOS PWA compatibility)
- Provide fallback: "Enter merchant code manually" if camera fails
- Show clear error: "Camera not available. Try in Safari browser."
- Document iOS PWA limitations in user-facing FAQ
- Consider native app fallback if QR scanning is critical

**Warning signs:**
- Camera works in browser but fails after PWA installation
- Black screen when opening QR scanner on iOS
- Console errors: "Permission denied" or "Device not supported"
- User reports specific to iPhone/iPad

**Phase to address:**
**Phase 3: Payments & QR Scanning** — Test QR scanning on iOS PWA explicitly. Have manual code entry fallback ready.

**Severity:** HIGH — Blocks primary payment flow on iOS

---

### Pitfall 8: Stripe Webhook Signature Verification Bypass

**What goes wrong:**
Developer skips webhook signature verification during development "to test faster." Forgets to add it before production. Attacker discovers webhook endpoint, sends fake `payment_intent.succeeded` events. Backend mints free tokens to attacker's wallet. Treasury drained.

**Why it happens:**
Stripe webhooks can be forged. Without verifying HMAC signature, any HTTP request can claim to be from Stripe. Developers underestimate this risk during MVP crunch.

**How to avoid:**
- **NEVER** skip webhook signature verification (even in dev)
- Use Stripe's official verification helper: `stripe.webhooks.constructEvent(payload, sig, endpointSecret)`
- Store webhook secret in environment variable (never commit)
- Test webhook verification with Stripe CLI locally
- Log all webhook signatures for audit trail
- Reject any unverified webhooks with 401 status

**Warning signs:**
- Webhook handler doesn't check signature
- Direct API testing without signature verification
- Webhook secret in codebase or logs
- Unexpected top-ups in testing

**Phase to address:**
**Phase 2: Real-Time Balance & State** — Implement Stripe webhook integration with signature verification from day one.

**Severity:** CRITICAL — Direct financial loss, security breach

---

### Pitfall 9: Mainnet/Devnet Configuration Mix-up

**What goes wrong:**
Developer accidentally uses mainnet RPC URL in `.env` while testing. Transfers real SOL from treasury wallet to test user. Or worse: deploys to production with devnet configuration, users can't access mainnet tokens.

**Why it happens:**
Environment variables often shared across local/staging/production. Manual `.env` file management is error-prone. Devnet and mainnet look similar (same API, different endpoints).

**How to avoid:**
- Use different `.env` files: `.env.local`, `.env.devnet`, `.env.mainnet`
- Add runtime assertions checking network on startup
- Display current network prominently in UI footer (DEVNET / MAINNET)
- Use different treasury wallets for devnet vs mainnet
- Never use mainnet treasury key in devnet environment
- Add pre-commit hooks to check for committed mainnet keys

**Warning signs:**
- Mainnet transactions in devnet logs
- Real funds moving during "testing"
- UI shows wrong network for environment
- Configuration files in git repository

**Phase to address:**
**Phase 1: Foundation & Auth** — Set up environment-specific configuration. Add network validation on startup.

**Severity:** CRITICAL — Real financial loss, compliance issues

---

### Pitfall 10: IndexedDB Quota Exhaustion on Safari

**What goes wrong:**
Safari iOS imposes 50MB cache storage limit per PWA. Your app tries to cache transaction history for offline use, hits quota limit, app crashes. User can't access wallet. Support nightmare during event.

**Why it happens:**
Developers test on Chrome (generous IndexedDB limits) or desktop Safari. Mobile Safari has strict 50MB quota. Transaction history, QR codes, cached API responses accumulate quickly.

**How to avoid:**
- Monitor storage usage with `navigator.storage.estimate()`
- Implement aggressive pruning: keep only last 50 transactions locally
- Use IndexedDB (not Cache API) for transaction data (higher quota)
- Show "Storage full" message with "Clear cache" action
- Test on physical iOS device before production
- Consider server-side storage for full history, client-side cache for recent

**Warning signs:**
- App crashes after extended use
- "QuotaExceededError" in console
- Offline features failing unpredictably
- iOS-specific complaints from users

**Phase to address:**
**Phase 2: Real-Time Balance & State** — Implement storage monitoring and pruning during transaction history feature.

**Severity:** MEDIUM — iOS-specific crashes, data loss

---

### Pitfall 11: Thundering Herd at Event Start

**What goes wrong:**
Event gates open. 20,000 users simultaneously open PWA, check balances, scan QR codes. Convex functions spike to 10,000+ concurrent requests. Database locks up. Latency spikes to 30+ seconds. Timeouts everywhere. App unusable during peak period.

**Why it happens:**
All users wake up at same time (halftime, doors open). No staggering. All hit same Convex queries (`getBalance`, `getTransactions`). Cache is cold (everyone has same cache miss). Database overwhelmed.

**How to avoid:**
- Pre-warm cache before event (prefetch common queries)
- Use Convex's built-in query batching and caching
- Implement exponential backoff on retry
- Show "Busy, retrying..." loading state with queue position
- Design for graceful degradation: cached balance > no balance
- Load test with 5,000+ concurrent users before event
- Consider read replicas for balance queries (if using traditional DB)

**Warning signs:**
- Latency spikes during load testing
- Database connection limits hit
- Convex function timeouts (>30 seconds)
- "Service unavailable" errors at scale

**Phase to address:**
**Phase 4: Scaling & Optimization** — Load testing at 5,000+ concurrent users. Implement caching and graceful degradation.

**Severity:** HIGH — Breaks app during most critical moments

---

### Pitfall 12: Double-Spending via Optimistic Concurrency

**What goes wrong:**
User quickly taps "Pay" twice before first transaction confirms. Both spend mutations optimistically update balance. User pays 10 tokens instead of 5. Merchant receives only one payment. User overcharged.

**Why it happens:**
Optimistic updates apply immediately. If user double-taps before backend validates, both mutations succeed locally. Backend eventually rejects one, but UX already showed both as successful.

**How to avoid:**
- Disable "Pay" button after first tap (show spinner)
- Implement idempotency keys on Convex mutations
- Use Convex's built-in optimistic concurrency control
- Validate server-side balance before deducting
- Show "Processing..." state that blocks duplicate actions
- Log double-tap attempts for monitoring

**Warning signs:**
- Balance decreases by 2x payment amount
- Multiple transaction signatures for single payment
- User complaints of overcharging
- Race conditions in mutation logs

**Phase to address:**
**Phase 2: Real-Time Balance & State** — Implement idempotency and button state management during spend mutations.

**Severity:** HIGH — Direct financial impact on users

---

### Pitfall 13: Privy Key Recovery Failure

**What goes wrong:**
User gets new phone, reinstalls PWA. Tries to sign in with Google. Privy can't recover wallet key. User's tokens are lost. Support can't help. User angry, leaves bad reviews.

**Why it happens:**
Privy uses Shamir's secret sharing for key recovery. Requires:
- Original OAuth account (Google/Apple) still accessible
- At least one recovery method configured (email, device backup)
- User didn't clear browser data between sessions

If user changes Google account or clears storage, recovery fails.

**How to avoid:**
- Force email verification during initial wallet creation
- Prompt users to set up recovery methods immediately
- Show "Your wallet is not backed up!" warning if recovery incomplete
- Test recovery flow: reinstall PWA, attempt login
- Document recovery process in user-facing FAQ
- Provide merchant-assisted recovery as last resort

**Warning signs:**
- "Unable to recover wallet" errors in testing
- Users losing access after reinstall
- Privy logs showing missing recovery shares
- Support tickets for lost wallet access

**Phase to address:**
**Phase 1: Foundation & Auth** — Implement and test wallet recovery flow. Document recovery process for support.

**Severity:** CRITICAL — Permanent loss of user funds

---

### Pitfall 14: Offline Transaction Queue Without Sync

**What goes wrong:**
User pays while offline (transaction queued in background sync). Comes online 3 hours later. Background sync fails silently. Transaction never processes. Merchant never paid. User thinks they paid. Dispute ensues.

**Why it happens:**
Service worker background sync is unreliable. If sync fails (server error, network blip), browser may not retry. User has no indication that queued transaction failed.

**How to avoid:**
- Show explicit "You're offline" banner
- Display "Pending transactions: X" count prominently
- Don't allow payments when offline (show "Connect to internet")
- Or: Allow offline payments but show "Will process when online" with clear notification
- Sync pending transactions on app foreground (not just background)
- Implement manual "Retry pending transactions" button

**Warning signs:**
- Transactions in Convex but not on-chain
- Users claiming they paid offline
- Background sync failures in service worker logs
- Inconsistent balance between online/offline states

**Phase to address:**
**Phase 4: Scaling & Optimization** — Implement offline queue management and sync notification.

**Severity:** MEDIUM — Payment disputes, support overhead

---

### Pitfall 15: WebSocket Connection Exhaustion

**What goes wrong:**
Each PWA tab opens a WebSocket connection to Convex for real-time updates. User opens 5 tabs. 20,000 users × 5 tabs = 100,000 connections. Convex connection limit hit. New users can't connect. App breaks.

**Why it happens:**
Convex has connection limits per deployment (exact limits depend on plan). Users don't close tabs, browsers keep connections alive. Connection pool exhausted during peak event.

**How to avoid:**
- Detect multiple tabs and show "Close other tabs" warning
- Implement tab leader election: only one tab subscribes to real-time updates
- Use Convex's built-in connection pooling and reconnection logic
- Monitor connection count and set alerts at 80% of limit
- Design for graceful fallback: polling if WebSocket unavailable
- Test with multiple tabs per user in staging

**Warning signs:**
- "Maximum connections exceeded" errors
- New users unable to connect during events
- Real-time updates failing for some users
- Connection count growing linearly with user count

**Phase to address:**
**Phase 4: Scaling & Optimization** — Monitor connection usage, implement tab management, test at scale.

**Severity:** HIGH — Blocks new users during peak periods

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| **Skip wallet recovery testing** | Faster MVP launch | Permanent fund loss risk | NEVER |
| **Use public RPC endpoints** | Free development | Rate limit exhaustion at scale | Dev only, never production |
| **Hardcode token address** | Simpler config | Can't deploy to multiple events | Never (use env variables) |
| **Skip webhook signature verification** | Faster development | Security vulnerability, fake payments | NEVER |
| **Optimistic updates without rollback UX** | Instant feedback | User confusion on failures | Only with proper rollback design |
| **Monolithic Convex functions** | Faster development | Hard to optimize at scale | MVP only, refactor before scaling |
| **No storage monitoring** | Simpler code | Safari crashes at 50MB | Never (monitor from day one) |
| **Skip network validation** | Faster setup | Mainnet/devnet mix-ups | NEVER |
| **Manual service worker caching** | No library dependency | Stale code issues, broken updates | Never (use Serwist) |
| **Test QR scanner on desktop only** | Faster testing | iOS PWA camera failures | Never (test on physical iOS) |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Privy** | Checking `isAuthenticated()` only on app load | Check before every wallet operation; handle session expiry |
| **Convex** | Using `useEffect` for data fetching | Use `useQuery` hooks with automatic subscriptions |
| **Stripe** | Processing webhooks without signature verification | Always verify HMAC signature; reject unverified requests |
| **Solana RPC** | Using public endpoints for production | Use Helius/QuickNode dedicated endpoints; implement retry logic |
| **Helius** | Not setting priority fees | Include 0.0001 SOL minimum; use Jito bundles for congestion |
| **Serwist** | Using `next-pwa` (deprecated) | Use `@serwist/next` with `skipWaiting: true` |
| **qr-scanner** | Testing in browser only | Test on physical iOS device; provide manual fallback |
| **Zustand** | Using for server state | Use only for UI state; Convex for server state |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| **Polling for balance** | 5,000 users × 2-second polls = 2,500 req/sec | Use Convex subscriptions (WebSocket) | 1,000+ concurrent users |
| **No query batching** | N+1 query problems; slow balance loads | Batch similar queries; use Convex's batching | 500+ concurrent users |
| **Cache misses on event start** | Thundering herd; database lockup | Pre-warm cache before event; use stale-while-revalidate | 5,000+ concurrent users |
| **Sync blockchain reads** | Balance checks block UI; slow loads | Cache in Convex; show cached balance immediately | 1,000+ concurrent users |
| **No connection pooling** | WebSocket exhaustion; new users blocked | Limit tabs per user; use tab leader election | 10,000+ concurrent users |
| **Monolithic mutations** | Slow functions; timeouts at scale | Break into smaller atomic functions | 5,000+ concurrent operations |
| **No rate limiting** | Spammers exhaust RPC quota | Implement per-user rate limits | Public launch |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| **Treasury key in frontend code** | Anyone can drain treasury | Store only in Convex Actions (server-side); never in client code |
| **Skip webhook signature verification** | Fake payment events; free tokens | Always verify Stripe webhook signatures with HMAC |
| **Mainnet keys in devnet** | Real funds lost during testing | Use separate .env files; validate network on startup |
| **Expose RPC endpoint in client** | Rate limit exploitation | Use environment variable; never hardcode in client |
| **No input validation on spend amount** | Negative spends; overflow exploits | Validate all inputs with Zod schemas; check bounds |
| **Privy app ID exposed** | Not critical (public by design) | Acceptable; app ID is public knowledge |
| **Token address hardcoded** | Can't deploy to multiple events | Use environment variable; validate on startup |
| **No CSRF protection on mutations** | Cross-site request forgery | Convex provides CSRF protection; don't bypass |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| **Success message before on-chain confirmation** | User walks away; transaction fails; confusion | Show "Processing..." until confirmed; success only after settlement |
| **No error explanation on rollback** | Balance changes randomly; users panic | Show explicit error: "Transaction failed. Balance reverted." |
| **Camera permission denied unclear** | User can't scan QR; gives up | Explain: "Camera required for QR payments. Enable in Settings." |
| **Install prompt too aggressive** | Users annoyed; decline installation | Show on 2nd visit; after meaningful interaction |
| **No offline indicator** | User doesn't know why app is slow | Show persistent "You're offline" banner |
| **Loading states with no feedback** | User thinks app frozen | Show spinner + "Processing..." + estimated time |
| **Transaction history not searchable** | Can't find specific payment | Add search by merchant, amount, date |
| **No way to retry failed transaction** | Must start over; frustrating | Add "Retry" button on failed transactions |
| **Balance hidden by default** | Can't quickly check funds | Show balance; provide optional mask toggle |
| **No logout button** | Users feel trapped | Add logout in settings (warn about wallet access) |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Wallet creation:** Often missing recovery flow setup — verify user can reinstall PWA and recover wallet with same Google account
- [ ] **QR scanning:** Often missing iOS PWA testing — verify camera works on physical iPhone, not just browser
- [ ] **Top-up flow:** Often missing webhook signature verification — verify fake webhook events are rejected
- [ ] **Balance display:** Often missing real-time subscriptions — verify balance updates without page refresh across multiple tabs
- [ ] **Payment flow:** Often missing double-tap prevention — verify tapping "Pay" twice rapidly doesn't charge twice
- [ ] **Service worker:** Often missing update strategy — verify deployed updates reach installed PWAs within 5 minutes
- [ ] **Offline mode:** Often missing sync notification — verify pending transactions show explicit "Will process when online" message
- [ ] **Optimistic updates:** Often missing rollback UX — verify failed transactions show clear error message, not silent revert
- [ ] **Transaction history:** Often missing pagination — verify app doesn't crash with 100+ transactions
- [ ] **Network configuration:** Often missing runtime validation — verify app displays "DEVNET" prominently in development

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| **RPC rate limit hit** | HIGH | 1. Switch to backup RPC endpoint 2. Implement request queuing 3. Add aggressive caching 4. Monitor for 24 hours |
| **Transaction dropped** | MEDIUM | 1. Check transaction status on Solana Explorer 2. If expired, resubmit with higher priority fee 3. If confirmed, refresh balance 4. If failed, show error and retry |
| **Optimistic rollback** | MEDIUM | 1. Show explicit error: "Transaction failed. Balance reverted." 2. Log failure for monitoring 3. Offer retry with explanation 4. Check balance on-chain to verify state |
| **ATA creation failed** | MEDIUM | 1. Check if ATA exists now (retry may have worked) 2. If not, create ATA proactively 3. Retry original transfer 4. Contact support if still failing |
| **Privy session expired** | LOW | 1. Show "Session expired. Please sign in again." 2. Redirect to login 3. After login, return to original action 4. Monitor for frequent expirations |
| **Service worker stale code** | LOW | 1. Push update with `skipWaiting: true` 2. Prompt users to refresh 3. If persistent, add cache-busting version query param 4. Document manual clear cache steps |
| **Mainnet/devnet mix-up** | CRITICAL | 1. IMMEDIATELY revoke compromised keys 2. Move remaining funds to new treasury 3. Audit all transactions during mix-up period 4. Document incident for compliance |
| **Safari storage full** | LOW | 1. Implement storage pruning (keep last 50 transactions) 2. Show "Storage full" message with clear cache button 3. Migrate to IndexedDB if using Cache API 4. Monitor storage usage proactively |
| **Webhook signature bypass** | CRITICAL | 1. SHUTDOWN webhook endpoint immediately 2. Audit all webhook events since deployment 3. Reverse fraudulent transactions 4. Add signature verification 5. Rotate webhook secret |
| **Double-spending** | MEDIUM | 1. Reconcile Convex state with on-chain state 2. Refund excess charges to users 3. Implement idempotency keys 4. Add disable-on-click to payment buttons |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| **RPC rate limit exhaustion** | Phase 1: Foundation & Auth | Test with 100+ concurrent users; monitor RPC usage |
| **Transaction drops** | Phase 3: Payments & QR Scanning | Simulate congestion; verify retry with priority fees |
| **Optimistic rollback UX** | Phase 2: Real-Time Balance & State | Test failure scenarios; verify rollback messaging |
| **ATA creation failures** | Phase 1: Foundation & Auth | Create ATA during wallet creation; test fresh wallets |
| **Privy auth state drift** | Phase 1: Foundation & Auth | Test expired sessions; verify auth checks before operations |
| **Service worker stale code** | Phase 1: Foundation & Auth | Deploy updates; verify installed PWAs update within 5 min |
| **iOS camera access** | Phase 3: Payments & QR Scanning | Test on physical iPhone; verify manual fallback |
| **Webhook signature bypass** | Phase 2: Real-Time Balance & State | Test fake webhooks; verify rejection with 401 |
| **Mainnet/devnet mix-up** | Phase 1: Foundation & Auth | Add network validation; test environment switching |
| **Safari storage full** | Phase 2: Real-Time Balance & State | Monitor storage usage; test with 100+ transactions |
| **Thundering herd** | Phase 4: Scaling & Optimization | Load test with 5,000+ concurrent users |
| **Double-spending** | Phase 2: Real-Time Balance & State | Test rapid double-tap; verify single charge |
| **Key recovery failure** | Phase 1: Foundation & Auth | Reinstall PWA; verify wallet recovery with Google |
| **Offline sync failure** | Phase 4: Scaling & Optimization | Test offline payment → online sync; verify notification |
| **WebSocket exhaustion** | Phase 4: Scaling & Optimization | Monitor connections; test multiple tabs per user |

## Severity Prioritization

For roadmap planning, address in order:

### CRITICAL (Must prevent before production)
1. Treasury key exposure (Pitfall from Security Mistakes)
2. Webhook signature bypass (Pitfall 8)
3. Mainnet/devnet mix-up (Pitfall 9)
4. Key recovery failure (Pitfall 13)
5. RPC rate limit exhaustion (Pitfall 1)

### HIGH (Significant user impact)
6. Transaction drops (Pitfall 2)
7. Optimistic rollback (Pitfall 3)
8. ATA creation failures (Pitfall 4)
9. Privy auth state drift (Pitfall 5)
10. iOS camera access (Pitfall 7)
11. Thundering herd (Pitfall 11)
12. Double-spending (Pitfall 12)

### MEDIUM (Manageable but painful)
13. Service worker stale code (Pitfall 6)
14. Safari storage full (Pitfall 10)
15. Offline sync failure (Pitfall 14)
16. WebSocket exhaustion (Pitfall 15)

## Sources

### Primary (HIGH Confidence)
- [Solana RPC Optimization Guide - Helius](https://www.helius.dev/docs/rpc/optimization-techniques) - RPC rate limits and optimization
- [Enhancing SPL Token Transfers - Chainstack](https://docs.chainstack.com/docs/enhancing-solana-spl-token-transfers-with-retry-logic) - ATA creation and retry logic
- [Convex Error Handling Documentation](https://docs.convex.dev/functions/error-handling/) - Optimistic update rollback
- [Stripe Webhook Security - Official Docs](https://docs.stripe.com/security) - Webhook signature verification
- [Solana Transaction Confirmation - Official Docs](https://solana.com/developers/guides/advanced/confirmation) - Transaction lifecycle and drops
- [PWA iOS Limitations - MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) - 50MB cache limit, camera issues
- [Next.js PWA Official Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Service worker updates
- [Privy Embedded Wallets Troubleshooting](https://docs.privy.io/basics/troubleshooting/troubleshooting-embedded-wallets) - Auth state management
- [Optimistic UI Updates - Dev.to](https://dev.to/hexshift/how-to-implement-optimistic-ui-updates-in-react-without-overcomplicating-your-code-e5j) - Race conditions
- [IndexedDB Max Storage Limits - RxDB](https://rxdb.info/articles/indexeddb-max-storage-limit.html) - Storage quotas

### Secondary (MEDIUM Confidence)
- [Solana Devnet vs Mainnet - Medium](https://medium.com/@palmartin99/deploying-a-solana-rust-program-in-2025-devnet-mainnet-beta-in-9-minutes-flat-616913bcdb96) - Configuration mistakes
- [Beating Thundering Herd - Medium](https://medium.com/@aliaftabk/when-your-cache-kills-your-database-beating-the-thundering-herd-problem-in-production-f5fedb42078f) - Cache stampede prevention
- [10 Solana Mobile UX Patterns - Medium](https://medium.com/@Quaxel/10-solana-mobile-ux-patterns-that-won-non-crypto-users-5832809c3e7b) - Transaction confirmation UX
- [Offline-First PWA Caching - Zeepalm](https://www.zeepalm.com/blog/pwa-offline-functionality-caching-strategies-checklist) - Service worker strategies
- [Convex High Throughput Patterns](https://stack.convex.dev/high-throughput-mutations-via-precise-queries) - Write contention solutions
- [Embedded Wallets 101 - Privy](https://www.privy.io/embedded-wallets-101) - Best practices
- [PWA Offline Capabilities - Progressier](https://progressier.com/pwa-capabilities/how-to-make-a-pwa-work-offline) - Offline limitations

### Tertiary (LOW Confidence - Community Reports)
- [html5-qrcode Issue #713 - GitHub](https://github.com/mebjas/html5-qrcode/issues/713) - iOS PWA camera bug
- [Solana Network Congestion - Reddit](https://www.reddit.com/r/solana/comments/1c07ncn/many_solana_users_report_network_congestion_but_the/) - Transaction drops reports
- [Web3Auth Social Login Issues - MetaMask Forum](https://builder.metamask.io/t/is-my-web3auth-social-login-google-permanently-locked-due-to-mfa-on-the-development-network/2713) - Auth problems
- [Stack Overflow: Offline PWA Communication](https://stackoverflow.com/questions/62917312/offline-pwa-communication-between-clients) - Offline limitations

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Blockchain Integration (Solana, RPC, SPL) | HIGH | Official Solana/Helius docs; multiple verified sources |
| Optimistic UI Patterns | HIGH | Official Convex docs; multiple 2025 sources |
| PWA Limitations (iOS, Safari) | HIGH | Multiple 2025 sources with specific issues documented |
| Stripe Webhook Security | HIGH | Official Stripe security documentation |
| Privy Integration | MEDIUM | Official docs + some community reports; fewer production benchmarks |
| High-Concurrency Patterns | MEDIUM | General best practices + Convex-specific; limited real-world event data |
| Wallet Recovery | MEDIUM | Official docs + community issues; less verification at scale |

## Research Date & Validity

**Researched:** 2025-01-16
**Valid until:** 2025-03-01 (45 days - fast-moving domain)
**Review trigger:** Major Solana updates, Privy changes, PWA API modifications, or security incidents

---

**Pitfalls research for:** High-Frequency Event Wallet PWA (Solana, Convex, Privy, Next.js 16)
**Researched:** 2025-01-16
**Next review:** 2025-03-01 or earlier if critical issues discovered
