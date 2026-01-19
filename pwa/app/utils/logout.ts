'use client';

import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

/**
 * User types for logout routing
 */
export type UserType = 'user' | 'merchant' | 'admin';

/**
 * Route destinations for each user type after logout
 */
const LOGOUT_ROUTES: Record<UserType, string> = {
  user: '/',
  merchant: '/merchant/login',
  admin: '/admin',
};

/**
 * Performs a complete logout for the specified user type.
 *
 * This function:
 * 1. Calls Privy's logout() to clear the authentication session
 * 2. Redirects to the appropriate login page for the user type
 *
 * NOTE: This is a standalone function that requires the Privy logout function
 * to be passed in. For React components, use the useLogout() hook instead.
 *
 * @param userType - The type of user logging out ('user' | 'merchant' | 'admin')
 * @param privyLogout - The Privy logout function (from usePrivy hook)
 * @returns Promise that resolves when logout is complete
 *
 * @example
 * ```ts
 * // In a component, use the hook instead:
 * const { logout: handleLogout } = useLogout('merchant');
 * await handleLogout();
 * ```
 */
export async function performLogout(
  userType: UserType,
  privyLogout: () => Promise<void>
): Promise<void> {
  try {
    // Clear the Privy session
    await privyLogout();

    // Redirect to appropriate login page
    const destination = LOGOUT_ROUTES[userType];
    if (typeof window !== 'undefined') {
      window.location.href = destination;
    }
  } catch (error) {
    console.error(`[performLogout] Error during ${userType} logout:`, error);
    // Still redirect even if logout fails
    const destination = LOGOUT_ROUTES[userType];
    if (typeof window !== 'undefined') {
      window.location.href = destination;
    }
  }
}

/**
 * Hook for performing logout with a specific user type.
 *
 * This hook encapsulates the performLogout function for use in React components.
 *
 * @param userType - The type of user ('user' | 'merchant' | 'admin')
 * @returns An object with a logout function
 *
 * @example
 * ```tsx
 * function MerchantLayout() {
 *   const { logout: handleLogout } = useLogout('merchant');
 *
 *   return (
 *     <button onClick={handleLogout}>
 *       Logout
 *     </button>
 *   );
 * }
 * ```
 */
export function useLogout(userType: UserType) {
  const router = useRouter();
  const { logout: privyLogout } = usePrivy();

  const logout = async () => {
    try {
      // Clear the stored user type
      clearStoredUserType();

      // Clear the Privy session
      await privyLogout();

      // Redirect to appropriate login page
      const destination = LOGOUT_ROUTES[userType];
      router.push(destination);
    } catch (error) {
      console.error(`[useLogout] Error during ${userType} logout:`, error);
      // Still redirect even if logout fails
      clearStoredUserType();
      const destination = LOGOUT_ROUTES[userType];
      router.push(destination);
    }
  };

  return { logout };
}

/**
 * Checks if the current session matches the expected user type.
 * Returns true if there's a mismatch and the user should be logged out.
 *
 * This can be used in auth providers to detect when a user is authenticated
 * but trying to access the wrong type of route (e.g., a merchant trying to
 * access admin routes).
 *
 * @param currentUserType - The expected user type for the current route
 * @param user - The Privy user object
 * @returns true if session type mismatch detected
 *
 * @example
 * ```tsx
 * // In an auth provider
 * const sessionMismatch = checkSessionTypeMismatch('merchant', user);
 * if (sessionMismatch) {
 *   await performLogout('merchant');
 * }
 * ```
 */
export function checkSessionTypeMismatch(
  currentUserType: UserType,
  user: any
): boolean {
  // For now, we don't have explicit session type tracking in Privy
  // This function is a placeholder for future enhancement
  // where we might store userType in localStorage or track it in the user metadata

  // Future implementation could check:
  // - localStorage for a stored user type
  // - User metadata in Privy
  // - Backend session state

  return false;
}

/**
 * Stores the current user type in session storage.
 * Use this when a user successfully authenticates.
 *
 * @param userType - The type of user that just logged in
 */
export function storeUserType(userType: UserType): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('dcwlt_user_type', userType);
  }
}

/**
 * Retrieves the stored user type from session storage.
 *
 * @returns The stored user type or null
 */
export function getStoredUserType(): UserType | null {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('dcwlt_user_type');
    if (stored && ['user', 'merchant', 'admin'].includes(stored)) {
      return stored as UserType;
    }
  }
  return null;
}

/**
 * Clears the stored user type from session storage.
 * Call this when logging out.
 */
export function clearStoredUserType(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('dcwlt_user_type');
  }
}

/**
 * Clears all DCWLT session data.
 * Use this when you want to completely reset the authentication state.
 */
export function clearAllSessionData(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('dcwlt_user_type');
  }
}
