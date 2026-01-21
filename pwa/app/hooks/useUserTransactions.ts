'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Real-time hook for user's transaction history
 * Automatically subscribes to updates in Convex transactions table
 *
 * @param walletAddress - User's Solana wallet address
 * @returns Last 5 transactions, newest first
 *
 * @example
 * const transactions = useUserTransactions(walletAddress);
 * if (transactions === undefined) return <Spinner />;
 * if (transactions === null) return <EmptyState />;
 * return <TransactionList transactions={transactions} />;
 */
export function useUserTransactions(walletAddress?: string) {
  return useQuery(
    api.transactions.listUserTransactions,
    walletAddress ? { walletAddress, limit: 5 } : "skip"
  );
}
