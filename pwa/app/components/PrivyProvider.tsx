'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    throw new Error('Missing NEXT_PUBLIC_PRIVY_APP_ID environment variable');
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
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
