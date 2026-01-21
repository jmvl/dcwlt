# High-Frequency Event Wallet PWA

## What This Is

A Progressive Web App (PWA) for live event payments using Next.js 16, Convex, Privy, and Solana Devnet. Users install the PWA via QR code, sign in with social auth (Google/Apple), purchase event tokens (SPL) via Stripe, and spend them at venues by scanning merchant QR codes. Replaces the existing React Native POC with a web-first architecture optimized for high-concurrency scenarios (20,000 users in 15-minute windows).

## Core Value

**Frictionless payments at scale.** attendees spend tokens instantly (<200ms UI feedback) even when cellular networks are saturated, while maintaining blockchain security for settlement.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **PWA Installation** - Users can install the app via QR code scan (stadium seat backs, flyers) without App Store review
- [ ] **Social Auth Wallet** - Privy embedded wallet creation via Google/Apple login (no seed phrases)
- [ ] **Top-Up Flow** - Stripe checkout triggers real SPL token transfer from treasury to user wallet on Solana Devnet
- [ ] **QR Payment** - User scans merchant QR, sees optimistic balance update immediately, backend settles asynchronously
- [ ] **Real-Time Balance** - Balance updates reflect in UI without page reload via Convex subscriptions
- [ ] **Offline QR** - User's wallet QR (public key) cached for offline display/identification

### Out of Scope

- **Mainnet deployment** — Devnet only for MVP validation; mainnet requires security audit, legal compliance
- **Thundering Herd optimization** — Full 20,000-user concurrency optimization deferred until MVP validates core flows
- **iOS/Android native apps** — PWA deliberately chosen to avoid App Store/Play Store review cycles
- **Card payments at POS** — Token-only system; fiat payments handled via top-up flow only
- **Multi-token support** — Single event token per deployment initially
- **P2P transfers** — User-to-user transfers not in scope for venue payments
- **Merchant dashboard** — Merchants use static QR codes initially; dynamic pricing deferred

## Context

**Technical Environment:**
- PWA architecture chosen to bypass app store approval delays (critical for event-specific deployments)
- Convex replaces traditional API/SQL stack for automatic websocket connections and real-time state sync
- Privy selected for embedded wallet UX (social login → silent keypair generation, no seed phrase management)
- Helius RPC with Jito Bundles planned for mainnet to guarantee transaction inclusion during network spikes

**Prior Work:**
- Existing React Native POC (event-wallet/) validated Gmail login → Solana wallet → SPL token flows
- Demonstrated Web3Auth integration but required custom dev build ( Expo Go incompatibility)
- Backend top-up API (backend/) and merchant QR generation (merchant/) provide reference implementations

**User Research Themes:**
- Live events have compressed time windows (halftime, intermission) — throughput > feature richness
- Cellular networks saturate at venues — optimistic UI required even when blockchain lags
- Attendees won't manage seed phrases — social auth mandatory
- Stadium operators need 0-click install — QR code to PWA install is critical path

**Known Issues:**
- Existing POC used Web3Auth; Privy chosen for better embedded wallet UX and reliability
- React Native build complexity (custom dev client) drove PWA pivot
- Top-up flow timing (~2-5s for on-chain confirmation) acceptable for purchases, not for POS spends

## Constraints

- **Tech Stack**: Next.js 16+ (App Router), Convex, Privy, Stripe, Solana Devnet, Shadcn/UI — chosen for PWA support, real-time sync, and developer velocity
- **Timeline**: MVP validation on Devnet before mainnet planning — prevents blocking on security audits during architecture validation
- **Network**: Solana Devnet only for MVP — mainnet requires production security practices, legal review, and stress testing
- **Performance**: <200ms UI feedback for spends (optimistic updates); 2-5s acceptable for top-ups (on-chain confirmation)
- **Dependencies**: Helius Business Tier for mainnet RPC; Privy for auth; Stripe for fiat on-ramp
- **Security**: Treasury private key never exposed to frontend; all signing in Convex Actions (server-side)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA vs Native App | Bypass App Store review; 0-click install via QR; works on low bandwidth | — Pending |
| Convex vs Express/SQL | Automatic websockets; real-time state sync; optimistic updates built-in | — Pending |
| Privy vs Web3Auth | Better embedded wallet UX; more reliable under load; social login first-class | — Pending |
| Hybrid Ledger (on-chain top-ups, off-chain spends) | Blockchain settlement too slow for POS; maintains security for source of truth | — Pending |
| Devnet for MVP | Validate architecture without mainnet risks; faster iteration; no real money at stake | — Pending |

---
*Last updated: 2026-01-16 after initialization*
