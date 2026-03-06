'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';
import { storeUserType, clearStoredUserType } from '../utils/logout';

export function usePrivyAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  // api.users.createFromPrivy will be undefined during SSR build, but will be available at runtime
  const createUser = useMutation(api.users.createFromPrivy);
  const migratePrivyId = useMutation(api.users.migratePrivyId);

  // Extract user's email address for display
  const userEmail = (user?.linkedAccounts?.find(
    (account: any) => (account.type === 'email' || account.type === 'google')
  ) as any)?.address as string | undefined;

  useEffect(() => {
    // When user authenticates with Privy, create Convex record
    if (ready && authenticated && user && api?.users?.createFromPrivy) {
      const solanaWallet = user.linkedAccounts?.find(
        (account: any) => account.type === 'wallet' && account.chainType === 'solana'
      );

      if (solanaWallet && 'address' in solanaWallet) {
        console.log('[usePrivyAuth] Creating/updating wallet record:', solanaWallet.address);
        // Extract email from Privy user (email/google accounts have 'email' property)
        const emailAccount = user.linkedAccounts?.find(
          (account: any) => (account.type === 'email' || account.type === 'google')
        );
        // Privy email/google accounts have structure: { type, email }
        const email = (emailAccount as any)?.email as string | undefined;

        createUser({
          walletAddress: solanaWallet.address as string,
          email: email,
          privyId: user.id, // Pass Privy user ID for QR auth
        });
        // Store user type for session tracking
        storeUserType('user');
      }
    }
  }, [ready, authenticated, createUser]);

  // Migration effect: ensure privyId is set for existing users
  useEffect(() => {
    if (ready && authenticated && user && api?.users?.migratePrivyId) {
      const solanaWallet = user.linkedAccounts?.find(
        (account: any) => account.type === 'wallet' && account.chainType === 'solana'
      );

      if (solanaWallet && 'address' in solanaWallet && user.id) {
        migratePrivyId({
          walletAddress: solanaWallet.address as string,
          privyId: user.id,
        }).catch((err) => {
          // Silently fail - user might not exist yet
          console.log('[usePrivyAuth] Migration skipped:', err.message);
        });
      }
    }
  }, [ready, authenticated, migratePrivyId]);

  // Wrap logout to clear stored user type
  const handleLogout = async () => {
    clearStoredUserType();
    await logout();
  };

  return { ready, authenticated, user, userEmail, login, logout: handleLogout };
}
