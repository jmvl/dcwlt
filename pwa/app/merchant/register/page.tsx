"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { usePrivyAuth } from "../../hooks/usePrivyAuth";
import { useRouter } from "next/navigation";

export default function MerchantRegisterPage() {
  const { ready, authenticated, user, login } = usePrivyAuth();
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const registerMerchant = useMutation(api.merchants.registerMerchant);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/merchant/login");
    }
  }, [ready, authenticated, router]);

  // Extract wallet address from authenticated user
  useEffect(() => {
    if (authenticated && user) {
      const solanaWallet = user.linkedAccounts?.find(
        (account: any) => account.type === "wallet" && account.chainType === "solana"
      );

      if (solanaWallet && "address" in solanaWallet) {
        setWalletAddress(solanaWallet.address as string);
        console.log("[MerchantRegister] Found wallet:", solanaWallet.address);
      }

      // Check if merchant already registered
      const emailAccount = user.linkedAccounts?.find(
        (account: any) => account.type === "email" || account.type === "google"
      );
      // For email/google accounts, use 'email' property; for wallet accounts, use 'address'
      const email = (emailAccount as any)?.email || (emailAccount as any)?.address as string | undefined;

      if (email) {
        // You could add a query here to check if merchant already exists
        // and redirect them if they're already registered
      }
    }
  }, [authenticated, user]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Get email from Privy user
    const emailAccount = user?.linkedAccounts?.find(
      (account: any) => account.type === "email" || account.type === "google"
    );
    // For email/google accounts, use 'email' property; for wallet accounts, use 'address'
    const email = (emailAccount as any)?.email || (emailAccount as any)?.address as string | undefined;

    if (!email) {
      setErrorMessage("Could not retrieve email from authentication. Please try logging in again.");
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      setErrorMessage("Invalid email address from authentication.");
      return;
    }

    // Validate business name
    if (!businessName.trim()) {
      setErrorMessage("Business name is required");
      return;
    }

    // Validate wallet address
    if (!walletAddress || walletAddress.length < 32 || walletAddress.length > 44) {
      setErrorMessage("Invalid wallet address. Please ensure you're authenticated with Privy.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerMerchant({
        email: email.trim(),
        businessName: businessName.trim(),
        walletAddress: walletAddress,
      });

      console.log("Merchant registered:", result);
      setSuccessMessage("Application submitted! We'll review your application shortly.");
      // Clear form
      setBusinessName("");
      setBusinessDescription("");
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.message?.includes("already registered")) {
        setErrorMessage("This email is already registered. Please use a different email.");
      } else if (error.message?.includes("Invalid email")) {
        setErrorMessage("Please enter a valid email address.");
      } else {
        setErrorMessage(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101c22]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101c22] py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-[#1a2e38] rounded-lg shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-[#9db0b9] mb-6">
              You must log in first to apply for a merchant account.
            </p>
            <button
              onClick={() => login()}
              className="w-full bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Log In to Continue
            </button>
            <div className="mt-4">
              <Link href="/" className="text-[#9db0b9] hover:text-[#13a4ec] text-sm">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get email from authenticated user for display
  const emailAccount = user?.linkedAccounts?.find(
    (account: any) => account.type === "email" || account.type === "google"
  );
  // For email/google accounts, use 'email' property; for wallet accounts, use 'address'
  const userEmail = (emailAccount as any)?.email || (emailAccount as any)?.address as string | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101c22] py-12 px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-[#1a2e38] rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Merchant Registration</h1>
            <p className="text-[#9db0b9]">Start accepting Event Token payments</p>
          </div>

          {/* Wallet Address Display */}
          {walletAddress && (
            <div className="mb-6 p-4 bg-[#101c22] border border-[#13a4ec] rounded-lg">
              <p className="text-xs text-[#9db0b9] mb-1">Your Wallet Address (from Privy):</p>
              <p className="text-sm text-[#13a4ec] font-mono break-all">{walletAddress}</p>
            </div>
          )}

          {/* Email Display (read-only) */}
          {userEmail && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                Email Address (from your login)
              </label>
              <div className="w-full px-4 py-3 bg-[#101c22] border border-[#2d4452] rounded-lg text-[#9db0b9]">
                {userEmail}
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
              <p className="text-green-400 text-sm text-center">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm text-center">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name Field */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-[#9db0b9] mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-[#101c22] border border-[#2d4452] rounded-lg text-white placeholder-[#5a6e7b] focus:outline-none focus:ring-2 focus:ring-[#13a4ec] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="My Business Inc."
                  required
                />
              </div>

              {/* Business Description Field */}
              <div>
                <label htmlFor="businessDescription" className="block text-sm font-medium text-[#9db0b9] mb-2">
                  Business Description (Optional)
                </label>
                <textarea
                  id="businessDescription"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#101c22] border border-[#2d4452] rounded-lg text-white placeholder-[#5a6e7b] focus:outline-none focus:ring-2 focus:ring-[#13a4ec] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  placeholder="Tell us about your business..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>
          )}

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link href="/merchant/login" className="text-[#13a4ec] hover:text-[#0d8ac4] text-sm">
              Back to Merchant Login
            </Link>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 text-center">
          <p className="text-[#5a6e7b] text-xs">
            Your application will be reviewed by our team. You'll receive a confirmation email once approved.
          </p>
        </div>
      </div>
    </div>
  );
}
