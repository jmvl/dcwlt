'use client';

import Link from 'next/link';
import { Plus, QrCode } from 'lucide-react';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { LoginButton } from '../components/LoginButton';
import { usePrivyAuth } from '../hooks/usePrivyAuth';

export default function DashboardPage() {
  const { authenticated } = usePrivyAuth();

  return (
    <div className="min-h-screen bg-[#101c22] flex flex-col">
      <header className="p-4 border-b border-[#1a2f38]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Event Wallet</h1>
          <LoginButton />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!authenticated ? (
          <div className="text-center">
            <p className="text-[#9db0b9] mb-4">Sign in to view your balance</p>
            <LoginButton />
          </div>
        ) : (
          <div className="w-full max-w-md">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Link
                href="/topup"
                className="bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Top Up
              </Link>
              <Link
                href="/scan"
                className="bg-[#1a2f38] hover:bg-[#243b47] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-[#2a4049]"
              >
                <QrCode className="w-5 h-5" />
                Scan QR
              </Link>
            </div>
            <BalanceDisplay />
          </div>
        )}
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
