'use client';

import Link from 'next/link';
import { LoginButton } from '../../components/LoginButton';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivyAuth } from '../../hooks/usePrivyAuth';

export default function MerchantLoginPage() {
  const { ready, authenticated } = usePrivyAuth();
  const router = useRouter();

  // Redirect to /merchant after successful login
  // MerchantAuthProvider will handle the validation there
  useEffect(() => {
    if (authenticated && ready) {
      router.push('/merchant');
    }
  }, [authenticated, ready, router]);

  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-[#101c22]">
        <div className="text-center max-w-md px-4">
          {/* Merchant Logo/Branding */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Merchant Portal</h1>
            <p className="text-lg text-[#9db0b9]">Event Token Payment System</p>
          </div>

          {/* Info Card */}
          <div className="bg-[#1a2e38] border border-[#2d4452] rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-[#13a4ec] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-[#9db0b9]">
                  Merchants must have an <span className="text-[#13a4ec] font-semibold">approved</span> account to access the portal.
                </p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <div className="mb-6">
            <p className="text-sm text-[#9db0b9] mb-4">Sign in to access your dashboard</p>
            <LoginButton />
          </div>

          {/* Register Link */}
          <div className="bg-[#1a2e38] border border-[#2d4452] rounded-lg p-4 mb-6">
            <p className="text-sm text-[#9db0b9] mb-3">Need a merchant account?</p>
            <Link href="/merchant/register">
              <button className="w-full bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Apply for Merchant Access
              </button>
            </Link>
          </div>

          {/* Back to Home Link */}
          <div>
            <Link href="/" className="text-[#9db0b9] hover:text-[#13a4ec] text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
