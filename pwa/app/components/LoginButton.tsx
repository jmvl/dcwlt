'use client';

import { usePrivy } from '@privy-io/react-auth';

export function LoginButton() {
  const { ready, authenticated, login, user } = usePrivy();

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-8 h-8 border-3 border-[#13a4ec] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#9db0b9] text-sm">Initializing wallet...</p>
      </div>
    );
  }

  // Show wallet address when authenticated
  if (authenticated && user) {
    // Get the embedded wallet (Solana)
    const wallet = user.wallet;
    const walletAddress = wallet?.address || 'No wallet found';

    // Truncate address: first 7 chars ... last 7 chars
    const truncatedAddress =
      walletAddress.length > 14
        ? `${walletAddress.slice(0, 7)}...${walletAddress.slice(-7)}`
        : walletAddress;

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="bg-[#1c2a31] border border-white/10 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#13a4ec]/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#13a4ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-[#9db0b9] text-xs uppercase tracking-wide">Your Wallet</p>
              <p className="text-white font-mono text-sm">{truncatedAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#13a4ec] text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Connected to Solana Devnet</span>
          </div>
        </div>
      </div>
    );
  }

  // Show login buttons when not authenticated
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
      <button
        onClick={() => login({ provider: 'google' })}
        className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 border border-gray-300"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <button
        onClick={() => login({ provider: 'apple' })}
        className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 border border-gray-800"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        Sign in with Apple
      </button>
    </div>
  );
}
