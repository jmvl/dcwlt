'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ParsedSolanaPayURL {
  recipient: string;
  amount: string | null;
  splToken: string | null;
  reference: string | null;
  label: string | null;
  message: string | null;
}

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScanSuccess, onError }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5Qrcode('reader');
    scannerRef.current = scanner;

    return () => {
      // Clean up scanner on unmount
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    if (!scannerRef.current || scanning) return;

    const startScanner = async () => {
      try {
        setError(null);
        setScanning(true);

        await scannerRef.current!.start(
          { facingMode: 'environment' }, // Use back camera on mobile
          {
            fps: 10, // Frames per second
            qrbox: { width: 250, height: 250 }, // Scanning area size
          },
          (decodedText: string) => {
            // Success callback - pass decoded text to parent
            onScanSuccess(decodedText);
            // Stop scanning after successful read
            stopScanning();
          },
          (errorMessage: string) => {
            // Error callback - ignore common parse errors during scanning
            // These are normal while scanning, only stop on fatal errors
            if (errorMessage.includes('No barcode or QR code detected')) {
              // Normal scanning behavior, ignore
              return;
            }
            // Log other errors but don't stop scanning
            console.warn('QR scan error:', errorMessage);
          }
        );

        setHasPermission(true);
      } catch (err) {
        setScanning(false);
        const errorMsg = err instanceof Error ? err.message : 'Failed to start scanner';

        // Check for permission errors
        if (errorMsg.includes('Permission') || errorMsg.includes('denied')) {
          setError('Camera permission denied. Please allow camera access to scan QR codes.');
          setHasPermission(false);
        } else if (errorMsg.includes('not found') || errorMsg.includes('device')) {
          setError('No camera found on this device.');
          setHasPermission(false);
        } else {
          setError('Failed to start camera: ' + errorMsg);
          setHasPermission(false);
        }

        onError?.(errorMsg);
      }
    };

    startScanner();

    // Cleanup function
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(console.error);
        setScanning(false);
      }
    };
  }, [scanning, onScanSuccess, onError]);

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {error ? (
        <div className="text-center p-4">
          <div className="text-red-400 mb-2">Camera Error</div>
          <div className="text-[#9db0b9] text-sm">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#1a2f38] text-white rounded-lg hover:bg-[#243b47] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : !hasPermission ? (
        <div className="text-center p-4">
          <div className="text-[#9db0b9]">Requesting camera permission...</div>
        </div>
      ) : (
        <div className="relative w-full max-w-md">
          <div
            id="reader"
            ref={containerRef}
            className="w-full"
            style={{ minHeight: '300px' }}
          />
          {!error && hasPermission && (
            <div className="text-center mt-4 text-[#9db0b9] text-sm">
              Point camera at QR code
            </div>
          )}
        </div>
      )}
    </div>
  );
}
