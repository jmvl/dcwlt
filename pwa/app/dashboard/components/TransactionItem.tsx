'use client';

import { formatTransactionTime } from '../../utils/formatTime';

interface TransactionItemProps {
  itemName: string;
  timestamp: number;
  amount: number;
}

export function TransactionItem({ itemName, timestamp, amount }: TransactionItemProps) {
  // Color code amounts: cyan for positive, red-orange for negative
  const amountColor = amount >= 0 ? 'text-[#00BCD4]' : 'text-[#FF6B35]';
  const amountPrefix = amount >= 0 ? '+' : '';

  const timeAgo = formatTransactionTime(timestamp);

  return (
    <div className="flex items-center gap-4 bg-[#0F192E] rounded-2xl px-5 min-h-[88px] py-2 justify-between shadow-elevation-sm">
      <div className="flex items-center gap-4">
        {/* Transaction icon */}
        <div className="text-white flex items-center justify-center rounded-xl bg-[#141E33] shrink-0 size-12">
          <span className="material-symbols-outlined text-[#00BCD4]">
            payments
          </span>
        </div>

        {/* Transaction details */}
        <div className="flex flex-col justify-center">
          <p className="text-white text-lg font-bold leading-normal">{itemName}</p>
          <p className="text-[#8E9ABB] text-sm font-medium">{timeAgo}</p>
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
