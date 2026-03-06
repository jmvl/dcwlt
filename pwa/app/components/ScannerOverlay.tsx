'use client';

import { ReactNode } from 'react';

interface ScannerOverlayProps {
  children?: ReactNode;
}

export function ScannerOverlay({ children }: ScannerOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Scan frame */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-[#13a4ec]" />
        <div className="absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-[#13a4ec]" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-[#13a4ec]" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-[#13a4ec]" />

        {/* Scanning line animation */}
        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#13a4ec] to-transparent animate-scan" />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-32 left-0 right-0 text-center">
        <p className="text-white text-lg font-medium">
          Align QR code within frame
        </p>
        <p className="text-[#9db0b9] text-sm mt-1">
          Scanning will happen automatically
        </p>
      </div>

      {/* Additional children (e.g., close button, header) */}
      {children}
    </div>
  );
}
