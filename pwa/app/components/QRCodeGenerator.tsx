'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import QRCode from 'qrcode';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Event Token mint address on Solana Devnet
const TOKEN_MINT_ADDRESS = '4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  merchantAddress: string;
  itemPrice: number;
  itemName: string;
  itemId: string;
  merchantId: string;
}

export function QRCodeGenerator({
  isOpen,
  onClose,
  merchantAddress,
  itemPrice,
  itemName,
  itemId,
  merchantId,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);

  // Real-time subscription to merchant transactions
  const transactions = useQuery(
    api.transactions.listLiveMerchantTransactions,
    merchantId ? { merchantId: merchantId as any } : 'skip'
  );

  // Track if this specific item was just paid for
  const latestTransaction = transactions?.[0];
  const isThisItemPaid = latestTransaction?.itemId === itemId && latestTransaction?.status === 'confirmed';

  // Update UI when payment is received
  useEffect(() => {
    if (isThisItemPaid && !paymentReceived) {
      setPaymentReceived(true);
      console.log('[QRCodeGenerator] Payment received for item:', itemName);

      // Auto-dismiss after 5 seconds to show success
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isThisItemPaid, paymentReceived, itemName, onClose]);

  // Reset payment received state when modal reopens
  useEffect(() => {
    if (isOpen) {
      setPaymentReceived(false);
    }
  }, [isOpen]);

  // Build Solana Pay URL
  const solanaPayUrl = `solana:${merchantAddress}?amount=${itemPrice}&spl-token=${TOKEN_MINT_ADDRESS}&reference=${itemId}`;

  // Handle slide-up animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow DOM to render before animating
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Generate QR code on mount or when URL changes
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);

    // Small delay to ensure canvas ref is attached
    const timer = setTimeout(() => {
      const generateQR = async () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) throw new Error('Canvas element not found');

          await QRCode.toCanvas(canvas, solanaPayUrl, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });

          setIsLoading(false);
        } catch (err) {
          console.error('Error generating QR code:', err);
          setError('Failed to generate QR code');
          setIsLoading(false);
        }
      };

      generateQR();
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, solanaPayUrl]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 transition-opacity duration-200">
      <div
        className={`
          bg-[#1a2f38] rounded-t-lg sm:rounded-lg w-full sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="p-4 sm:p-6">
          {/* Drag Handle (mobile only) */}
          <div className="flex justify-center mb-4 sm:hidden">
            <div className="w-12 h-1.5 bg-[#9db0b9] rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Payment QR Code</h2>
            <button
              onClick={onClose}
              className="text-[#9db0b9] hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Payment Received Success State */}
          {paymentReceived ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6 animate-[scale-in_0.3s_ease-out]" />
              <h3 className="text-2xl font-bold text-white mb-3">Payment Received!</h3>
              <p className="text-[#9db0b9] mb-2">
                <span className="font-semibold text-[#13a4ec]">{itemName}</span> - {itemPrice.toFixed(2)} EVT
              </p>
              <p className="text-sm text-[#9db0b9] mb-8">
                Transaction confirmed on Solana
              </p>

              <button
                onClick={() => router.push('/merchant/sales')}
                className="inline-flex items-center gap-2 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                View in Sales
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Item Details */}
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{itemName}</h3>
                <p className="text-3xl font-bold text-[#13a4ec]">
                  {itemPrice.toFixed(2)} <span className="text-lg">EVT</span>
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex flex-col items-center">
                  {isLoading && (
                    <div className="flex items-center justify-center h-64 absolute inset-0 bg-white z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    className="rounded"
                    style={{ opacity: isLoading ? 0 : 1, minHeight: '256px' }}
                  />
                  {!isLoading && !error && (
                    <p className="text-gray-600 text-xs mt-2 text-center">
                      Scan to pay for {itemName}
                    </p>
                  )}
                </div>
              </div>

              {/* Solana Pay URL (for reference) */}
              <div className="bg-[#101c22] rounded-lg p-3 mb-6">
                <p className="text-xs text-[#9db0b9] mb-1">Solana Pay URL:</p>
                <p className="text-xs text-[#13a4ec] font-mono break-all">{solanaPayUrl}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
