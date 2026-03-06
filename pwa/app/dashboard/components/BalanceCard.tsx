'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useBalance } from '../../hooks/useBalance';
import { usePrivyAuth } from '../../hooks/usePrivyAuth';

export function BalanceCard() {
  const { user, userEmail } = usePrivyAuth();
  const [isMasked, setIsMasked] = useState(false);

  // Get wallet address from Privy user
  const solanaWallet = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'solana'
  );
  const walletAddress = solanaWallet && 'address' in solanaWallet ? solanaWallet.address : undefined;

  // Fetch balance from Convex (database tokens)
  const { balance, isLoading } = useBalance(walletAddress);
  const tokenBalance = balance ?? 0;
  const displayBalance = isMasked ? '•••' : Math.floor(tokenBalance).toString();

  // Get user's name from email
  const displayName = userEmail?.split('@')[0] || 'User';
  const userName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  // Format wallet address like card number (XXXX XXXX XXXX XXXX)
  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return '•••• •••• •••• ••••';
    const start = address.slice(0, 4);
    const middle = address.slice(4, 8);
    const end = address.slice(-4);
    return `${start} ${middle} •••• ${end}`;
  };

  return (
    <div className="px-4 py-4">
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          aspectRatio: '1.586/1',
          minHeight: '180px'
        }}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#1A202C]/80 animate-pulse backdrop-blur-sm z-20" />
        )}

        {/* Subtle card texture pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

        {/* Card content */}
        <div className="relative z-10 flex flex-col h-full p-5 justify-between">
          {/* Top row: Card brand & eye toggle */}
          <div className="flex justify-between items-start">
            {/* Card logo/brand */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">account_balance_wallet</span>
              </div>
              <div>
                <p className="text-white/90 text-xs font-semibold tracking-wider">EVENT WALLET</p>
                <p className="text-white/60 text-[10px]">Debit Card</p>
              </div>
            </div>

            {/* Balance visibility toggle */}
            <button
              onClick={() => setIsMasked(!isMasked)}
              className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/90 transition-all active:scale-95"
              aria-label={isMasked ? 'Show balance' : 'Hide balance'}
            >
              {isMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Middle: Chip icon (decorative) */}
          <div className="flex justify-start">
            <div
              className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-300/90 to-yellow-500/90 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-6 rounded border border-white/40 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-0.5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-white/60 rounded-sm" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Balance and card details */}
          <div className="space-y-3">
            {/* Balance amount */}
            <div>
              <p className="text-white/70 text-[10px] font-medium tracking-wider uppercase mb-0.5">Available Balance</p>
              <p className="text-white text-3xl font-bold tracking-tight drop-shadow-lg">
                {displayBalance} <span className="text-lg font-semibold text-white/90">EVT</span>
              </p>
            </div>

            {/* Card number and holder info */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/60 text-[9px] font-medium tracking-wider uppercase mb-0.5">Card Number</p>
                <p className="text-white text-sm font-mono tracking-wide">
                  {formatWalletAddress(walletAddress)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[9px] font-medium tracking-wider uppercase mb-0.5">Card Holder</p>
                <p className="text-white text-sm font-semibold tracking-wide uppercase">
                  {userName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
