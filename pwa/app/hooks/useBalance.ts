/**
 * useBalance Hook - Database Token Balance
 *
 * React hook for querying Convex database for token balance.
 * Used when USE_DATABASE_TOKENS feature flag is enabled.
 *
 * Uses Convex real-time subscriptions for instant balance updates.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Query keys for balance queries (for consistency, though Convex handles caching)
 */
export const balanceQueryKeys = {
  all: ["convex-balance"] as const,
  detail: (walletAddress: string) => ["convex-balance", walletAddress] as const,
};

/**
 * Hook for fetching token balance from Convex database
 *
 * @param walletAddress - The wallet address to fetch balance for
 * @returns Object with balance, isLoading, and error states
 *
 * @example
 * const { balance, isLoading, error } = useBalance(walletAddress);
 */
export function useBalance(walletAddress: string | undefined) {
  // Use "skip" token pattern when walletAddress is undefined
  // Convex will not execute the query when passed "skip"
  const balance = useQuery(
    api.wallets.getBalance,
    walletAddress ? { walletAddress } : "skip"
  );

  return {
    balance: balance?.tokenBalance ?? 0,
    fiatBalance: balance?.fiatBalance ?? 0,
    updatedAt: balance?.updatedAt ?? null,
    isLoading: balance === undefined,
    error: null, // Convex handles errors through error boundaries
  };
}
