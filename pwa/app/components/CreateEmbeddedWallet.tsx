'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { api } from '../../convex/_generated/api.js';

/**
 * Component to create a Solana embedded wallet
 * Use this when a user has a linked wallet but no embedded wallet
 */
export function CreateEmbeddedWallet({ onSuccess }: { onSuccess?: () => void }) {
  const privy = usePrivy();
  const createUser = useMutation(api.users.createFromPrivy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[CreateEmbeddedWallet] Creating Solana embedded wallet...');

      // Create a Solana embedded wallet
      // Note: createWallet() creates an embedded wallet for the user
      await (privy.createWallet as any)();

      console.log('[CreateEmbeddedWallet] Wallet created successfully!');

      // Wait a moment for Privy to update the user object
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the updated user object with the new wallet
      const user = privy.user;
      if (user) {
        const solanaWallet = user.linkedAccounts?.find(
          (account: any) => account.type === 'wallet' && account.chainType === 'solana'
        );

        if (solanaWallet && 'address' in solanaWallet) {
          console.log('[CreateEmbeddedWallet] Registering wallet in Convex:', solanaWallet.address);
          await createUser({
            walletAddress: solanaWallet.address as string,
          });
          console.log('[CreateEmbeddedWallet] Wallet registered in Convex!');
        }
      }

      // Call success callback
      onSuccess?.();
    } catch (err: any) {
      console.error('[CreateEmbeddedWallet] Error creating wallet:', err);
      setError(err?.message || 'Failed to create wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a2f38] rounded-2xl p-6 shadow-xl border border-[#243b47]">
      <div className="text-center">
        <PlusCircle className="w-12 h-12 text-[#13a4ec] mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">Create Event Wallet</h3>
        <p className="text-[#9db0b9] text-sm mb-4">
          You need an embedded wallet to make payments. This wallet is created specifically for this event.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleCreateWallet}
          disabled={loading}
          className="w-full bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Wallet...
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              Create Event Wallet
            </>
          )}
        </button>

        <p className="text-[#9db0b9] text-xs mt-3">
          This will create a new Solana wallet managed by Privy. Your existing wallet will not be affected.
        </p>
      </div>
    </div>
  );
}
