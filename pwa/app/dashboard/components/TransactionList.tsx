'use client';

import { useUserTransactions } from '../../hooks/useUserTransactions';
import { TransactionItem } from './TransactionItem';
import { usePrivyAuth } from '../../hooks/usePrivyAuth';

export function TransactionList() {
  const { user } = usePrivyAuth();

  // Get wallet address from Privy user
  const solanaWallet = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'solana'
  );
  const walletAddress = solanaWallet && 'address' in solanaWallet ? solanaWallet.address : undefined;

  // Query user transactions
  const transactions = useUserTransactions(walletAddress);

  // Loading state
  if (transactions === undefined) {
    return (
      <div className="p-4">
        <h3 className="text-white text-lg font-bold mb-3">Recent Activities</h3>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1c2a31]/40 rounded-2xl h-[80px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-white text-lg font-bold mb-3">Recent Activities</h3>
        <div className="bg-[#1c2a31]/40 rounded-2xl p-6 text-center border border-white/5">
          <span className="material-symbols-outlined text-[#9db0b9] text-4xl mb-2">receipt_long</span>
          <p className="text-[#9db0b9] text-sm">No transactions yet</p>
          <p className="text-[#6b7d85] text-xs mt-1">Scan a QR code to make your first payment</p>
        </div>
      </div>
    );
  }

  // Transaction list
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white text-lg font-bold">Recent Activities</h3>
        {/* See All link - will go to history page in future phase */}
        <span className="text-[#13a4ec] text-xs font-bold">See All</span>
      </div>

      <div className="flex flex-col gap-3">
        {transactions.map((tx) => (
          <TransactionItem
            key={tx._id}
            itemName={tx.itemName}
            timestamp={tx.timestamp}
            amount={tx.amount}
          />
        ))}
      </div>
    </div>
  );
}
