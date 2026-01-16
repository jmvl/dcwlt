import Link from 'next/link';
import { InstallPrompt } from './components/InstallPrompt';
import { LoginButton } from './components/LoginButton';

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-[#101c22]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Event Wallet</h1>
          <p className="text-lg text-[#9db0b9] mb-12">Frictionless payments at live events</p>
          <LoginButton />
          <div className="mt-6">
            <Link href="/dashboard" className="block w-full text-center">
              <button className="w-full bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                View Dashboard
              </button>
            </Link>
          </div>
        </div>
      </main>
      <InstallPrompt />
    </>
  );
}
