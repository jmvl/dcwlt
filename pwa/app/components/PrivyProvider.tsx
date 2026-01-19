'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { ReactNode, useEffect, useState, useMemo } from 'react';

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // Memoize RPC configuration to prevent infinite re-renders
  // MUST be called before any conditional returns (Rules of Hooks)
  // createSolanaRpc and createSolanaRpcSubscriptions must only be called once
  const solanaConfig = useMemo(() => ({
    'solana:devnet': {
      rpc: createSolanaRpc('https://api.devnet.solana.com'),
      rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com'),
    },
  }), []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

  if (!isClient) {
    // Skip PrivyProvider during SSR
    return <>{children}</>;
  }

  if (!appId) {
    console.warn('NEXT_PUBLIC_PRIVY_APP_ID not set - Privy auth will not work');
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Configure Solana Devnet RPC for embedded wallets
        // Required for balance queries and wallet operations
        solana: {
          rpcs: solanaConfig,
        },
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
        appearance: {
          theme: 'dark',
          accentColor: '#13a4ec',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
