---
path: /Users/jm/Codebase/dcwlt/pwa/app/dashboard/page.tsx
type: component
updated: 2025-01-21
status: active
---

# dashboard/page.tsx

## Purpose

Main dashboard page displaying user's wallet balance, action buttons (top-up, scan QR), and transaction history. Shows login prompt for unauthenticated users and full dashboard for authenticated users with bottom navigation.

## Exports

- `DashboardPage` - Dashboard page component with balance, actions, and transactions

## Dependencies

- [[pwa-app-hooks-usePrivyAuth]] - Privy authentication state hook
- [[pwa-app-components-LoginButton]] - Login button for unauthenticated state
- [[pwa-app-dashboard-components-DashboardHeader]] - Dashboard header component
- [[pwa-app-dashboard-components-BalanceCard]] - Balance display card
- [[pwa-app-dashboard-components-ActionButtons]] - Quick action buttons (top-up, scan)
- [[pwa-app-dashboard-components-TransactionList]] - Transaction history list
- [[pwa-app-dashboard-components-DashboardBottomNav]] - Bottom navigation bar

## Used By

TBD
