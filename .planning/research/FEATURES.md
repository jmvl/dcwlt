# Features Research: High-Frequency Event Wallet PWA

**Project:** High-Frequency Event Payment PWA
**Domain:** Crypto Wallet PWA for Stadium/Concert Venues
**Researched:** 2025-01-16
**Overall Confidence:** HIGH

## Executive Summary

Research indicates that payment/crypto wallet PWAs require a baseline set of features for user adoption, with specific differentiators for event venue use cases. The stadium/concert environment presents unique constraints: time pressure (halftime rushes), network saturation (20,000+ users), and new users (first-time wallet creation).

**Key finding:** Event-specific wallets should prioritize **speed over feature richness**. Every additional interaction point is friction that prevents payment completion. The most successful implementations balance instant feedback (optimistic UI) with blockchain settlement security.

## Table Stakes (Must-Have Features)

Features users expect or they will abandon the product. These are non-negotiable for MVP.

### 1. PWA Installation Flow
**Complexity:** Low
**Dependencies:** None (foundation feature)
**User Impact:** Critical

Users must be able to install the PWA via QR code scan from stadium assets (seat backs, flyers, posters).

**Requirements:**
- QR code contains PWA URL with install prompt query parameter
- `beforeinstallprompt` event listener captures install capability
- Custom install button triggers native install dialog
- Manifest configured with standalone display mode
- Icons provided in all required sizes (72x72 to 512x512)
- Theme color matches event branding

**Implementation notes:**
- QR pattern: `https://wallet.event.com/?install=true&token=<unique-id>`
- Service worker caches assets immediately for offline resilience
- Install prompt shown on 2nd page visit (not immediately aggressive)
- Fallback to "Add to Home Screen" instructions for iOS Safari

