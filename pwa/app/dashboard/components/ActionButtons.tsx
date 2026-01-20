'use client';

import Link from 'next/link';
import { toast } from 'sonner';

export function ActionButtons() {
  const handleCashOut = () => {
    toast.info('Cash Out', {
      description: 'Coming soon! This feature will be available in a future update.',
    });
  };

  return (
    <div className="flex justify-center items-center gap-12 bg-[#1c2a31]/50 rounded-2xl p-6 border border-white/5">
      {/* Top Up Button */}
      <Link
        href="/topup"
        className="flex flex-col items-center gap-2 cursor-pointer group"
      >
        <div className="action-button-circle group-active:scale-95 transition-transform">
          <span className="material-symbols-outlined font-bold">add</span>
        </div>
        <p className="text-white text-xs font-bold">Top Up</p>
      </Link>

      {/* Cash Out Button */}
      <button
        onClick={handleCashOut}
        className="flex flex-col items-center gap-2 cursor-pointer group"
      >
        <div className="action-button-circle group-active:scale-95 transition-transform">
          <span className="material-symbols-outlined font-bold">account_balance</span>
        </div>
        <p className="text-white text-xs font-bold">Cash Out</p>
      </button>
    </div>
  );
}
