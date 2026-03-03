'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaymentConfirmation } from '../components/PaymentConfirmation';
import { usePayment } from '../hooks/usePayment';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Inner component that uses useSearchParams
 * Must be wrapped in Suspense to avoid static generation issues
 *
 * CRITICAL: All hooks must be called BEFORE any conditional returns
 * to follow React's Rules of Hooks.
 */
function ConfirmPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Call ALL hooks unconditionally at the top (Rules of Hooks)
  // usePayment now extracts wallet address and Privy ID internally
  const { executePayment, loading, walletAddress } = usePayment();
  const [success, setSuccess] = useState<boolean | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Parse URL parameters
  const recipient = searchParams.get('recipient');
  const amount = searchParams.get('amount');
  const splToken = searchParams.get('splToken'); // Optional in database mode
  const label = searchParams.get('label') || undefined;
  const message = searchParams.get('message') || undefined;
  const reference = searchParams.get('reference'); // This is the itemId

  // Look up merchant by wallet address (recipient)
  const merchant = useQuery(
    api.merchants.getMerchantByWallet,
    recipient ? { walletAddress: recipient } : 'skip'
  );

  // Convex IDs are strings at runtime with type annotations for compile-time safety
  // The reference parameter from QR code is already a string ID
  const merchantId: string | undefined = merchant?._id?.toString() || undefined;
  const itemId: string | undefined = reference || undefined;
  // Use merchant business name from Convex lookup, fallback to URL parameter
  const merchantLabel = merchant?.businessName || label || undefined;

  console.log('[ConfirmPayment] Payment parameters:', {
    recipient,
    amount,
    splToken,
    label,
    message,
    reference,
    merchantId: merchantId?.toString(),
    itemId: itemId?.toString(),
    merchantFound: !!merchant,
    walletAddress,
  });

  // Validate required parameters (recipient and amount are required, splToken is optional)
  const isValid = useMemo(() => recipient && amount, [recipient, amount]);

  // Client-side hydration effect
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Validate parameters on mount/change
  useEffect(() => {
    if (!isValid) {
      setError('Invalid payment request: Missing required parameters');
    }
  }, [isValid]);

  /**
   * Handle payment confirmation
   */
  const handleConfirm = async () => {
    console.log('[ConfirmPayment] handleConfirm called');
    console.log('[ConfirmPayment] Params:', { recipient, amount, splToken, merchantId, itemId });

    if (!recipient || !amount) {
      console.error('[ConfirmPayment] Missing parameters');
      setError('Missing required payment parameters');
      return;
    }

    console.log('[ConfirmPayment] About to call executePayment...');
    try {
      // In database mode, amount is already in EVT (no conversion needed)
      // In Solana mode, amount should already be in base units
      const result = await executePayment({
        recipient,
        amount: amount, // Pass amount as-is (EVT for database, base units for Solana)
        splToken: splToken || undefined, // Optional in database mode
        merchantId,
        itemId,
      });
      console.log('[ConfirmPayment] executePayment returned:', result);

      if (result.success) {
        setSuccess(true);
        setTransactionId(result.transactionId || result.signature || null);
      } else {
        setSuccess(false);
        setError(result.error || 'Payment failed');
      }
    } catch (err) {
      console.error('[ConfirmPaymentPage] Payment error:', err);
      setSuccess(false);
      setError('An unexpected error occurred');
    }
  };

  /**
   * Handle payment cancellation
   */
  const handleCancel = () => {
    router.push('/scan');
  };

  /**
   * Navigate back to dashboard
   */
  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // ===== CONDITIONAL RENDERING (all hooks already called) =====

  // Don't render payment UI until client-side hydrated
  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#0a1216] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show validation error
  if (!isValid) {
    return (
      <div className="min-h-screen bg-[#0a1216] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-[#1a2f38] rounded-2xl p-6 shadow-xl border border-[#243b47]">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Invalid Payment Request</h1>
              <p className="text-[#9db0b9] mb-6">{error || 'Missing required parameters'}</p>
              <button
                onClick={handleBackToDashboard}
                className="w-full py-3 px-4 rounded-xl bg-[#13a4ec] text-white font-medium hover:bg-[#0d8ac4] transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (success === true && transactionId) {
    return (
      <div className="min-h-screen bg-[#0a1216] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-[#1a2f38] rounded-2xl p-6 shadow-xl border border-[#243b47]">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-[#9db0b9] mb-6">Your payment has been processed</p>

              {/* Transaction ID */}
              <div className="bg-[#0a1216] rounded-lg p-4 mb-4">
                <p className="text-[#9db0b9] text-xs mb-1">Transaction ID</p>
                <p className="text-white font-mono text-xs break-all">{transactionId}</p>
              </div>

              {/* Back to Dashboard */}
              <button
                onClick={handleBackToDashboard}
                className="w-full py-3 px-4 rounded-xl bg-[#13a4ec] text-white font-medium hover:bg-[#0d8ac4] transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (success === false) {
    return (
      <div className="min-h-screen bg-[#0a1216] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-[#1a2f38] rounded-2xl p-6 shadow-xl border border-[#243b47]">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
              <p className="text-[#9db0b9] mb-4">{error || 'An error occurred'}</p>

              {/* Technical details for debugging */}
              <div className="bg-[#0a1216] rounded-lg p-3 mb-6 text-left">
                <p className="text-[#9db0b9] text-xs mb-1">Error Details:</p>
                <p className="text-red-400 text-xs break-all font-mono">{error || 'Unknown error'}</p>
                <p className="text-[#9db0b9] text-xs mt-3">
                  Check browser console (F12) for more details
                </p>
              </div>

              {/* Try Again */}
              <button
                onClick={() => {
                  setSuccess(null);
                  setError(null);
                }}
                className="w-full mb-3 py-3 px-4 rounded-xl bg-[#1a2f38] border border-[#243b47] text-white font-medium hover:bg-[#243b47] transition-colors"
              >
                Try Again
              </button>

              {/* Back to Dashboard */}
              <button
                onClick={handleBackToDashboard}
                className="w-full py-3 px-4 rounded-xl bg-[#13a4ec] text-white font-medium hover:bg-[#0d8ac4] transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show payment confirmation
  return (
    <PaymentConfirmation
      recipient={recipient!}
      amount={amount!}
      splToken={splToken || ''}
      label={merchantLabel}
      message={message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      loading={loading}
      error={error}
    />
  );
}

/**
 * Payment confirmation page for Solana Pay
 *
 * Displays payment details from URL parameters and handles
 * transaction signing/submission via usePayment hook.
 *
 * URL Parameters:
 * - recipient: (required) Wallet address to send tokens to
 * - amount: (required) Amount in EVT (database mode) or smallest unit (Solana mode)
 * - splToken: (optional) SPL Token mint address (ignored in database mode)
 * - label: (optional) Merchant/recipient name
 * - message: (optional) Payment note/message
 *
 * Wraps ConfirmPaymentContent in Suspense to handle useSearchParams
 */
export default function ConfirmPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a1216] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ConfirmPaymentContent />
    </Suspense>
  );
}
