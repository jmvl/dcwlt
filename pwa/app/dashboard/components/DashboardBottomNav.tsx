'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: 'home' },
    { name: 'History', href: '/history', icon: 'history' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F192E] border-t border-white/5 safe-area-inset-bottom z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
      <div className="flex justify-around items-center px-4 pt-3 pb-8">
        {/* Left tab - Home */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/dashboard' ? 'text-primary' : 'text-[#9db0b9]'
          }`}
        >
          <span
            className="material-symbols-outlined !text-2xl"
            style={{
              fontVariationSettings: pathname === '/dashboard' ? 'FILL 1' : 'FILL 0',
            }}
          >
            home
          </span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        {/* Center - Elevated Scan Button */}
        <div className="relative -top-6">
          <div className="flex items-center justify-center p-1 rounded-full bg-primary/20">
            <Link
              href="/scan"
              className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40"
            >
              <span className="material-symbols-outlined !text-3xl">qr_code_scanner</span>
            </Link>
          </div>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#9db0b9]">
            Scan
          </span>
        </div>

        {/* Right tab - History */}
        <Link
          href="/history"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/history' ? 'text-primary' : 'text-[#9db0b9]'
          }`}
        >
          <span
            className="material-symbols-outlined !text-2xl"
            style={{
              fontVariationSettings: pathname === '/history' ? 'FILL 1' : 'FILL 0',
            }}
          >
            history
          </span>
          <span className="text-[10px] font-bold">History</span>
        </Link>
      </div>

      {/* Home indicator for iOS */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full pointer-events-none" />
    </nav>
  );
}
