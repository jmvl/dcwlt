'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated';

export function usePrivyAuth() {
  const { ready, authenticated, user, login } = usePrivy();

  // api.users.createFromPrivy will be undefined during SSR build, but will be available at runtime
  const createUser = useMutation(api.users.createFromPrivy);

  useEffect(() => {
    // When user authenticates with Privy, create Convex record
    if (ready && authenticated && user && api?.users?.createFromPrivy) {
      const solanaWallet = user.linkedAccounts.find(
        (account: any) => account.type === 'wallet' && account.chainType === 'solana'
      );

      if (solanaWallet && 'address' in solanaWallet) {
        createUser({
          walletAddress: solanaWallet.address as string,
        });
      }
    }
  }, [ready, authenticated, user, createUser]);

  return { ready, authenticated, user, login };
}
