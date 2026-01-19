'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePrivyAuth } from '../hooks/usePrivyAuth';
import { useQueryClient } from '@tanstack/react-query';
import { TopUpBundle } from '../components/TopUpBundle';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { balanceQueryKeys } from '../hooks/useSolanaBalance';

const BUNDLES = [
  { amount: 50, price: 5 },
  { amount: 100, price: 10 },
  { amount: 200, price: 20 },
  { amount: 500, price: 50 },
];

export default function TopUpPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ready, authenticated, user } = usePrivyAuth();
  const [successData, setSuccessData] = useState<{ signature: string; amount: number; explorerUrl?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get wallet address from Privy user's linked accounts
  const solanaWallet = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'solana'
  );
  const walletAddress = solanaWallet && 'address' in solanaWallet ? solanaWallet.address : undefined;

  const handlePurchase = async ({ amount, price }: { amount: number; price: number }) => {
    if (!walletAddress) {
      setError('Wallet address not found. Please log in again.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      console.log('[TopUp] Calling backend for token transfer...');

      // Call backend API directly (bypasses Convex sandbox limitation)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          amount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Top-up failed');
      }

      console.log('[TopUp] Backend response:', result);

      // Invalidate the balance query to trigger a refetch from Solana
      // This ensures the dashboard shows the updated balance
      if (walletAddress) {
        console.log('[TopUp] Invalidating balance query to trigger refetch...');
        queryClient.invalidateQueries({
          queryKey: balanceQueryKeys.detail(walletAddress),
        });
      }

      setSuccessData({
        signature: result.signature,
        amount,
        explorerUrl: result.explorerUrl,
      });

      console.log('[TopUp] Top-up successful:', result.signature);
    } catch (err) {
      console.error('[TopUp] Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during top-up');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (successData) {
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

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-[#1a2f38] rounded-lg p-8 mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Top-Up Successful!</h2>
              <p className="text-[#9db0b9] mb-6">
                Your wallet has been topped up with {successData.amount} EVT on Solana Devnet
              </p>

              <div className="bg-[#101c22] rounded-lg p-4 mb-6">
                <p className="text-[#9db0b9] text-sm mb-2">Transaction Signature</p>
                <code className="text-xs text-[#13a4ec] break-all block mb-2">
                  {successData.signature}
                </code>
                {successData.explorerUrl && (
                  <a
                    href={successData.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#9db0b9] hover:text-[#13a4ec] flex items-center gap-1 mt-2 inline-flex"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Solana Explorer
                  </a>
                )}
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </main>
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

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BUNDLES.map((bundle) => (
              <TopUpBundle
                key={bundle.amount}
                amount={bundle.amount}
                price={bundle.price}
                onPurchase={handlePurchase}
                isLoading={isLoading}
              />
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
