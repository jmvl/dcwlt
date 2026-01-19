'use client';

import { usePrivy } from '@privy-io/react-auth';

/**
 * Check if the user has a Solana embedded wallet
 * Returns the wallet if found, null otherwise
 */
export function useSolanaWallet() {
  const { user, ready } = usePrivy();

  if (!ready || !user) {
    return { solanaWallet: null, isEmbedded: false, walletDetails: null };
  }

  const solanaWallet = user.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'solana'
  );

  if (!solanaWallet) {
    return { solanaWallet: null, isEmbedded: false, walletDetails: null };
  }

  const walletDetails = {
    address: (solanaWallet as any).address,
    walletClientType: (solanaWallet as any).walletClientType,
    connectorType: (solanaWallet as any).connectorType,
  };

  // Check if it's an embedded wallet
  const isEmbedded =
    walletDetails.walletClientType === 'privy' ||
    walletDetails.connectorType === 'privy' ||
    !walletDetails.connectorType;

  console.log('[useSolanaWallet] Wallet found:', {
    address: walletDetails.address,
    walletClientType: walletDetails.walletClientType,
    connectorType: walletDetails.connectorType,
    isEmbedded,
  });

  return { solanaWallet, isEmbedded, walletDetails };
}
