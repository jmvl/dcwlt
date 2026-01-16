# Roadmap: High-Frequency Event Wallet PWA

## Overview

Build a Progressive Web App for live event payments using Next.js 16, Convex, Privy, and Solana Devnet. Users install via QR code, sign in with social auth, purchase tokens via Stripe (future), and spend them at venues by scanning merchant QR codes. The journey from zero to working PWA spans five phases: foundation setup, authentication/wallet creation, balance display with mock top-up, QR payments with history, and offline polish.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & PWA Installation** - Next.js 16 PWA with installable QR flow
- [ ] **Phase 2: Authentication & Wallet** - Privy social auth with embedded Solana wallet
- [ ] **Phase 3: Balance & Top-Up (Mock)** - Real-time balance display with mock token top-up
- [ ] **Phase 4: QR Payments & History** - Scan merchant QR codes, spend tokens, view history
- [ ] **Phase 5: Offline & PWA Polish** - Service worker caching, offline support, final polish

## Phase Details

### Phase 1: Foundation & PWA Installation
**Goal**: PWA installs and runs on device
**Depends on**: Nothing (first phase)
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, PWA-06, PWA-07, PWA-08, PWA-09
**Success Criteria** (what must be TRUE):
  1. User can scan QR code and reach PWA URL
  2. Browser shows native install prompt
  3. PWA installs to home screen
  4. PWA launches in standalone mode
  5. Service worker caches static assets
**Research**: Unlikely (Next.js 16 has official PWA guide; patterns well-established)
**Plans**: TBD

Plans:
- [ ] 01-01: Next.js 16 project setup with TypeScript and Tailwind
- [ ] 01-02: Shadcn/UI component library integration
- [ ] 01-03: PWA manifest and Serwist service worker setup
- [ ] 01-04: Install button and beforeinstallprompt handling
- [ ] 01-05: iOS fallback instructions and icon generation

### Phase 2: Authentication & Wallet
**Goal**: Users sign in socially and get a Solana wallet
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07
**Success Criteria** (what must be TRUE):
  1. User sees "Continue with Google" and "Sign in with Apple" buttons
  2. OAuth flow completes and generates wallet silently
  3. Wallet address displayed immediately after login
  4. No seed phrase shown at any point
  5. Loading spinner shows during wallet generation
**Research**: Likely (Privy integration specifics, rate limits, error handling)
**Research topics**: Current Privy React SDK API, OAuth rate limits, Devnet wallet creation patterns, Convex auth integration
**Plans**: TBD

Plans:
- [ ] 02-01: Privy provider setup and social auth buttons
- [ ] 02-02: Embedded wallet creation and Solana keypair derivation
- [ ] 02-03: Convex schema design for users and wallets
- [ ] 02-04: Dashboard layout with wallet address display
- [ ] 02-05: Loading states and error handling

### Phase 3: Balance & Top-Up (Mock)
**Goal**: Users see real-time balance and can simulate adding tokens
**Depends on**: Phase 2
**Requirements**: BAL-01, BAL-02, BAL-03, BAL-04, BAL-05, BAL-06, BAL-07, BAL-08, TOP-01, TOP-02, TOP-03, TOP-04, TOP-05
**Success Criteria** (what must be TRUE):
  1. Large, centered balance displayed on dashboard
  2. Balance updates in real-time without page reload
  3. Mock top-up button adds tokens to balance
  4. Transaction signature shown after top-up
  5. Error state displayed if RPC unavailable
**Research**: Unlikely (Convex optimistic UI patterns documented; mock top-up is straightforward)
**Plans**: TBD

Plans:
- [ ] 03-01: Convex queries for real-time balance fetching
- [ ] 03-02: Balance display component with masking toggle
- [ ] 03-03: Mock top-up UI with predefined bundles
- [ ] 03-04: Optimistic balance updates via Convex mutations
- [ ] 03-05: Transaction history storage and display

### Phase 4: QR Payments & History
**Goal**: Users can scan merchant QR codes and spend tokens
**Depends on**: Phase 3
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, PAY-07, HIST-01, HIST-02, HIST-03, HIST-04, HIST-05, HIST-06
**Success Criteria** (what must be TRUE):
  1. Camera permission requested on first QR scan
  2. QR scanner auto-focuses and reads Solana Pay URLs
  3. Payment confirmation screen shows before signing
  4. Transaction signing completes and balance updates
  5. Transaction history shows all spends and top-ups
**Research**: Likely (iOS PWA camera access known issue area)
**Research topics**: qr-scanner iOS PWA compatibility, Solana Pay URL parsing edge cases, Convex real-time subscriptions
**Plans**: TBD

Plans:
- [ ] 04-01: QR scanner component with camera permissions
- [ ] 04-02: Solana Pay URL parsing and validation
- [ ] 04-03: Payment confirmation screen with amount details
- [ ] 04-04: Transaction signing via Privy wallet
- [ ] 04-05: Transaction history list with type icons
- [ ] 04-06: Transaction detail view with signature link

### Phase 5: Offline & PWA Polish
**Goal**: PWA works offline and feels like a native app
**Depends on**: Phase 4
**Requirements**: OFF-01, OFF-02, OFF-03, OFF-04, OFF-05, OFF-06
**Success Criteria** (what must be TRUE):
  1. Service worker caches all static assets
  2. API responses cached for offline viewing
  3. "You're offline" banner shown when disconnected
  4. Last-known balance displayed when offline
  5. PWA loads in <3 seconds on cached visit
**Research**: Unlikely (Serwist provides established patterns; offline caching is standard)
**Plans**: TBD

Plans:
- [ ] 05-01: Service worker runtime caching strategies
- [ ] 05-02: Offline detection and banner notification
- [ ] 05-03: Cache-first strategy for static assets
- [ ] 05-04: Network-first strategy for API calls
- [ ] 05-05: Asset optimization and bundle analysis

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & PWA Installation | 0/5 | Not started | - |
| 2. Authentication & Wallet | 0/5 | Not started | - |
| 3. Balance & Top-Up (Mock) | 0/5 | Not started | - |
| 4. QR Payments & History | 0/6 | Not started | - |
| 5. Offline & PWA Polish | 0/5 | Not started | - |
