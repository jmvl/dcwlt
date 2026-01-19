'use client';

import { useRouter } from 'next/navigation';
import { QRScanner } from '../components/QRScanner';
import { parseSolanaPayURL, isValidSolanaPayURL } from '../../src/utils/solanaPay';

export default function ScanPage() {
  const router = useRouter();

  const handleScanSuccess = (decodedText: string) => {
    try {
      // Validate that this is a Solana Pay URL
      if (!isValidSolanaPayURL(decodedText)) {
        alert('Not a valid Solana Pay QR code. Please scan a merchant payment QR code.');
        return;
      }

      // Parse the Solana Pay URL
      const parsed = parseSolanaPayURL(decodedText);

      // Navigate to confirmation screen with parsed data
      const params = new URLSearchParams();
      params.append('recipient', parsed.recipient);
      if (parsed.amount) params.append('amount', parsed.amount);
      if (parsed.splToken) params.append('splToken', parsed.splToken);
      if (parsed.label) params.append('label', parsed.label);
      if (parsed.message) params.append('message', parsed.message);
      if (parsed.reference) params.append('reference', parsed.reference);
      router.push(`/confirm-payment?${params.toString()}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse QR code';
      alert('Invalid QR code: ' + errorMessage);
    }
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
    // Don't show alert for common scanning errors
    // Scanner continues working automatically
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#101c22] flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-[#1a2f38]">
        <div className="max-w-md mx-auto flex items-center">
          <button
            onClick={handleCancel}
            className="text-[#9db0b9] hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white ml-4">Scan QR Code</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Instructions */}
          <div className="text-center mb-6">
            <p className="text-[#9db0b9]">
              Point camera at merchant QR code
            </p>
          </div>

          {/* QR Scanner */}
          <div className="bg-[#1a2f38] rounded-lg overflow-hidden">
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onError={handleScanError}
            />
          </div>

          {/* Info text */}
          <div className="mt-6 text-center">
            <p className="text-[#6b7d85] text-sm">
              Make sure the QR code is within the frame
            </p>
          </div>
        </div>
      </main>

      {/* Cancel button */}
      <footer className="p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleCancel}
            className="w-full py-3 bg-[#1a2f38] text-white rounded-lg hover:bg-[#243b47] transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </footer>
    </div>
  );
}

export const dynamic = 'force-dynamic';
