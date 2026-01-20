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
      className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-2xl pt-[100px] shadow-lg relative overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(19, 164, 236, 0.4), rgba(16, 28, 34, 0.95)), url(/images/card-bg.png)',
        minHeight: '220px'
      }}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#1c2a31] animate-pulse" />
      )}

      <div className="flex w-full items-end justify-between gap-4 p-5 relative z-10">
        <div className="flex max-w-[440px] flex-1 flex-col gap-1">
          <p className="text-white/80 text-sm font-medium leading-normal">Total Balance</p>
          <p className="text-white tracking-tight text-4xl font-extrabold leading-tight">
            {displayBalance} EVT
          </p>
        </div>
        <button
          onClick={() => setIsMasked(!isMasked)}
          className="flex min-w-[56px] cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-sm font-bold transition-all"
          aria-label={isMasked ? 'Show balance' : 'Hide balance'}
        >
          {isMasked ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
