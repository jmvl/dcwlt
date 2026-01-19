'use client';

import { useQuery } from '@tanstack/react-query';
import { getSPLTokenBalance } from '../../src/utils/transactions';

// Event Token mint address on Solana Devnet
const TOKEN_MINT_ADDRESS = '4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq';

/**
 * React Query hook for fetching Solana token balance
 *
 * Uses React Query for:
 * - Automatic caching (30s stale time)
 * - Background refetch
 * - Optimistic updates
 * - Loading/error states
 *
 * @param walletAddress - Solana wallet address to fetch balance for
 * @returns Query result with balance data
 *
 * @example
 * ```tsx
 * const { data: balance, isLoading, error, refetch } = useSolanaBalance(walletAddress);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * return <div>Balance: {balance} EVT</div>;
 * ```
 */
export function useSolanaBalance(walletAddress?: string) {
  return useQuery({
    // Query key uniquely identifies this data
    queryKey: ['solana-balance', TOKEN_MINT_ADDRESS, walletAddress],

    // Fetch function
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }

      console.log('[useSolanaBalance] Fetching balance for:', walletAddress);

      const balance = await getSPLTokenBalance(
        walletAddress,
        TOKEN_MINT_ADDRESS
      );

      console.log('[useSolanaBalance] Balance fetched:', balance);

      return balance;
    },

    // Only run query if wallet address is available
    enabled: !!walletAddress,

    // Data stays fresh for 30 seconds
    staleTime: 30 * 1000,

    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,

    // Retry failed requests once
    retry: 1,
  });
}

/**
 * Type for the balance data returned by useSolanaBalance
 */
export type SolanaBalanceData = number;

/**
 * Query key factory for balance queries
 * Useful for manual invalidation/refetch
 */
export const balanceQueryKeys = {
  all: ['solana-balance'] as const,
  detail: (walletAddress: string) =>
    ['solana-balance', TOKEN_MINT_ADDRESS, walletAddress] as const,
};
