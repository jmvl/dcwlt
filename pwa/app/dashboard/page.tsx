import { BalanceDisplay } from '../../components/BalanceDisplay';
import { LoginButton } from '../../components/LoginButton';
import { usePrivyAuth } from '../../hooks/usePrivyAuth';

export default function DashboardPage() {
  const { authenticated } = usePrivyAuth();

  return (
    <div className="min-h-screen bg-[#101c22] flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-[#1a2f38]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Event Wallet</h1>
          <LoginButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!authenticated ? (
          <div className="text-center">
            <p className="text-[#9db0b9] mb-4">Sign in to view your balance</p>
            <LoginButton />
          </div>
        ) : (
          <div className="w-full max-w-md">
            <BalanceDisplay />
          </div>
        )}
      </main>
    </div>
  );
}
