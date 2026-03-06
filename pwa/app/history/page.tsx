'use client';

import Link from 'next/link';
import { DashboardBottomNav } from '../dashboard/components/DashboardBottomNav';

export default function HistoryPage() {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-[480px] mx-auto shadow-2xl">
      <header className="flex items-center bg-[#101c22] p-4 pt-6 justify-between">
        <h1 className="text-xl font-bold text-white">Transaction History</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 p-4">
        <div className="bg-[#1c2a31]/40 rounded-2xl p-8 text-center border border-white/5">
          <span className="material-symbols-outlined text-[#9db0b9] text-5xl mb-3">
            construction
          </span>
          <h2 className="text-white text-lg font-bold mb-2">Coming Soon</h2>
          <p className="text-[#9db0b9] text-sm mb-4">
            Full transaction history will be available in a future update
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-primary text-white font-bold rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>

      <DashboardBottomNav />
    </div>
  );
}

export const dynamic = 'force-dynamic';
