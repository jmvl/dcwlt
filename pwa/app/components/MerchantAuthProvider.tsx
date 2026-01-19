'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePrivyAuth } from '../hooks/usePrivyAuth';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import type { Doc } from '@/convex/_generated/dataModel';

interface MerchantAuthContextType {
  merchant: Doc<'merchants'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const MerchantAuthContext = createContext<MerchantAuthContextType>({
  merchant: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
});

export function useMerchantAuth() {
  const context = useContext(MerchantAuthContext);
  if (!context) {
    throw new Error('useMerchantAuth must be used within MerchantAuthProvider');
  }
  return context;
}

interface MerchantAuthProviderProps {
  children: React.ReactNode;
}

export function MerchantAuthProvider({ children }: MerchantAuthProviderProps) {
  const { ready, authenticated, user } = usePrivyAuth();
  const router = useRouter();
  const updateMerchantWallet = useMutation(api.merchants.updateMerchantWalletAddress);
  const [merchantAuth, setMerchantAuth] = useState<MerchantAuthContextType>({
    merchant: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Get email from Privy user
  const userEmail = user?.email?.address;

  // Query merchant by email
  const merchant = useQuery(
    api.merchants.getMerchantByEmail,
    userEmail ? { email: userEmail } : 'skip'
  );

  // Auto-update merchant wallet address on login if it differs from Privy wallet
  useEffect(() => {
    if (!authenticated || !user || !merchant || !userEmail) return;

    // Get Solana wallet from Privy user
    const solanaWallet = user.linkedAccounts?.find(
      (account: any) => account.type === "wallet" && account.chainType === "solana"
    );

    if (!solanaWallet || !("address" in solanaWallet)) return;

    const privyWalletAddress = solanaWallet.address as string;

    // If merchant's stored wallet address differs from Privy wallet, update it
    if (merchant.walletAddress !== privyWalletAddress) {
      console.log('[MerchantAuthProvider] Updating wallet address from', merchant.walletAddress, 'to', privyWalletAddress);
      updateMerchantWallet({
        email: userEmail,
        walletAddress: privyWalletAddress,
      }).catch((err) => {
        console.error('[MerchantAuthProvider] Failed to update wallet address:', err);
      });
    }
  }, [authenticated, user, merchant, userEmail, updateMerchantWallet]);

  useEffect(() => {
    // Loading state
    if (!ready || (authenticated && userEmail && merchant === undefined)) {
      setMerchantAuth({
        merchant: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
      });
      return;
    }

    // Not authenticated - redirect to merchant login
    if (!authenticated) {
      setMerchantAuth({
        merchant: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push('/merchant/login');
      return;
    }

    // No merchant found
    if (!merchant) {
      setMerchantAuth({
        merchant: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Merchant account not found',
      });
      return;
    }

    // Check merchant status
    if (merchant.status === 'pending') {
      setMerchantAuth({
        merchant: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Your merchant application is pending approval',
      });
      return;
    }

    if (merchant.status === 'rejected') {
      setMerchantAuth({
        merchant: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Your merchant application was not approved',
      });
      return;
    }

    // Merchant is approved
    if (merchant.status === 'approved') {
      setMerchantAuth({
        merchant,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Unknown status
    setMerchantAuth({
      merchant: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Unknown merchant status',
    });
  }, [ready, authenticated, userEmail, merchant, router]);

  // Show loading spinner
  if (merchantAuth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101c22]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
        <p className="ml-4 text-[#9db0b9]">Loading...</p>
      </div>
    );
  }

  // Show error message
  if (merchantAuth.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101c22]">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Merchant Access</h1>
          <p className="text-[#9db0b9] mb-6">{merchantAuth.error}</p>

          {merchantAuth.error.includes('not found') && (
            <p className="text-sm text-[#9db0b9] mb-6">
              Don't have a merchant account?{' '}
              <button onClick={() => router.push('/merchant/register')} className="text-[#13a4ec] hover:underline">
                Apply here
              </button>
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push('/merchant/login')}
              className="w-full px-6 py-3 bg-[#13a4ec] text-white rounded-lg font-medium hover:bg-[#0d8bc4] transition-colors"
            >
              Back to Merchant Login
            </button>
            <button
              onClick={() => {
                // Clear all browser storage to force logout
                if (typeof window !== 'undefined') {
                  // Clear all Privy-related storage
                  Object.keys(localStorage).forEach(key => {
                    if (key.toLowerCase().includes('privy')) {
                      localStorage.removeItem(key);
                    }
                  });
                  Object.keys(sessionStorage).forEach(key => {
                    if (key.toLowerCase().includes('privy') || key.toLowerCase().includes('dcwlt')) {
                      sessionStorage.removeItem(key);
                    }
                  });
                  // Force hard refresh to home - this clears all React state
                  window.location.href = '/';
                }
              }}
              className="w-full px-6 py-3 border border-[#2d4452] rounded-lg text-[#9db0b9] hover:text-white hover:bg-[#243b47] transition-colors"
            >
              Logout and Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Merchant is authenticated
  return (
    <MerchantAuthContext.Provider value={merchantAuth}>
      {children}
    </MerchantAuthContext.Provider>
  );
}
