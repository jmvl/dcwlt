# Logout Functionality Implementation Summary

## Overview
Implemented a comprehensive logout system that properly handles session management for all user types (users, merchants, admins) with session isolation and type tracking.

## Changes Made

### 1. New Utility File: `/pwa/app/utils/logout.ts`

Created a centralized logout utility with the following features:

#### Functions:
- **`performLogout(userType)`** - Standalone function for logout
- **`useLogout(userType)`** - React hook for components
- **`checkSessionTypeMismatch(userType, user)`** - Validates session type
- **`storeUserType(userType)`** - Stores current user type in sessionStorage
- **`getStoredUserType()`** - Retrieves stored user type
- **`clearStoredUserType()`** - Clears stored user type
- **`clearAllSessionData()`** - Clears all session data

#### Features:
- Type-safe with TypeScript (`UserType = 'user' | 'merchant' | 'admin'`)
- Automatic routing to correct login pages:
  - `user` → `/`
  - `merchant` → `/merchant/login`
  - `admin` → `/admin`
- Error handling with fallback redirects
- Session type tracking via sessionStorage

### 2. Updated Components

#### `/pwa/app/merchant/layout.tsx`
**Before:**
```typescript
const handleLogout = async () => {
  router.push('/merchant/login');  // Only redirected, didn't logout
};
```

**After:**
```typescript
import { useLogout } from '../utils/logout';
const { logout: handleLogout } = useLogout('merchant');  // Properly logs out
```

#### `/pwa/app/admin/layout.tsx`
**Before:**
```typescript
const { ready, user, login, logout } = usePrivyAuth();
const handleLogout = async () => {
  await logout();
  router.push('/');
};
```

**After:**
```typescript
import { useLogout } from '../utils/logout';
const { ready, user, login } = usePrivyAuth();
const { logout: handleLogout } = useLogout('admin');
```

#### `/pwa/app/components/LoginButton.tsx`
**Before:**
```typescript
const { ready, authenticated, user, login, logout } = usePrivyAuth();
// Called logout() directly
```

**After:**
```typescript
import { useLogout } from '../utils/logout';
const { ready, authenticated, user, login } = usePrivyAuth();
const { logout } = useLogout('user');
```

### 3. Enhanced Auth Hooks

#### `/pwa/app/hooks/usePrivyAuth.ts`
Added session type tracking:
```typescript
import { storeUserType, clearStoredUserType } from '../utils/logout';

// Stores 'user' type on authentication
storeUserType('user');

// Clears on logout
const handleLogout = async () => {
  clearStoredUserType();
  await logout();
};
```

#### `/pwa/app/components/MerchantAuthProvider.tsx`
Added session type validation:
```typescript
import { storeUserType, getStoredUserType, clearStoredUserType, ... } from '../utils/logout';

// Check for session type mismatch
const storedUserType = getStoredUserType();
if (storedUserType && storedUserType !== 'merchant') {
  console.log('[MerchantAuthProvider] Session type mismatch:', storedUserType, '!= merchant');
  clearStoredUserType();
  router.push('/merchant/login');
  return;
}

// Store merchant type on successful auth
storeUserType('merchant');
```

#### `/pwa/app/admin/layout.tsx`
Added session type validation:
```typescript
import { getStoredUserType, clearStoredUserType, storeUserType } from '../utils/logout';

useEffect(() => {
  if (user && isAdmin) {
    const storedUserType = getStoredUserType();
    if (storedUserType && storedUserType !== 'admin') {
      console.log('[AdminLayout] Session type mismatch:', storedUserType, '!= admin');
      clearStoredUserType();
      router.push('/admin');
    } else if (!storedUserType) {
      storeUserType('admin');
    }
  }
}, [user, isAdmin, router]);
```

## Session Flow

### Login Flow
1. User authenticates with Privy
2. Auth provider detects successful authentication
3. Auth provider calls `storeUserType(type)` where type is 'user', 'merchant', or 'admin'
4. User type stored in `sessionStorage` as `dcwlt_user_type`

### Logout Flow
1. User clicks logout button
2. Component calls `handleLogout()` from `useLogout(userType)`
3. Hook calls `clearStoredUserType()` to clear sessionStorage
4. Hook calls Privy's `logout()` to clear authentication session
5. Hook redirects to appropriate login page based on user type

