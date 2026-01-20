'use client';

import { formatTransactionTime } from '../../utils/formatTime';

interface TransactionItemProps {
  itemName: string;
  timestamp: number;
  amount: number;
  category?: string;
}

export function TransactionItem({ itemName, timestamp, amount, category }: TransactionItemProps) {
  // All transactions are expenses (money out) from customer perspective
  const amountColor = 'text-white';

  const timeAgo = formatTransactionTime(timestamp);

  return (
    <div className="flex items-center gap-4 bg-[#1c2a31]/40 rounded-2xl px-4 min-h-[80px] py-2 justify-between border border-white/5">
      <div className="flex items-center gap-4">
        {/* Transaction icon */}
        <div className="text-white flex items-center justify-center rounded-xl bg-[#283339] shrink-0 size-12">
          <span className="material-symbols-outlined text-orange-400">shopping_bag</span>
        </div>

        {/* Transaction details */}
        <div className="flex flex-col justify-center">
          <p className="text-white text-base font-bold leading-normal">{itemName}</p>
          <p className="text-[#9db0b9] text-xs font-medium">{timeAgo}</p>
        </div>
      </div>

      {/* Amount and category */}
      <div className="shrink-0 text-right">
        <p className={`${amountColor} text-base font-bold`}>
          {amount.toFixed(2)} EVT
        </p>
        {category && (
          <p className="text-[#9db0b9] text-[10px] uppercase font-bold tracking-wider">
            {category}
          </p>
        )}
      </div>
    </div>
  );
}
