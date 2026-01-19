'use client';

import { useMerchantAuth } from '../../components/MerchantAuthProvider';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Search,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useMerchantLiveTransactions } from '@/app/hooks/useMerchantLiveTransactions';
import { toast } from 'sonner';

export default function MerchantSalesPage() {
  const { merchant } = useMerchantAuth();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [searchWallet, setSearchWallet] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchWallet);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchWallet]);

  // Use live hook instead of direct useQuery
  const { transactions, allTransactions, isLoading, isNewPayment } =
    useMerchantLiveTransactions(merchant!._id, { dateRange, searchWallet: debouncedSearch });

  // Show toast notification for new payment
  useEffect(() => {
    if (isNewPayment && transactions && transactions.length > 0) {
      const newTx = transactions[0]; // Most recent transaction
      toast.success(`New payment: ${newTx.itemName} - ${newTx.amount} EVT`);
    }
  }, [isNewPayment, transactions]);

  // Update stats to use allTransactions (unfiltered) for accurate totals
  const stats = useMemo(() => {
    if (!allTransactions) return null;

    const confirmed = allTransactions.filter((tx) => tx.status === 'confirmed');

    return {
      totalSales: confirmed.reduce((sum, tx) => sum + tx.amount, 0),
      transactionCount: confirmed.length,
      averageTransaction: confirmed.length > 0
        ? confirmed.reduce((sum, tx) => sum + tx.amount, 0) / confirmed.length
        : 0,
      todaySales: confirmed
        .filter((tx) => tx.timestamp >= Date.now() - 24 * 60 * 60 * 1000)
        .reduce((sum, tx) => sum + tx.amount, 0),
    };
  }, [allTransactions]);

  // Format relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Truncate wallet address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  // Date range buttons
  const dateRanges = [
    { value: 'today' as const, label: 'Today' },
    { value: 'week' as const, label: 'Week' },
    { value: 'month' as const, label: 'Month' },
    { value: 'all' as const, label: 'All Time' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Sales History</h1>
        <p className="mt-2 text-[#9db0b9]">View your payment transactions and sales statistics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Sales */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38] hover:border-[#13a4ec]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-[#13a4ec]" />
            <span className="text-xs text-[#9db0b9]">Total</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {stats?.totalSales ? stats.totalSales.toFixed(2) : '0.00'}
            <span className="text-lg text-[#9db0b9] ml-1">EVT</span>
          </div>
          <div className="text-xs text-[#9db0b9] mt-2">
            From {stats?.transactionCount || 0} transaction{stats?.transactionCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38] hover:border-[#13a4ec]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="w-5 h-5 text-[#13a4ec]" />
            <span className="text-xs text-[#9db0b9]">Count</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {stats?.transactionCount || 0}
          </div>
          <div className="text-xs text-[#9db0b9] mt-2">
            Confirmed payments
          </div>
        </div>

        {/* Average Transaction */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38] hover:border-[#13a4ec]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-[#13a4ec]" />
            <span className="text-xs text-[#9db0b9]">Average</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {stats?.averageTransaction ? stats.averageTransaction.toFixed(2) : '0.00'}
            <span className="text-lg text-[#9db0b9] ml-1">EVT</span>
          </div>
          <div className="text-xs text-[#9db0b9] mt-2">
            Per transaction
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38] hover:border-[#13a4ec]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-[#13a4ec]" />
            <span className="text-xs text-[#9db0b9]">Today</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {stats?.todaySales ? stats.todaySales.toFixed(2) : '0.00'}
            <span className="text-lg text-[#9db0b9] ml-1">EVT</span>
          </div>
          <div className="text-xs text-[#9db0b9] mt-2">
            Last 24 hours
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a2f38] rounded-lg border border-[#1a2f38] p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#9db0b9]" />
            <div className="flex gap-2">
              {dateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range.value
                      ? 'bg-[#13a4ec] text-white'
                      : 'bg-[#101c22] text-[#9db0b9] hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9db0b9]" />
            <input
              type="text"
              placeholder="Search by wallet address..."
              value={searchWallet}
              onChange={(e) => setSearchWallet(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#101c22] border border-[#1a2f38] rounded-lg text-white text-sm placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-[#1a2f38] rounded-lg border border-[#1a2f38]">
        <div className="p-4 border-b border-[#1a2f38]">
          <h2 className="text-lg font-semibold text-white">Transactions</h2>
        </div>

        <div className="p-4">
          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13a4ec]" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            /* Empty state */
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-[#9db0b9] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No transactions yet</h3>
              <p className="text-sm text-[#9db0b9]">
                Transactions will appear here when customers pay using your QR codes.
              </p>
            </div>
          ) : (
            /* Transactions table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2f38]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#9db0b9] uppercase tracking-wider">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#9db0b9] uppercase tracking-wider">
                      Item
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#9db0b9] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#9db0b9] uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#9db0b9] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-[#9db0b9] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.map((tx) => {
                    const explorerUrl = tx.signature
                      ? `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`
                      : null;

                    return (
                      <tr
                        key={tx._id}
                        className="border-b border-[#1a2f38] hover:bg-[#243b47]/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-[#9db0b9]">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(tx.timestamp)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-white">
                            {tx.itemName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-bold text-red-400">
                            -{tx.amount.toFixed(2)} EVT
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-mono text-[#9db0b9]">
                            {truncateAddress(tx.customerWallet)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              tx.status
                            )}`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {explorerUrl && (
                            <a
                              href={explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#13a4ec] hover:text-[#0d8ac4] transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Explorer
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
