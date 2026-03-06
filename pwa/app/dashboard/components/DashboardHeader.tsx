'use client';

import { usePrivyAuth } from '../../hooks/usePrivyAuth';

export function DashboardHeader() {
  const { userEmail } = usePrivyAuth();

  // Get user's name from email or use a default
  const displayName = userEmail?.split('@')[0] || 'Guest';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex items-center bg-[#101c22] p-4 pt-6 justify-between">
      <div className="flex items-center gap-3">
        {/* Profile avatar with initials */}
        <div className="bg-[#13a4ec] flex items-center justify-center aspect-square rounded-full size-10 border-2 border-primary/30">
          <span className="text-white text-sm font-bold">{initials}</span>
        </div>
        <div>
          <p className="text-[#9db0b9] text-xs font-medium">Welcome back,</p>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            {displayName}
          </h2>
        </div>
      </div>

      {/* Notification button (placeholder) */}
      <button className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-[#283339] text-white">
        <span className="material-symbols-outlined">notifications</span>
      </button>
    </header>
  );
}
