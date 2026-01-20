'use client';

import { LoginButton } from '../components/LoginButton';
import { usePrivyAuth } from '../hooks/usePrivyAuth';
import { DashboardHeader } from './components/DashboardHeader';
import { BalanceCard } from './components/BalanceCard';
import { ActionButtons } from './components/ActionButtons';
import { TransactionList } from './components/TransactionList';
import { DashboardBottomNav } from './components/DashboardBottomNav';

export default function DashboardPage() {
  const { authenticated } = usePrivyAuth();

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-[480px] mx-auto shadow-2xl">
      <DashboardHeader />

      <main className="flex-1 overflow-y-auto pb-24">
        {!authenticated ? (
          <div className="p-4 text-center">
            <p className="text-[#9db0b9] mb-4">Sign in to view your dashboard</p>
            <LoginButton />
          </div>
        ) : (
          <div className="flex flex-col">
            <BalanceCard />
            <ActionButtons />
            <TransactionList />
          </div>
        )}
      </main>

      <DashboardBottomNav />
    </div>
  );
}

export const dynamic = 'force-dynamic';
