---
path: /Users/jm/Codebase/dcwlt/pwa/app/layout.tsx
type: component
updated: 2025-01-21
status: active
---

# layout.tsx

## Purpose

Root layout component for the Next.js PWA application. Configures global providers for authentication (Privy), state management (Convex), data fetching (React Query), and service worker registration. Sets up metadata, viewport configuration, and dark theme for the Event Wallet application.

## Exports

- `RootLayout({ children })` - Main layout wrapper that provides authentication and state management context to all pages

## Dependencies

- [[pwa-app-components-PrivyProvider]] - Privy authentication provider for embedded wallets
- [[pwa-app-components-ConvexProvider]] - Convex real-time database provider
- [[pwa-app-components-QueryProvider]] - React Query provider for data fetching
- sonner - Toast notification system
- next/font/google - Manrope font family

## Used By

TBD
