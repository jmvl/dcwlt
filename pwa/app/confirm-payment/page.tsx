'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaymentConfirmation } from '../components/PaymentConfirmation';
import { usePayment } from '../hooks/usePayment';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

/**
 * Payment confirmation page for Solana Pay
 *
 * Displays payment details from URL parameters and handles
 * transaction signing/submission via usePayment hook.
 *
 * URL Parameters:
 * - recipient: (required) Wallet address to send tokens to
 * - amount: (required) Amount in smallest unit (lamports)
 * - splToken: (required) SPL Token mint address
 * - label: (optional) Merchant/recipient name
 * - message: (optional) Payment note/message
 *
 * @example
 * ```
 * /confirm-payment?recipient=abc...&amount=100000000&splToken=def...&label=Test+Merchant
 * ```
 */
export default function ConfirmPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { executePayment, loading } = usePayment();

  const [success, setSuccess] = useState<boolean | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse URL parameters
  const recipient = searchParams.get('recipient');
  const amount = searchParams.get('amount');
  const splToken = searchParams.get('splToken');
  const label = searchParams.get('label') || undefined;
  const message = searchParams.get('message') || undefined;

  // Validate required parameters
  const isValid = recipient && amount && splToken;

  useEffect(() => {
    if (!isValid) {
      setError('Invalid payment request: Missing required parameters');
    }
  }, [isValid]);

  /**
   * Handle payment confirmation
   */
  const handleConfirm = async () => {
    if (!recipient || !amount || !splToken) {
      setError('Missing required payment parameters');
      return;
    }

    try {
      const result = await executePayment({
        recipient,
        amount,
        splToken,
      });

      if (result.success) {
        setSuccess(true);
        setSignature(result.signature || null);
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

  /**
   * Navigate to Solana Explorer
   */
  const handleViewOnExplorer = () => {
    if (signature) {
      window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');
    }
  };

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
  if (success === true && signature) {
    return (
      <div className="min-h-screen bg-[#0a1216] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-[#1a2f38] rounded-2xl p-6 shadow-xl border border-[#243b47]">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-[#9db0b9] mb-6">Your payment has been processed</p>

              {/* Transaction Signature */}
              <div className="bg-[#0a1216] rounded-lg p-4 mb-4">
                <p className="text-[#9db0b9] text-xs mb-1">Transaction Signature</p>
                <p className="text-white font-mono text-xs break-all">{signature}</p>
              </div>

              {/* Explorer Link */}
              <button
                onClick={handleViewOnExplorer}
                className="w-full mb-3 py-3 px-4 rounded-xl bg-[#1a2f38] border border-[#243b47] text-white font-medium hover:bg-[#243b47] transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View on Solana Explorer
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

  // Show error state
  if (success === false) {
    return (
      <div className="min-h-screen bg-[#0a1216] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-[#1a2f38] rounded-2xl p-6 shadow-xl border border-[#243b47]">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
              <p className="text-[#9db0b9] mb-6">{error || 'An error occurred'}</p>

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
      splToken={splToken!}
      label={label}
      message={message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      loading={loading}
      error={error}
    />
  );
}
