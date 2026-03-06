'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CustomerQRCode } from '@/app/components/CustomerQRCode';

export function ActionButtons() {
  const [showQR, setShowQR] = useState(false);

  const handleCashOut = () => {
    toast.info('Cash Out', {
      description: 'Coming soon! This feature will be available in a future update.',
    });
  };

  return (
    <>
      <div className="flex justify-center items-center gap-12 py-6">
        {/* Top Up Button */}
        <Link
          href="/topup"
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div className="action-button-circle group-hover:scale-105 group-active:scale-95 transition-transform duration-200">
            <span className="material-symbols-outlined font-bold">add</span>
          </div>
          <p className="text-white text-xs font-bold">Top Up</p>
        </Link>

        {/* Show Payment QR Button */}
        <button
          onClick={() => setShowQR(true)}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div className="action-button-circle group-hover:scale-105 group-active:scale-95 transition-transform duration-200">
            <span className="material-symbols-outlined font-bold">qr_code</span>
          </div>
          <p className="text-white text-xs font-bold">Show QR</p>
        </button>

        {/* Cash Out Button */}
        <button
          onClick={handleCashOut}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div className="action-button-circle group-hover:scale-105 group-active:scale-95 transition-transform duration-200">
            <span className="material-symbols-outlined font-bold">account_balance</span>
          </div>
          <p className="text-white text-xs font-bold">Cash Out</p>
        </button>
      </div>

      {/* QR Code Modal */}
      <CustomerQRCode isOpen={showQR} onClose={() => setShowQR(false)} />
    </>
  );
}
