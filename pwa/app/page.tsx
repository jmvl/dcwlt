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
        </div>
      </main>
      <InstallPrompt />
    </>
  );
}
