'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useSolanaBalance } from '../../hooks/useSolanaBalance';
import { usePrivyAuth } from '../../hooks/usePrivyAuth';

export function BalanceCard() {
  const { user } = usePrivyAuth();
  const [isMasked, setIsMasked] = useState(true);

  // Get wallet address from Privy user
  const solanaWallet = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'solana'
  );
  const walletAddress = solanaWallet && 'address' in solanaWallet ? solanaWallet.address : undefined;

  // Fetch balance
  const { data: balance, isLoading } = useSolanaBalance(walletAddress);
  const tokenBalance = balance ?? 0;
  const displayBalance = isMasked ? '•••••••' : tokenBalance.toFixed(2);

  return (
    <div
      className="flex flex-col items-stretch justify-end rounded-2xl shadow-lg relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(0, 188, 212, 0.4) 0%, rgba(10, 18, 41, 0.95) 100%)',
        minHeight: '220px'
      }}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#1c2a31] animate-pulse" />
      )}

      <div className="flex w-full items-end justify-between gap-4 p-8 relative z-10">
        <div className="flex max-w-[440px] flex-1 flex-col gap-1">
          <p className="text-white/80 text-lg font-medium leading-normal">Total Balance</p>
          <p className="text-white tracking-tight text-[56px] font-extrabold leading-none">
            {displayBalance} EVT
          </p>
        </div>
        <button
          onClick={() => setIsMasked(!isMasked)}
          className="flex min-w-[48px] h-12 cursor-pointer items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all active:scale-95"
          aria-label={isMasked ? 'Show balance' : 'Hide balance'}
        >
          {isMasked ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
