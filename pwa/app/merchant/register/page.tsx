"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export default function MerchantRegisterPage() {
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const registerMerchant = useMutation(api.merchants.registerMerchant);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate email
    if (!email.trim()) {
      setErrorMessage("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    // Validate business name
    if (!businessName.trim()) {
      setErrorMessage("Business name is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerMerchant({
        email: email.trim(),
        businessName: businessName.trim(),
      });

      console.log("Merchant registered:", result);
      setSuccessMessage("Application submitted! We'll review your application shortly.");
      // Clear form
      setEmail("");
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
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#9db0b9] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-[#101c22] border border-[#2d4452] rounded-lg text-white placeholder-[#5a6e7b] focus:outline-none focus:ring-2 focus:ring-[#13a4ec] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="your@email.com"
                  required
                />
              </div>

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
            <Link href="/" className="text-[#13a4ec] hover:text-[#0d8ac4] text-sm">
              Back to Home
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
