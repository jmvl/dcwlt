# Roadmap: High-Frequency Event Wallet PWA

## Overview

A Progressive Web App (PWA) for live event payments using Next.js 16, Convex, Privy, and Solana Devnet. Users install via QR code, sign in with social auth, purchase event tokens, and spend them by scanning merchant QR codes. This roadmap delivers an MVP on Devnet with frictionless payments at scale.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: PWA Foundation** - Installable PWA with service worker caching
- [x] **Phase 2: Auth + Wallet + Core UI** - Social login, embedded wallet, real-time balance display
- [ ] **Phase 3: Top-Up + Payments** - Mock top-up flow, QR scanning, payment execution
- [ ] **Phase 4: History + Offline** - Transaction history, offline support

## Phase Details

### Phase 1: PWA Foundation
**Goal**: Installable PWA with offline-capable service worker
**Depends on**: Nothing (first phase)
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, PWA-06, PWA-07, PWA-08, PWA-09
**Success Criteria** (what must be TRUE):
  1. User can install PWA via QR code scan
  2. PWA launches in standalone mode (not browser tab)
  3. App loads offline (service worker caching active)
  4. iOS Safari shows "Add to Home Screen" fallback
**Research**: Unlikely (Next.js 16 + Serwist patterns established)
**Plans**: TBD

Plans:
- [ ] 01-01: Next.js 16 project with PWA manifest
- [ ] 01-02: Serwist service worker configuration
- [ ] 01-03: PWA install prompt with QR code flow

### Phase 2: Auth + Wallet + Core UI
**Goal**: Social login with embedded wallet and real-time balance display
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, BAL-01, BAL-02, BAL-03, BAL-04, BAL-05, BAL-06, BAL-07, BAL-08
**Success Criteria** (what must be TRUE):
  1. User can sign in with Google or Apple
  2. Wallet address displayed immediately after login
  3. Large balance shown on dashboard
  4. Balance updates in real-time via WebSocket
**Research**: Likely (Privy integration new to codebase)
**Research topics**: Privy OAuth flows, embedded wallet UX patterns, rate limits for concurrent auth
**Plans**: TBD

Plans:
- [x] 02-01: Privy integration with social auth providers
- [x] 02-02: Convex setup with wallet schema
- [x] 02-03: Balance display component with real-time subscriptions
- [x] 02-04: Dashboard layout with Shadcn/UI

### Phase 3: Top-Up + Payments
**Goal**: Mock top-up flow and QR code payment execution
**Depends on**: Phase 2
**Requirements**: TOP-01, TOP-02, TOP-03, TOP-04, TOP-05, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, PAY-07
**Success Criteria** (what must be TRUE):
  1. User can complete mock top-up and see balance update
  2. User can scan merchant QR code
  3. Payment confirmation screen shown before signing
  4. Success/error feedback after payment
**Research**: Likely (Solana web3.js 2.0 new, iOS PWA camera access)
**Research topics**: Solana web3.js 2.0 functional patterns, qr-scanner PWA compatibility on iOS
**Plans**: TBD

Plans:
- [ ] 03-01: Mock top-up flow (no Stripe yet)
- [ ] 03-02: QR code scanner with camera access
- [ ] 03-03: Solana Pay URL parsing
- [ ] 03-04: Payment signing and transaction submission

### Phase 4: History + Offline
**Goal**: Transaction history and offline support
**Depends on**: Phase 3
**Requirements**: HIST-01, HIST-02, HIST-03, HIST-04, HIST-05, HIST-06, OFF-01, OFF-02, OFF-03, OFF-04, OFF-05, OFF-06
**Success Criteria** (what must be TRUE):
  1. Transaction history list shows all activity
  2. Offline banner shown when disconnected
  3. Last-known balance displayed when offline
**Research**: Unlikely (builds on Phase 1 service worker)
**Plans**: TBD

Plans:
- [ ] 04-01: Transaction history component with Convex queries
- [ ] 04-02: Offline detection and banner
- [ ] 04-03: Runtime caching for API responses

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. PWA Foundation | 3/3 | Complete | 2026-01-16 |
| 2. Auth + Wallet + Core UI | 4/4 | Complete | 2026-01-16 |
| 3. Top-Up + Payments | 0/4 | Not started | - |
| 4. History + Offline | 0/3 | Not started | - |
