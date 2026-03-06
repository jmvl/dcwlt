'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useMerchantAuth } from '@/app/components/MerchantAuthProvider';
import { ScannerOverlay } from '@/app/components/ScannerOverlay';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  groupItemId?: Id<'groupItems'>;
}

interface MerchantCart {
  items: CartItem[];
  eventId?: string;
  merchantEventId?: Id<'merchantEvents'>;
}

interface QRPaymentResult {
  success: boolean;
  amount: number;
  transactionId: Id<'transactions'>;
  newCustomerBalance: number;
}

export default function ScanCustomerPage() {
  const router = useRouter();
  const { merchant } = useMerchantAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cartAmount, setCartAmount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = useMutation(api.cryptographicQr.processQRPayment);

  // Get cart total from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('merchantCart');
    if (storedCart) {
      try {
        const cart: MerchantCart = JSON.parse(storedCart);
        const items = cart.items || [];
        setCartItems(items);
        const total = items.reduce(
          (sum: number, item: CartItem) => sum + item.price * item.quantity,
          0
        );
        setCartAmount(total);

        if (total === 0 || items.length === 0) {
          // No items in cart - redirect back
          router.push('/merchant');
        }
      } catch {
        router.push('/merchant');
      }
    } else {
      // No cart - redirect back
      router.push('/merchant');
    }
  }, [router]);

  // Initialize scanner
  useEffect(() => {
    if (!scanning || !merchant || cartAmount === 0) return;

    let mounted = true;

    const initScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            if (!mounted || !merchant) return;

            // Parse QR URL
            const parsed = parseCustomerQR(decodedText);
            if (!parsed) {
              setErrorMessage('Invalid QR code format. Please scan a valid payment QR code.');
              setResult('error');
              html5QrCode.stop().catch(() => {});
              setScanning(false);
              return;
            }

            setIsProcessing(true);
            html5QrCode.stop().catch(() => {});

            try {
              const paymentResult = await processPayment({
                customerPrivyId: parsed.userId,
                timeKey: parsed.timeKey,
                signature: parsed.signature,
                merchantId: merchant._id,
                amount: cartAmount,
                itemId: cartItems[0]?.groupItemId,
              }) as QRPaymentResult;

              if (mounted) {
                setResult('success');
                // Vibrate on success
                if (navigator.vibrate) {
                  navigator.vibrate([100, 50, 100]);
                }

                // Clear cart after successful payment
                localStorage.removeItem('merchantCart');

                // Auto-dismiss after 3 seconds
                setTimeout(() => {
                  if (mounted) router.push('/merchant');
                }, 3000);
              }
            } catch (err: unknown) {
              if (mounted) {
                const message =
                  err instanceof Error ? err.message : 'Payment failed. Please try again.';
                setErrorMessage(message);
                setResult('error');
              }
            } finally {
              if (mounted) {
                setIsProcessing(false);
                setScanning(false);
              }
            }
          },
          () => {
            // Ignore scan errors (no QR found in frame)
          }
        );
      } catch (err: unknown) {
        if (mounted) {
          const message =
            err instanceof Error ? err.message : 'Failed to start camera';
          if (message.includes('Permission') || message.includes('denied')) {
            setErrorMessage('Camera permission denied. Please allow camera access to scan QR codes.');
          } else {
            setErrorMessage(message);
          }
          setResult('error');
          setScanning(false);
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [scanning, merchant, cartAmount, cartItems, processPayment, router]);

  // Success state
  if (result === 'success') {
    return (
      <div className="fixed inset-0 bg-[#101c22] flex items-center justify-center z-50">
        <div className="bg-[#1a2f38] rounded-lg p-8 text-center max-w-sm mx-4">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Payment Successful</h2>
          <p className="text-[#9db0b9] mt-2">
            Amount: {cartAmount} EVT
          </p>
          <p className="text-sm text-[#9db0b9] mt-1">
            Transaction completed
          </p>
          <p className="text-xs text-[#9db0b9] mt-4 opacity-70">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (result === 'error') {
    return (
      <div className="fixed inset-0 bg-[#101c22] flex items-center justify-center z-50">
        <div className="bg-[#1a2f38] rounded-lg p-8 text-center max-w-sm mx-4">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Payment Failed</h2>
          <p className="text-[#9db0b9] mt-2">{errorMessage}</p>
          <button
            onClick={() => {
              setResult(null);
              setErrorMessage(null);
              setScanning(true);
            }}
            className="mt-6 w-full px-4 py-3 bg-[#13a4ec] text-white rounded-lg font-medium hover:bg-[#0d8bc4] transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/merchant')}
            className="mt-3 w-full px-4 py-3 border border-[#2d4452] text-[#9db0b9] rounded-lg font-medium hover:bg-[#243b47] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Processing state
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-[#101c22] flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#13a4ec] mx-auto animate-spin" />
          <p className="text-white text-lg mt-4">Processing payment...</p>
          <p className="text-[#9db0b9] text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Scanner view
  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Camera view */}
      <div id="qr-reader" className="w-full h-full relative">
        <ScannerOverlay>
          <div className="text-white text-center absolute bottom-32 left-0 right-0 pointer-events-auto">
            <p className="text-lg font-medium">Scan customer QR code</p>
            <p className="text-sm opacity-70">Point camera at customer&apos;s phone</p>
            <p className="text-sm font-bold mt-2 text-[#13a4ec]">
              Cart total: {cartAmount} EVT
            </p>
            <p className="text-xs opacity-50 mt-1">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
            </p>
          </div>
        </ScannerOverlay>
      </div>

      {/* Close button */}
      <button
        onClick={() => router.push('/merchant')}
        className="absolute top-4 right-4 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Cart summary */}
      <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 max-w-[200px]">
        <p className="text-white text-sm font-medium">Cart Summary</p>
        <div className="mt-2 space-y-1">
          {cartItems.slice(0, 3).map((item, index) => (
            <p key={index} className="text-[#9db0b9] text-xs truncate">
              {item.quantity}x {item.name}
            </p>
          ))}
          {cartItems.length > 3 && (
            <p className="text-[#9db0b9] text-xs">+{cartItems.length - 3} more</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Parse customer QR code URL
 * Expected format: dcwlt://pay?u=USER_ID&k=TIME_KEY&s=SIGNATURE
 */
function parseCustomerQR(
  url: string
): { userId: string; timeKey: string; signature: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'dcwlt:') return null;
    if (parsed.pathname !== '/pay') return null;

    const userId = parsed.searchParams.get('u');
    const timeKey = parsed.searchParams.get('k');
    const signature = parsed.searchParams.get('s');

    if (!userId || !timeKey || !signature) {
      return null;
    }

    return { userId, timeKey, signature };
  } catch {
    return null;
  }
}
