'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated';
import { usePrivyAuth } from '../hooks/usePrivyAuth';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';

export function BalanceDisplay() {
  const { ready, authenticated, user } = usePrivyAuth();
  const [isMasked, setIsMasked] = useState(true);

  // Get wallet address from Privy user's embedded wallet
  const walletAddress = user?.wallet?.address;

  // Real-time balance subscription
  const { data: balance, isLoading, error } = useQuery(
    api.wallets.getBalance,
    walletAddress ? { walletAddress } : 'skip'
  );

  // Handle refresh (query auto-refreshes from Convex subscription)
  const handleRefresh = () => {
    // Query will auto-refresh from Convex subscription
    window.location.reload();
  };

  // Toggle balance visibility
  const toggleMask = () => setIsMasked(!isMasked);

  // Loading state
  if (!ready || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
        <p className="mt-4 text-[#9db0b9]">Loading balance...</p>
      </div>
    );
  }

  // Error state
  if (error || !balance) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <p className="text-[#9db0b9]">Unable to load balance</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return null;
  }

  // Format balance (convert from lamports to tokens, assuming 9 decimals)
  const tokenBalance = balance.tokenBalance / 1e9;
  const fiatBalance = balance.fiatBalance || tokenBalance * 0.10; // Mock conversion
  const displayBalance = isMasked ? '••••••' : tokenBalance.toFixed(2);
  const displayFiat = isMasked ? '••••••' : `$${fiatBalance.toFixed(2)}`;
  const lastUpdated = new Date(balance.updatedAt).toLocaleTimeString();

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full">
      {/* Large Balance Display */}
      <div className="text-center">
        <div className="text-[#9db0b9] text-sm mb-2">Event Token Balance</div>
        <div className="text-7xl font-bold text-white mb-2">
          {displayBalance} <span className="text-4xl text-[#13a4ec]">EVT</span>
        </div>
        <div className="text-[#9db0b9] text-xl mb-4">{displayFiat}</div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center items-center">
          <button
            onClick={toggleMask}
            className="p-2 rounded-lg bg-[#1a2f38] hover:bg-[#243b47] transition-colors"
            aria-label={isMasked ? 'Show balance' : 'Hide balance'}
          >
            {isMasked ? (
              <Eye className="w-5 h-5 text-[#9db0b9]" />
            ) : (
              <EyeOff className="w-5 h-5 text-[#9db0b9]" />
            )}
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-[#1a2f38] hover:bg-[#243b47] transition-colors"
            aria-label="Refresh balance"
          >
            <RefreshCw className="w-5 h-5 text-[#9db0b9]" />
          </button>
        </div>

        {/* Last Updated */}
        <div className="text-[#9db0b9] text-xs mt-4">Last updated: {lastUpdated}</div>
      </div>
    </div>
  );
}
