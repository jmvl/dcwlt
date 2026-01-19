'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Printer } from 'lucide-react';

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

  // Build Solana Pay URL
  const solanaPayUrl = `solana:${merchantAddress}?amount=${itemPrice}&spl-token=${TOKEN_MINT_ADDRESS}&reference=${itemId}`;

  // Generate QR code on mount or when URL changes
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);

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
  }, [isOpen, solanaPayUrl]);

  // Handle download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Failed to create image');
          return;
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-${itemName.toLowerCase().replace(/\s+/g, '-')}-${itemPrice}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error('Error downloading QR code:', err);
      setError('Failed to download QR code');
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a2f38] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
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
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <canvas ref={canvasRef} className="rounded" />
                <p className="text-gray-600 text-xs mt-2 text-center">
                  Scan to pay for {itemName}
                </p>
              </div>
            )}
          </div>

          {/* Solana Pay URL (for reference) */}
          <div className="bg-[#101c22] rounded-lg p-3 mb-6">
            <p className="text-xs text-[#9db0b9] mb-1">Solana Pay URL:</p>
            <p className="text-xs text-[#13a4ec] font-mono break-all">{solanaPayUrl}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={isLoading || !!error}
              className="flex-1 flex items-center justify-center gap-2 bg-[#101c22] hover:bg-[#243b47] text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button
              onClick={handlePrint}
              disabled={isLoading || !!error}
              className="flex-1 flex items-center justify-center gap-2 bg-[#101c22] hover:bg-[#243b47] text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Print Styles */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .canvas-container,
              .canvas-container * {
                visibility: visible;
              }
              .canvas-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
