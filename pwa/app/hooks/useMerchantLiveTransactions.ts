'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useMemo, useState, useEffect } from 'react';

interface FilterOptions {
  dateRange?: 'today' | 'week' | 'month' | 'all';
  searchWallet?: string;
}

export function useMerchantLiveTransactions(
  merchantId: string,
  filters: FilterOptions
) {
  // Stable subscription to all transactions
  const allTransactions = useQuery(api.transactions.listLiveMerchantTransactions, {
    merchantId: merchantId as any,
  });

  // Track previous transaction count for new payment detection
  const [prevCount, setPrevCount] = useState(0);
  const isNewPayment = allTransactions && allTransactions.length > prevCount;

  useEffect(() => {
    if (allTransactions) {
      setPrevCount(allTransactions.length);
    }
  }, [allTransactions]);

  // Client-side filtering
  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return undefined;

    let filtered = [...allTransactions];

    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = Date.now();
      const cutoff = {
        today: now - 24 * 60 * 60 * 1000,
        week: now - 7 * 24 * 60 * 60 * 1000,
        month: now - 30 * 24 * 60 * 60 * 1000,
      }[filters.dateRange];

      filtered = filtered.filter((tx) => tx.timestamp >= cutoff);
    }

    // Apply wallet search filter
    if (filters.searchWallet) {
      filtered = filtered.filter((tx) =>
        tx.customerWallet.toLowerCase().includes(filters.searchWallet!.toLowerCase())
      );
    }

    return filtered;
  }, [allTransactions, filters.dateRange, filters.searchWallet]);

  return {
    transactions: filteredTransactions,
    allTransactions,
    isLoading: allTransactions === undefined,
    isNewPayment,
  };
}