### Session Type Mismatch Detection
1. User navigates to a route (e.g., `/merchant`)
2. Auth provider checks `getStoredUserType()`
3. If stored type doesn't match current route:
   - Log the mismatch
   - Clear stored type
   - Redirect to appropriate login page

## Testing Scenarios

### Scenario 1: User Login → Logout
1. Navigate to `/`
2. Click "Sign in to Wallet"
3. Authenticate with Privy
4. Verify `sessionStorage.dcwlt_user_type === 'user'`
5. Click "Sign Out"
6. Verify redirect to `/`
7. Verify `sessionStorage.dcwlt_user_type` is null

### Scenario 2: Merchant Login → Logout
1. Navigate to `/merchant/login`
2. Authenticate as merchant
3. Verify `sessionStorage.dcwlt_user_type === 'merchant'`
4. Click "Logout" in merchant portal
5. Verify redirect to `/merchant/login`
6. Verify `sessionStorage.dcwlt_user_type` is null

### Scenario 3: Admin Login → Logout
1. Navigate to `/admin`
2. Authenticate as admin (@dcwlt.com or @accelior.com)
3. Verify `sessionStorage.dcwlt_user_type === 'admin'`
4. Click "Logout" in admin panel
5. Verify redirect to `/admin`
6. Verify `sessionStorage.dcwlt_user_type` is null

### Scenario 4: Session Type Mismatch (User → Merchant)
1. Login as user (navigate to `/`, authenticate)
2. Verify `sessionStorage.dcwlt_user_type === 'user'`
3. Navigate to `/merchant/login`
4. Authenticate with merchant account
5. Provider detects mismatch, clears session
6. Verify `sessionStorage.dcwlt_user_type === 'merchant'`

### Scenario 5: Session Type Mismatch (Merchant → Admin)
1. Login as merchant (navigate to `/merchant/login`, authenticate)
2. Verify `sessionStorage.dcwlt_user_type === 'merchant'`
3. Navigate to `/admin`
4. Authenticate with admin account
5. Admin layout detects mismatch, clears session
6. Verify `sessionStorage.dcwlt_user_type === 'admin'`

### Scenario 6: Multiple Logout Attempts
1. Login as user
2. Logout
3. Immediately login as merchant
4. Logout
5. Immediately login as admin
6. Logout
7. Verify each transition properly clears the previous session

## Technical Details

### Session Storage Key
- **Key:** `dcwlt_user_type`
- **Values:** `'user'`, `'merchant'`, `'admin'`, or `null`
- **Scope:** Session-specific (cleared when browser tab closes)

### Route Mapping
```typescript
const LOGOUT_ROUTES: Record<UserType, string> = {
  user: '/',
  merchant: '/merchant/login',
  admin: '/admin',
};
```

### Error Handling
- All logout functions have try-catch blocks
- If Privy logout fails, still clears sessionStorage and redirects
- Console logging for debugging session mismatches

### Type Safety
- Full TypeScript support with `UserType` enum
- Compile-time validation of user type values
- Type-safe routing with `Record<UserType, string>`

## Files Modified

1. `/pwa/app/utils/logout.ts` - **NEW** - Centralized logout utility
2. `/pwa/app/merchant/layout.tsx` - **UPDATED** - Use useLogout hook
3. `/pwa/app/admin/layout.tsx` - **UPDATED** - Use useLogout hook + session validation
4. `/pwa/app/components/LoginButton.tsx` - **UPDATED** - Use useLogout hook
5. `/pwa/app/hooks/usePrivyAuth.ts` - **UPDATED** - Store/clear user type
6. `/pwa/app/components/MerchantAuthProvider.tsx` - **UPDATED** - Session validation

## Benefits

1. **Consistent Logout Behavior** - All user types use the same logout mechanism
2. **Session Isolation** - Sessions are tracked by type, preventing conflicts
3. **Automatic Redirects** - Users are always redirected to the correct login page
4. **Type Safety** - TypeScript prevents invalid user types
5. **Error Resilience** - Graceful handling of logout failures
6. **Debugging Support** - Console logging for session mismatches
7. **Maintainability** - Single source of truth for logout logic

## Future Enhancements

Potential improvements for future consideration:

1. **Backend Session Validation** - Validate session type against backend
2. **Session Expiry** - Add automatic session timeout
3. **Multi-Device Support** - Sync session state across devices
4. **Audit Logging** - Track login/logout events for security
5. **Session Recovery** - Allow users to resume sessions after refresh
