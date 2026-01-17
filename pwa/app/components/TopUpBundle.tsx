'use client';

import { useState } from 'react';

interface TopUpBundleProps {
  amount: number;
  price: number;
  onPurchase: (data: { amount: number; price: number }) => Promise<void>;
}

export function TopUpBundle({ amount, price, onPurchase }: TopUpBundleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  const handlePurchase = async () => {
    if (isLoading || isPurchased) return;

    setIsLoading(true);
    try {
      await onPurchase({ amount, price });
      setIsPurchased(true);
    } catch (error) {
      console.error('Purchase failed:', error);
      // Allow retry on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-[#1a1a1a] border rounded-lg p-6 transition-all ${
        isPurchased
          ? 'border-green-500'
          : 'border-[#1a2f38] hover:border-[#13a4ec]'
      }`}
    >
      <div className="text-center">
        <div className="text-3xl font-bold text-white mb-1">
          {amount} <span className="text-[#13a4ec]">EVT</span>
        </div>
        <div className="text-[#9db0b9] mb-4">${price}.00</div>

        {isLoading ? (
          <button
            disabled
            className="w-full bg-[#13a4ec] text-white font-semibold py-2 px-4 rounded-lg opacity-70 cursor-not-allowed"
          >
            <span className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </span>
          </button>
        ) : isPurchased ? (
          <button
            disabled
            className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
          >
            ✓ Complete
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            className="w-full bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
