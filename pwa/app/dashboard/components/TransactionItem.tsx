'use client';

import { formatTransactionTime } from '../../utils/formatTime';

interface TransactionItemProps {
  itemName: string;
  timestamp: number;
  amount: number;
}

export function TransactionItem({ itemName, timestamp, amount }: TransactionItemProps) {
  // Color code amounts: teal for positive, red-orange for negative
  const amountColor = amount >= 0 ? 'text-[#0EA5E9]' : 'text-[#FF6B35]';
  const amountPrefix = amount >= 0 ? '+' : '';

  const timeAgo = formatTransactionTime(timestamp);

  return (
    <div className="flex items-center gap-4 bg-[#1A202C] rounded-2xl px-5 min-h-[88px] py-2 justify-between shadow-elevation-sm">
      <div className="flex items-center gap-4">
        {/* Transaction icon */}
        <div className="text-white flex items-center justify-center rounded-xl bg-[#1A202C] shrink-0 size-12">
          <span className="material-symbols-outlined text-[#0EA5E9]">
            payments
          </span>
        </div>

        {/* Transaction details */}
        <div className="flex flex-col justify-center">
          <p className="text-white text-lg font-bold leading-normal">{itemName}</p>
          <p className="text-[#9CA3AF] text-sm font-medium">{timeAgo}</p>
        </div>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p className={`${amountColor} text-lg font-bold`}>
          {amountPrefix}{amount.toFixed(2)} EVT
        </p>
      </div>
    </div>
  );
}
