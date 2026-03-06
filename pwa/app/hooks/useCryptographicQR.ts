'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAction } from 'convex/react';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import { signHMAC } from '@/src/utils/crypto';
import { api } from '@/convex/_generated/api';

// Configure TOTP for 60-second windows with clock skew tolerance
const totp = new TOTP({
  period: 60,
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

interface QRData {
  url: string;          // dcwlt://pay?u=USER_ID&k=TIME_KEY&s=SIGNATURE
  timeKey: string;      // Current TOTP value
  expiresAt: number;    // Unix timestamp when QR expires
  secondsRemaining: number;
}

interface UseCryptographicQRReturn {
  qrData: QRData | null;
  generateQR: () => Promise<QRData | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCryptographicQR(): UseCryptographicQRReturn {
  const { user } = usePrivy();
  const privyId = user?.id;

  const [qrData, setQRData] = useState<QRData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secretData, setSecretData] = useState<{ derivedSecret: string; signingKey: string } | null>(null);

  // Action to fetch derived secret from server
  const getQRSecret = useAction(api.clientQr.getQRSecret);

  // Fetch secret when user is available
  useEffect(() => {
    if (!privyId) return;

    getQRSecret({ privyId })
      .then((data) => {
        setSecretData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to get QR secret:', err);
        setError(err.message || 'Failed to get QR secret');
        setIsLoading(false);
      });
  }, [privyId, getQRSecret]);

  // Generate QR data
  const generateQR = useCallback(async (): Promise<QRData | null> => {
    if (!privyId) {
      setError('User not authenticated');
      return null;
    }

    if (!secretData) {
      setError('Waiting for secret from server');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Generate time-based key using TOTP with derived secret
      const timeKey = await totp.generate({ secret: secretData.derivedSecret });

      // 2. Create HMAC signature for userId:timeKey using signing key
      const message = `${privyId}:${timeKey}`;
      const signature = await signHMAC(message, secretData.signingKey);

      // 3. Build URL in format: dcwlt://pay?u=USER_ID&k=TIME_KEY&s=SIGNATURE
      const url = `dcwlt://pay?u=${encodeURIComponent(privyId)}&k=${timeKey}&s=${signature}`;

      // 4. Calculate expiry (5 minutes from current window)
      const now = Date.now();
      const windowStart = Math.floor(now / 60000) * 60000;
      const expiresAt = windowStart + 300000; // 5 minutes from window start

      const data: QRData = {
        url,
        timeKey,
        expiresAt,
        secondsRemaining: Math.floor((expiresAt - now) / 1000),
      };

      setQRData(data);
      setIsLoading(false);
      return data;
    } catch (err: any) {
      console.error('QR generation failed:', err);
      setError(err.message || 'Failed to generate QR code');
      setIsLoading(false);
      return null;
    }
  }, [privyId, secretData]);

  // Auto-regenerate when approaching expiry
  useEffect(() => {
    if (!qrData) return;

    const timeUntilExpiry = qrData.expiresAt - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 10000, 0); // Refresh 10s before

    const timer = setTimeout(() => {
      generateQR();
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [qrData, generateQR]);

  // Generate initial QR when secret data is available
  useEffect(() => {
    if (privyId && secretData) {
      generateQR();
    }
  }, [privyId, secretData, generateQR]);

  return { qrData, generateQR, isLoading: isLoading || !secretData, error };
}
