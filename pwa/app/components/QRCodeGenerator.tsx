'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X } from 'lucide-react';

// Event Token mint address on Solana Devnet
const TOKEN_MINT_ADDRESS = '4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  merchantAddress: string;
  itemPrice: number;
  itemName: string;
  itemId: string;
}

export function QRCodeGenerator({
  isOpen,
  onClose,
  merchantAddress,
  itemPrice,
  itemName,
  itemId,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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
        </div>
      </div>
    </div>
  );
}
