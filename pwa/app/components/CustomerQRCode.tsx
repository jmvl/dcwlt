'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCryptographicQR } from '@/app/hooks/useCryptographicQR';
import { X } from 'lucide-react';

interface CustomerQRCodeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerQRCode({ isOpen, onClose }: CustomerQRCodeProps) {
  const { qrData, isLoading, error } = useCryptographicQR();
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Update countdown every second
  useEffect(() => {
    if (!qrData) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((qrData.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData]);

  // Auto-max brightness when QR displayed
  useEffect(() => {
    if (isOpen) {
      // Note: Screen brightness API requires HTTPS or specific permissions
      // For PWA, we use CSS to increase visibility instead
      document.documentElement.style.setProperty('--screen-brightness', '1');
    } else {
      // Restore brightness on close
      document.documentElement.style.removeProperty('--screen-brightness');
    }
  }, [isOpen]);

  // Format countdown timer
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} remaining`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {/* Header with close button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close QR code"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Countdown Timer */}
      <div className="text-white text-2xl font-bold mb-4">
        {isLoading ? (
          'Loading...'
        ) : error ? (
          <span className="text-red-400">{error}</span>
        ) : qrData ? (
          formatCountdown(secondsRemaining)
        ) : (
          'Generating QR...'
        )}
      </div>

      {/* QR Code Container */}
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        {isLoading ? (
          <div className="w-64 h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="w-64 h-64 flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        ) : qrData ? (
          <QRCodeSVG
            value={qrData.url}
            size={256}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center text-gray-400">
            <p>No QR data</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-white/70 text-center">
        <p>Show this QR code to the merchant</p>
        <p className="text-sm">Your payment QR refreshes automatically</p>
      </div>
    </div>
  );
}
