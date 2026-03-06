---
path: /Users/jm/Codebase/dcwlt/pwa/app/utils/logout.ts
type: util
updated: 2025-01-21
status: active
---

# logout.ts

## Purpose

Logout utility with user type routing support. Clears Privy authentication session, stores/clears user type from sessionStorage, routes to appropriate login page after logout (user, merchant, admin), and provides useLogout hook for React components.

## Exports

- `performLogout(userType, privyLogout)` - Standalone logout function with routing
- `useLogout(userType)` - React hook for logout with user type
- `checkSessionTypeMismatch(currentUserType, user)` - Placeholder for session type validation
- `storeUserType(userType)` - Store user type on login
- `getStoredUserType()` - Retrieve stored user type
- `clearStoredUserType()` - Clear user type on logout
- `clearAllSessionData()` - Complete session reset

## Dependencies

- @privy-io/react-auth - Privy logout function

## Used By

TBD
