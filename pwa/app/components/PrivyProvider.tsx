'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode, useEffect, useState } from 'react';

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

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
        // Privy used only for social authentication
        // Solana wallet creation disabled - wallets managed by database tokens
        embeddedWallets: {
          solana: {
            createOnLogin: 'off',
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