**Sources:**
- [PWA Install Pattern with QR Code and Token](https://goulet.dev/posts/qr-code-pwa-link-with-token/) (Aug 2025)
- [MDN: Making PWAs Installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) (Nov 2025)

---

### 2. Social Auth Wallet Creation
**Complexity:** Medium
**Dependencies:** PWA installation
**User Impact:** Critical

Wallet creation via Google/Apple login with no seed phrases. Users must create a wallet in <10 seconds to prevent abandonment.

**Requirements:**
- Single "Continue with Google" or "Sign in with Apple" button
- Embedded wallet provider (Privy/Dynamic) generates keypair silently
- No seed phrase display or management (deliberate anti-pattern)
- Wallet address displayed immediately after login
- Email verification if account recovery needed

**Implementation notes:**
- Use Privy SDK for embedded wallet with social providers
- Derive Solana address from OAuth credentials
- Store private key in device secure enclave (not plaintext)
- Show loading spinner during wallet generation (2-3 seconds)
- Redirect to dashboard on success

**Sources:**
- [Embedded Wallets with Social Login](https://www.dynamic.xyz/blog/embedded-wallets-with-social-login-the-standard-for-web3-onboarding)
- [Social Login: Create a Crypto Wallet in Seconds](https://web3.bitget.com/en/blog/articles/wallet-social-login)
- [Ultimate Guide to Embedded Wallets](https://www.alchemy.com/overviews/the-ultimate-guide-to-embedded-wallets-with-social-login)

---

### 3. Real-Time Balance Display
**Complexity:** Medium
**Dependencies:** Wallet creation, Solana RPC
**User Impact:** Critical

Balance must display prominently on dashboard and update in real-time without page refresh.

**Requirements:**
- Large, centered balance display on dashboard (primary UI element)
- Balance updates via WebSocket/subscription (no polling)
- Fiat currency equivalent shown alongside token amount
- Balance masking toggle (show/hide for privacy)
- Loading state during initial balance fetch
- Error state if RPC unavailable

**Implementation notes:**
- Use Convex subscriptions for real-time balance updates
- Cache balance in service worker for offline display
- Display as: "150 EVT ($15.00 USD)"
- Masked state: "••• EVT"
- Refresh button for manual update
- Last updated timestamp shown

**Sources:**
- [Crypto Wallet UX Design Principles](https://www.spacekayak.xyz/blogs/5-ux-design-principles-for-the-best-crypto-wallet-experience)
- [Crypto Wallet UI Design Best Practices](https://ideasoft.io/blog/how-to-create-crypto-wallet-ui/)

---

### 4. Top-Up Flow (Stripe → SPL Tokens)
**Complexity:** High
**Dependencies:** Wallet creation, Treasury wallet
**User Impact:** Critical

Users purchase event tokens via Stripe, triggering SPL token transfer from treasury to user wallet.

**Requirements:**
- Predefined token bundles (e.g., "$20 = 200 EVT")
- Stripe Checkout integration (hosted payment page)
- Webhook triggers backend token transfer
- Transaction signature displayed after successful top-up
- Balance updates automatically after confirmation
- Solana Explorer link for transaction verification

**Implementation notes:**
- Show 3-5 bundle options (not custom amounts)
- Stripe Checkout handles PCI compliance
- Backend acts as fee payer (gasless for user)
- Webhook processes top-up within 5 seconds
- Show success animation with confetti
- Push notification when tokens arrive

**Sources:**
- [How to Build a Digital Wallet in 2025](https://www.scalefocus.com/blog/how-to-build-a-digital-wallet-in-2025/)
- [Crypto Wallet App Development Guide](https://devtechnosys.ae/blog/crypto-wallet-app-development/)

---

### 5. QR Payment Scanning
**Complexity:** Medium
**Dependencies:** Camera permissions, Wallet creation
**User Impact:** Critical

User scans merchant QR code to pay for items. This is the primary spending flow.

**Requirements:**
- Camera access permission request on first use
- QR code scanner with auto-focus
- Parse Solana Pay URL format: `solana:<address>?amount=<value>&spl-token=<TOKEN>`
- Payment confirmation screen before signing
- Transaction signing via wallet provider
- Success/error feedback after payment

**Implementation notes:**
- Use react-qr-reader or similar library
- Show scanning frame overlay on camera feed
- Vibrate on successful QR detection
- Pre-fill confirmation screen with parsed data
- Large "Pay" button (prevent accidental taps)
- 3-second countdown before confirming payment

**Sources:**
- [PWA Payment Wallet Features](https://www.digitalsilk.com/digital-trends/crypto-web-design-tips-best-practices/)
- [Digital Wallet Landscape Analysis](https://www.itu.int/epublications/publication/itu-t-tr-dw-lasf-2025-04-digital-wallet-landscape-analysis-and-security-features)

---

### 6. Transaction History
**Complexity:** Medium
**Dependencies:** Wallet creation, Solana RPC
**User Impact:** High

Users must see their past transactions (top-ups and payments) with searchable, filterable history.

**Requirements:**
- Chronological list of all transactions
- Transaction type icons (top-up vs payment)
- Merchant names for payments
- Amounts with color coding (green for in, red for out)
- Timestamps (relative time: "2 minutes ago")
- Transaction detail view with signature
- Link to Solana Explorer for verification

**Implementation notes:**
- Show last 20 transactions (pagination for older)
- Group by date (Today, Yesterday, This Week)
- Search by merchant name or amount
- Filter by type (All, Top-ups, Payments)
- Pull-to-refresh for latest transactions
- Empty state with helpful message

**Sources:**
- [Bitcoin Design Guide - Activity Screen](https://bitcoin.design/guide/daily-spending-wallet/activity/)
- [Crypto Wallet UI/UX Trends](https://medium.com/@extej/the-evolution-of-crypto-wallet-ui-ux-trends-and-innovations-0ee3861b7bba)

---

### 7. Offline Support
**Complexity:** High
**Dependencies:** Service worker
**User Impact:** High

PWA must function with limited or no connectivity (stadium network saturation).

**Requirements:**
- Service worker caches all static assets
- Runtime caching for API responses
- Offline detection with banner notification
- Cached user wallet QR code (public key)
- Queue transactions for background sync
- Graceful degradation when offline

**Implementation notes:**
- Cache-first strategy for static assets
- Network-first strategy for API calls
- Show "You're offline" banner when disconnected
- Display last-known balance when offline
- Allow QR display even without network
- Background sync when connection restored

**Sources:**
- [MDN: Offline Service Workers](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers)
- [Offline-First PWA Caching Strategies](https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies) (Jan 2026)

---

## Differentiators (Competitive Advantages)

Features that provide unique value for event-specific use cases and differentiate from generic crypto wallets.

### 1. Optimistic Balance Updates
**Complexity:** High
**Dependencies:** Real-time balance display
**User Impact:** Critical (Delight)

Balance updates immediately in UI (<200ms) when payment initiated, before blockchain confirmation. This is the **primary differentiator** for high-frequency venues.

**Requirements:**
- Deduct balance from UI immediately after payment confirmation
- Show "Processing" indicator until blockchain settlement
- Revert balance if transaction fails
- Queue transaction for backend processing
- WebSocket notification when transaction confirms

**Implementation notes:**
- Update Convex state optimistically
- Show green checkmark for success
- Show spinner with "Confirming on Solana..." text
- Retry failed transactions automatically
- Final notification when settled

**Sources:**
- [Designing High-Frequency AI Payment Systems](https://medium.com/@gwrx2005/designing-a-high-frequency-ai-payment-system-inspired-by-x402-847c9eda7a0d)
- [Latency in Real-Time Payments](https://www.billcut.com/blogs/latency-in-real-time-payments-fintech-vs-legacy-rail-speed/) (Nov 2025)

---

### 2. Offline QR Display
**Complexity:** Low
**Dependencies:** Wallet creation
**User Impact:** High

User's wallet QR code (public key) cached for offline display, allowing staff to verify account or process manual transactions.

**Requirements:**
- Generate QR code from wallet address on login
- Cache in service worker for offline access
- Display in "Receive" screen
- Include event branding on QR screen
- Add "Show to staff" instructions

**Implementation notes:**
- QR contains: `solana:<wallet-address>`
- High-contrast QR (black on white)
- Wallet address shown below QR (selectable text)
- Refresh button if QR changes
- Offline banner indicates QR works without network

**Sources:**
- [How to Make a PWA Work Offline](https://progressier.com/pwa-capabilities/how-to-make-a-pwa-work-offline) (Jan 2026)
- [PWA Offline Capabilities](https://www.zeepalm.com/blog/pwa-offline-capabilities-service-workers-and-web-api-integration)

---

### 3. Event-Specific Token Branding
**Complexity:** Low
**Dependencies:** Token creation
**User Impact:** Nice-to-Have (Delight)

Token name, symbol, and branding customized for each event (e.g., "Super Bowl 2025 Token" = SB25).

**Requirements:**
- Custom token name and symbol
- Event logo in balance card
- Event color scheme throughout app
- Token description in settings
- Event date shown in dashboard

**Implementation notes:**
- Load branding from event config
- Token shown as: "150 SB25" not "150 EVT"
- Gradient background with team colors
- Event countdown on dashboard
- "Valid until: [event date]" in settings

**Sources:**
- [How to Choose Event Tokens](https://sportssurge.alibaba.com/guides/event-tokens) (Dec 2025)
- [Multi-Currency Wallets vs Single-Currency](https://www.debutinfotech.com/blog/multi-currency-wallets-vs-single-currency-wallets) (Feb 2025)

---

### 4. Push Notifications
**Complexity:** Medium
**Dependencies:** PWA installation
**User Impact:** Nice-to-Have (Engagement)

Push notifications for top-up confirmation, low balance warnings, and transaction completion.

**Requirements:**
- Request notification permission after first top-up
- Notify when top-up completes
- Notify when payment confirms
- Warn when balance < threshold
- Deep link to app on notification tap

**Implementation notes:**
- Use Web Push API with service worker
- Don't spam (max 3 notifications per session)
- Action buttons on notifications ("View Balance")
- Respect user notification preferences
- Fallback to in-app notifications if denied

**Sources:**
- [PWA vs Native in 2025](https://digitaloneagency.com.au/pwa-vs-native-in-2025-a-no-fluff-decision-guide-for-founders-and-cios/)
- [Evolution of PWAs in 2025](https://nordstone.co.uk/blog/the-evolution-of-progressive-web-apps-pwas)

---

### 5. Venue-Specific Merch Integration
**Complexity:** Medium
**Dependencies:** QR payment scanning
**User Impact:** Nice-to-Have (Convenience)

Merchant QR codes include item details (name, image, category) for richer payment confirmation.

**Requirements:**
- QR contains: `?merchant=Bar+A&item=Beer&amount=10`
- Parse item metadata from QR URL
- Show item image/icon in confirmation screen
- Display merchant logo and category
- Save favorite merchants for quick access

**Implementation notes:**
- Merchant profile in database
- Pre-fetch merchant assets on QR scan
- Show "Bar A - 2 Beers" not just "20 EVT"
- Category icons (food, drink, merch)
- Recent merchants list on dashboard

**Sources:**
- [Sports Venue Ticketing & Cashless Payments](https://oveit.com/markets/sports-venues/)
- [The Digital Wallet Era: Convergence](https://stayrelevant.globant.com/en/technology/sports/the-digital-wallet-era-why-tickets-payments-and-loyalty-will-converge-into-a-single-fan-app/) (Dec 2025)

---

### 6. Quick-Action Buttons
**Complexity:** Low
**Dependencies:** Dashboard layout
**User Impact:** Nice-to-Have (Convenience)

Home screen shortcuts for common actions (Scan QR, Top Up, Balance).

**Requirements:**
- Large, tap-friendly action buttons
- Fingerprint/Face ID for quick balance unmask
- Shake device to open QR scanner
- Long-press balance to copy address
- 3D touch shortcuts on app icon

**Implementation notes:**
- Action bar below balance card
- Icons: Scan (center), Top Up (left), History (right)
- Scan button 2x larger than others
- Haptic feedback on all actions
- Gesture shortcuts for power users

**Sources:**
- [Progressive Web App UX Tips 2025](https://lollypop.design/blog/2025/september/progressive-web-app-ux-tips-2025/)
- [Mobile Wallet Design Patterns](https://mobbin.com/explore/mobile/screens/wallet-balance)

---

## Anti-Features (Deliberately NOT Building)

Features explicitly out of scope for MVP. These add complexity without proportional value for event venue use case.

### 1. Seed Phrase Management
**Why not:** Social auth wallets eliminate seed phrase UX burden. Seed phrases cause user confusion and support overhead.

**Rationale:**
- Users lose seed phrases → lost funds → support nightmare
- Event wallets are low-balance (not life savings)
- Social auth + email recovery sufficient for this use case
- Embedded wallet providers handle key abstraction

**Alternatives:**
- Social login only (Google/Apple)
- Email verification for recovery
- Biometric authentication (Face ID/Fingerprint)

**Sources:**
- [How Seedless Wallets Work](https://onekey.so/blog/ecosystem/how-seedless-wallets-work/)
- [Top 7 Seedless Wallets Of 2024](https://transak.com/blog/top-7-seedless-wallets-of-2024-and-beyond)

---

### 2. P2P Transfers
**Why not:** Event wallets are closed-loop (user → merchant). P2P adds complexity and regulatory concerns.

**Rationale:**
- Stadium use case is spending, not sending
- P2P enables money laundering risks
- Adds UI complexity (send/request screens)
- Not needed for venue payments

**Alternatives:**
- Users top up via Stripe only
- Refunds processed by merchant/organizer
- No user-to-user transfer functionality

---

### 3. Multi-Token Support
**Why not:** Single event token per deployment. Multi-token adds UI complexity without user value.

**Rationale:**
- Events issue one currency (e.g., "SB25" for Super Bowl)
- Users don't need BTC/ETH/USDC in event wallet
- Multi-token UI is confusing for non-crypto users
- Single token simplifies balance display

**Alternatives:**
- One SPL token per event deployment
- Fiat on-ramp via Stripe only
- No token swapping or DEX integration

**Sources:**
- [Multi-Currency Wallets vs Single-Currency](https://www.debutinfotech.com/blog/multi-currency-wallets-vs-single-currency-wallets) (Feb 2025)
- [Reddit: Multichain vs Single Coin Wallets](https://www.reddit.com/r/CryptoCurrency/comments/p7q4tc/multichain_wallet_vs_multiple_single_coin_wallets/)

---

### 4. Card Payments at POS
**Why not:** Token-only system. Cards require hardware integration and PCI compliance.

**Rationale:**
- PWA cannot access NFC on iOS
- Card readers require hardware deployment
- Token payments are faster (no card insertion)
- Closed-loop system simpler operationally

**Alternatives:**
- QR code scanning only
- Top up via Stripe online (pre-event)
- Cash backup if system fails

---

### 5. NFT Ticket Integration
**Why not:** Out of scope for MVP. Ticketing is separate problem from payments.

**Rationale:**
- Most venues have existing ticketing systems
- NFT tickets add wallet complexity
- Not required for payments
- Can integrate in v2 if needed

**Alternatives:**
- Separate ticketing app
- QR code entry via existing system
- Wallet focused on payments only

---

### 6. Advanced Trading Features
**Why not:** Event wallet is spending wallet, not trading platform.

**Rationale:**
- Users don't trade event tokens
- No DEX or swap functionality needed
- Charts/price analysis irrelevant
- Simpler UX without trading features

**Alternatives:**
- Fixed-price top-up only
- No token-to-token swaps
- No price charts or graphs

---

### 7. Multi-Language Support
**Why not:** MVP focused on single market. Adds localization complexity.

**Rationale:**
- Most events are regional
- Translation overhead significant
- Date/time formatting varies
- Can add post-MVP if international

**Alternatives:**
- English only for MVP
- Currency formatting for event location
- Date/time localization only

---

## Feature Dependency Graph

```
PWA Installation (foundation)
├── Social Auth Wallet Creation
│   ├── Real-Time Balance Display
│   │   ├── Top-Up Flow
│   │   └── Transaction History
│   └── QR Payment Scanning
└── Offline Support
    ├── Offline QR Display
    └── Optimistic Balance Updates (depends on Real-Time Balance)

Event-Specific Token Branding (parallel, no dependencies)
Push Notifications (depends on PWA Installation)
Venue-Specific Merch Integration (depends on QR Payment Scanning)
Quick-Action Buttons (depends on Dashboard layout)
```

## Complexity vs Impact Matrix

| Feature | Complexity | User Impact | Priority |
|---------|-----------|-------------|----------|
| PWA Installation | Low | Critical | P0 |
| Social Auth Wallet | Medium | Critical | P0 |
| Real-Time Balance | Medium | Critical | P0 |
| Top-Up Flow | High | Critical | P0 |
| QR Payment Scanning | Medium | Critical | P0 |
| Transaction History | Medium | High | P0 |
| Offline Support | High | High | P1 |
| Optimistic Updates | High | Critical | P0 |
| Offline QR Display | Low | High | P1 |
| Event Branding | Low | Nice-to-Have | P2 |
| Push Notifications | Medium | Nice-to-Have | P2 |
| Merch Integration | Medium | Nice-to-Have | P2 |
| Quick Actions | Low | Nice-to-Have | P2 |

## Event-Specific Constraints

### Time Pressure
- **Constraint:** 15-minute halftime rush = 20,000 concurrent users
- **Impact:** Optimistic UI, batch settlements, offline resilience
- **Metric:** Payment completion < 5 seconds from QR scan

### Network Saturation
- **Constraint:** Stadium Wi-Fi/4G congested during events
- **Impact:** Service worker caching, offline QR display, queueing
- **Metric:** App functions with 500ms latency

### New Users
- **Constraint:** Most users first-time crypto wallet users
- **Impact:** Social auth only, no seed phrases, simple UI
- **Metric:** Wallet creation < 10 seconds

### Low Balance
- **Constraint:** Users hold $20-$100 average (not life savings)
- **Impact:** Email recovery sufficient, not bank-level security
- **Metric:** Support cost < $0.50 per user

## Recommendations

### MVP Scope (P0 Features Only)
1. PWA Installation via QR
2. Social Auth Wallet Creation
3. Real-Time Balance Display
4. Top-Up Flow (Stripe)
5. QR Payment Scanning
6. Transaction History
7. Optimistic Balance Updates

### Post-MVP (P1 Features)
1. Offline Support (full offline mode)
2. Offline QR Display
3. Push Notifications

### Future Enhancements (P2 Features)
1. Event-Specific Branding
2. Venue Merch Integration
3. Quick-Action Buttons
4. Multi-Language Support

## Sources

### Primary (HIGH Confidence)
- [PWA Install Pattern with QR Code and Token](https://goulet.dev/posts/qr-code-pwa-link-with-token/) (Aug 2025)
- [MDN: Making PWAs Installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) (Nov 2025)
- [MDN: Offline Service Workers](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers)
- [Bitcoin Design Guide - Activity Screen](https://bitcoin.design/guide/daily-spending-wallet/activity/)

### Secondary (MEDIUM Confidence)
- [Embedded Wallets with Social Login](https://www.dynamic.xyz/blog/embedded-wallets-with-social-login-the-standard-for-web3-onboarding)
- [Social Login: Create a Crypto Wallet in Seconds](https://web3.bitget.com/en/blog/articles/wallet-social-login)
- [How Seedless Wallets Work](https://onekey.so/blog/ecosystem/how-seedless-wallets-work/)
- [Multi-Currency Wallets vs Single-Currency](https://www.debutinfotech.com/blog/multi-currency-wallets-vs-single-currency-wallets) (Feb 2025)
- [Crypto Wallet UX Design Principles](https://www.spacekayak.xyz/blogs/5-ux-design-principles-for-the-best-crypto-wallet-experience)
- [Offline-First PWA Caching Strategies](https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies) (Jan 2026)
- [Designing High-Frequency AI Payment Systems](https://medium.com/@gwrx2005/designing-a-high-frequency-ai-payment-system-inspired-by-x402-847c9eda7a0d)
- [Latency in Real-Time Payments](https://www.billcut.com/blogs/latency-in-real-time-payments-fintech-vs-legacy-rail-speed/) (Nov 2025)

### Tertiary (LOW Confidence)
- [How to Build a Digital Wallet in 2025](https://www.scalefocus.com/blog/how-to-build-a-digital-wallet-in-2025/)
- [Crypto Wallet App Development Guide](https://devtechnosys.ae/blog/crypto-wallet-app-development/)
- [PWA vs Native in 2025](https://digitaloneagency.com.au/pwa-vs-native-in-2025-a-no-fluff-decision-guide-for-founders-and-cios/)
- [Sports Venue Ticketing & Cashless Payments](https://oveit.com/markets/sports-venues/)
- [The Digital Wallet Era: Convergence](https://stayrelevant.globant.com/en/technology/sports/the-digital-wallet-era-why-tickets-payments-and-loyalty-will-converge-into-a-single-fan-app/) (Dec 2025)

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Table Stakes Features | HIGH | Multiple authoritative sources (MDN, official docs) |
| Social Auth Wallets | HIGH | Verified with provider documentation (Privy, Dynamic) |
| PWA Installation Flow | HIGH | Official MDN documentation + recent 2025 sources |
| Optimistic UI Updates | MEDIUM | Limited specific sources, general best practices |
| Event-Specific Features | MEDIUM | Fewer direct sources, inferred from general wallet patterns |
| Anti-Features Rationale | HIGH | Strong industry consensus (seedless wallets, single-token) |

## Open Questions

1. **Optimistic UI Revert UX:** How should UI handle transaction failures after optimistic update? (Needs user testing)
2. **Push Notification Opt-In Rates:** What % of users enable push notifications for payment confirmations? (Industry data scarce)
3. **Offline Transaction Queue Limits:** How many transactions should queue before blocking user? (No consensus found)
4. **Event Token Recovery:** What happens to unused tokens after event ends? (Policy decision, not technical)

## Research Date & Validity

**Researched:** 2025-01-16
**Valid until:** 2025-03-01 (60 days - fast-moving domain)
**Review trigger:** Major PWA API changes, wallet provider updates, or new Solana features

---

**Next Steps:**
1. Review feature prioritization with stakeholders
2. Validate MVP scope against technical constraints
3. Conduct user research on stadium payment pain points
4. Prototype optimistic UI flow for user testing
5. Define event token post-event policy
