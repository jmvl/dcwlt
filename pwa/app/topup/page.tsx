'use client';

import Link from 'next/link';
import { usePrivyAuth } from '../hooks/usePrivyAuth';

const BUNDLES = [
  { amount: 50, price: 5 },
  { amount: 100, price: 10 },
  { amount: 200, price: 20 },
  { amount: 500, price: 50 },
];

export default function TopUpPage() {
  const { ready, authenticated } = usePrivyAuth();

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#101c22] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
        <p className="mt-4 text-[#9db0b9]">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#101c22] flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-yellow-400 text-6xl mb-4">🔐</div>
          <p className="text-[#9db0b9] mb-4">Please sign in to top up your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101c22] flex flex-col">
      <header className="p-4 border-b border-[#1a2f38]">
        <div className="max-w-md mx-auto">
          <Link
            href="/dashboard"
            className="text-[#13a4ec] hover:text-[#0d8ac4] transition-colors inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">Top Up Your Wallet</h1>
          <p className="text-[#9db0b9] mb-6">Choose a token bundle to add to your balance</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BUNDLES.map((bundle) => (
              <div
                key={bundle.amount}
                className="bg-[#1a1a1a] border border-[#1a2f38] rounded-lg p-6 hover:border-[#13a4ec] transition-all"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {bundle.amount} <span className="text-[#13a4ec]">EVT</span>
                  </div>
                  <div className="text-[#9db0b9] mb-4">${bundle.price}.00</div>
                  <button
                    className="w-full bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-[#1a2f38] rounded-lg">
            <p className="text-[#9db0b9] text-sm text-center">
              💡 This is a mock top-up flow. No real payment will be processed.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
