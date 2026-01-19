'use client';

import { useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';

/**
 * Props for PaymentConfirmation component
 */
export interface PaymentConfirmationProps {
  /** Recipient wallet address */
  recipient: string;
  /** Amount to transfer in display format (e.g., "5" for 5 EVT) */
  amount: string;
  /** SPL Token mint address */
  splToken: string;
  /** Merchant/recipient label */
  label?: string;
  /** Optional message/note */
  message?: string;
  /** Callback when payment is confirmed */
  onConfirm: () => void;
  /** Callback when payment is cancelled */
  onCancel: () => void;
  /** Whether payment is currently processing */
  loading?: boolean;
  /** Error message to display */
  error?: string | null;
}

/**
 * Formats a wallet address for display (truncates middle)
 *
 * @param address - Full wallet address
 * @returns Truncated address (e.g., "abcd...xyz")
 */
function formatAddress(address: string): string {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Formats amount for display
 * Since amount is now in display format, just validate and return it
 *
 * @param amountDisplay - Amount in display format (e.g., "5" or "5.5")
 * @returns Formatted amount string
 */
function formatAmount(amountDisplay: string): string {
  // Parse the amount to validate it
  const parsed = parseFloat(amountDisplay);
  if (isNaN(parsed)) {
    return '0';
  }

  // Format with up to 2 decimal places if needed
  return parsed.toFixed(2).replace(/\.00$/, '');
}

/**
 * Payment confirmation component
 *
 * Displays payment details for user confirmation before executing
 * a Solana Pay transaction.
 *
 * @example
 * ```tsx
 * <PaymentConfirmation
 *   recipient="9abc...xyz"
 *   amount="5.50"
 *   splToken="TokenMintAddress"
 *   label="Test Merchant"
 *   onConfirm={() => executePayment()}
 *   onCancel={() => router.back()}
 *   loading={isProcessing}
 * />
 * ```
 */
export function PaymentConfirmation({
  recipient,
  amount,
  splToken,
  label,
  message,
  onConfirm,
  onCancel,
  loading = false,
  error = null,
}: PaymentConfirmationProps) {
  const displayAmount = formatAmount(amount);
  const displayRecipient = formatAddress(recipient);
  const merchantLabel = label || 'Unknown Merchant';

  return (
    <div className="min-h-screen bg-[#0a1216] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Confirm Payment</h1>
          <p className="text-[#9db0b9]">Review payment details before confirming</p>
        </div>

        {/* Payment Card */}
        <div className="bg-[#1a2f38] rounded-2xl p-6 shadow-xl border border-[#243b47]">
          {/* Merchant Name */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#13a4ec] bg-opacity-20 mb-3">
              <Check className="w-8 h-8 text-[#13a4ec]" />
            </div>
            <h2 className="text-xl font-semibold text-white">{merchantLabel}</h2>
          </div>

          {/* Amount */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-white mb-1">
              {displayAmount} <span className="text-2xl text-[#13a4ec]">EVT</span>
            </div>
            <div className="text-sm text-[#9db0b9]">Event Token</div>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-[#243b47]">
              <span className="text-[#9db0b9] text-sm">To</span>
              <span className="text-white font-mono text-sm">{displayRecipient}</span>
            </div>

            {message && (
              <div className="flex justify-between items-start py-2 border-b border-[#243b47]">
                <span className="text-[#9db0b9] text-sm">Note</span>
                <span className="text-white text-sm text-right max-w-[200px]">{message}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-2">
              <span className="text-[#9db0b9] text-sm">Token</span>
              <span className="text-white font-mono text-xs">{formatAddress(splToken)}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-[#243b47] text-[#9db0b9] font-medium hover:bg-[#243b47] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-[#13a4ec] text-white font-medium hover:bg-[#0d8ac4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>

          {/* Warning */}
          <div className="mt-4 text-center">
            <p className="text-[#9db0b9] text-xs">
              Only send to addresses you trust. Transactions cannot be reversed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
