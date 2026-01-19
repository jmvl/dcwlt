'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import 'qr-scanner/qr-scanner-worker.min.js';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScanSuccess, onError }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const isMountedRef = useRef(true);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Gracefully stop scanner
      // Note: stop() returns void, not a Promise
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
        } catch {
          // Silently ignore errors during cleanup
        }
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Prevent re-initialization
    if (scanning) return;

    const initializeScanner = async () => {
      // Small delay to ensure DOM is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      // Check if video element exists
      const videoElement = videoElementRef.current;
      if (!videoElement) {
        console.error('QR scanner video element not found in DOM');
        if (isMountedRef.current) {
          setError('Scanner initialization failed. Please refresh the page.');
        }
        return;
      }

      try {
        if (!scannerRef.current) {
          scannerRef.current = new QrScanner(
            videoElement,
            (result) => {
              // Success callback - qr-scanner provides the result directly
              if (isMountedRef.current) {
                onScanSuccess(result.data);
                // Stop scanning after successful read
                if (scannerRef.current) {
                  scannerRef.current.stop();
                  setScanning(false);
                }
              }
            },
            {
              // qr-scanner configuration for better recognition
              onDecodeError: (error) => {
                // Silently ignore errors during normal scanning
                // qr-scanner throws errors for every frame without a QR code
              },
              preferredCamera: 'environment', // Use back camera on mobile
              highlightScanRegion: true,
              highlightCodeOutline: true,
            }
          );
        }

        if (!isMountedRef.current) return;

        // Check permissions and start
        const hasCameraPermission = await QrScanner.hasCamera();
        if (!hasCameraPermission) {
          setError('No camera found on this device.');
          setHasPermission(false);
          return;
        }

        setScanning(true);
        setError(null);

        await scannerRef.current.start();

        if (isMountedRef.current) {
          setHasPermission(true);
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        setScanning(false);
        const errorMsg = err instanceof Error ? err.message : 'Failed to start scanner';

        // Check for permission errors
        if (errorMsg.includes('Permission') || errorMsg.includes('denied') || errorMsg.includes('NotAllowedError')) {
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

    initializeScanner();
  }, [scanning, onScanSuccess, onError]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#101c22]">
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
        </div>
      )}

      {/* Loading overlay */}
      {!hasPermission && !scanning && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#101c22]">
          <div className="text-center p-4">
            <div className="text-[#9db0b9]">Requesting camera permission...</div>
          </div>
        </div>
      )}

      {/* Scanner container - video element for qr-scanner */}
      <div className="relative w-full max-w-md">
        <video
          ref={videoElementRef}
          className="w-full rounded-lg"
          style={{ minHeight: '300px' }}
        />
        {!error && hasPermission && (
          <div className="text-center mt-4 text-[#9db0b9] text-sm">
            Point camera at QR code
          </div>
        )}
      </div>
    </div>
  );
}
