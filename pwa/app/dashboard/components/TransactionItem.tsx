'use client';

import { formatTransactionTime } from '../../utils/formatTime';

interface TransactionItemProps {
  itemName: string;
  timestamp: number;
  amount: number;
  category?: string;
}

// Helper functions for category icons and colors
const getCategoryIcon = (category?: string) => {
  const icons: Record<string, string> = {
    food: 'restaurant',
    tech: 'devices',
    income: 'payments',
    transport: 'directions_car',
    default: 'shopping_bag'
  };
  return category ? icons[category] || icons.default : icons.default;
};

const getCategoryColor = (category?: string) => {
  const colors: Record<string, string> = {
    food: 'text-orange-400',
    tech: 'text-blue-400',
    income: 'text-green-400',
    transport: 'text-purple-400',
    default: 'text-gray-400'
  };
  return category ? colors[category] || colors.default : colors.default;
};

export function TransactionItem({ itemName, timestamp, amount, category }: TransactionItemProps) {
  // Color code amounts: cyan for positive, red-orange for negative
  const amountColor = amount >= 0 ? 'text-[#00BCD4]' : 'text-[#FF6B35]';
  const amountPrefix = amount >= 0 ? '+' : '';

  const timeAgo = formatTransactionTime(timestamp);

  return (
    <div className="flex items-center gap-4 bg-[#1c2a31]/40 rounded-2xl px-5 min-h-[88px] py-2 justify-between shadow-elevation-sm">
      <div className="flex items-center gap-4">
        {/* Transaction icon */}
        <div className="text-white flex items-center justify-center rounded-xl bg-[#283339] shrink-0 size-12">
          <span className={`material-symbols-outlined ${getCategoryColor(category)}`}>
            {getCategoryIcon(category)}
          </span>
        </div>

        {/* Transaction details */}
        <div className="flex flex-col justify-center">
          <p className="text-white text-lg font-bold leading-normal">{itemName}</p>
          <p className="text-[#8E9ABB] text-sm font-medium">{timeAgo}</p>
        </div>
      </div>

      {/* Amount and category */}
      <div className="shrink-0 text-right">
        <p className={`${amountColor} text-lg font-bold`}>
          {amountPrefix}{amount.toFixed(2)} EVT
        </p>
        {category && (
          <p className="text-[#6B7D8F] text-xs uppercase font-bold tracking-wider">
            {category}
          </p>
        )}
      </div>
    </div>
  );
}
