'use client';

import { usePathname, useRouter } from 'next/navigation';
import { MerchantAuthProvider, useMerchantAuth } from '../components/MerchantAuthProvider';
import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Package,
} from 'lucide-react';
import { useState } from 'react';
import MerchantBottomNav from '../components/MerchantBottomNav';
import { useLogout } from '../utils/logout';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/merchant', icon: LayoutDashboard },
  { name: 'Inventory', href: '/merchant/inventory', icon: Package },
  { name: 'Sales', href: '/merchant/sales', icon: TrendingUp },
  { name: 'Settings', href: '/merchant/settings', icon: Settings },
];

function MerchantLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { merchant } = useMerchantAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout: handleLogout } = useLogout('merchant');

  // Skip layout for login/register pages - they should be standalone
  const isAuthPage = pathname === '/merchant/login' || pathname === '/merchant/register';
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#101c22] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-[#1a2f38] border-r border-[#1a2f38]">
        {/* Logo/Header */}
        <div className="p-6 border-b border-[#1a2f38]">
          <h1 className="text-xl font-bold text-white">Merchant Portal</h1>
          {merchant && (
            <p className="text-xs text-[#9db0b9] mt-1">{merchant.businessName}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#13a4ec] text-white'
                    : 'text-[#9db0b9] hover:text-white hover:bg-[#243b47]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-[#1a2f38]">
          <div className="mb-3">
            <p className="text-sm font-medium text-white">{merchant?.businessName || 'Merchant'}</p>
            <p className="text-xs text-[#9db0b9]">{merchant?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#9db0b9] hover:text-white hover:bg-[#243b47] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden p-4 bg-[#1a2f38] border-b border-[#1a2f38]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Merchant Portal</h1>
              <p className="text-xs text-[#9db0b9]">{merchant?.businessName || 'Merchant'}</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#9db0b9] hover:text-white rounded-lg hover:bg-[#243b47] transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1a2f38] border-b border-[#1a2f38] px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#13a4ec] text-white'
                      : 'text-[#9db0b9] hover:text-white hover:bg-[#243b47]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#9db0b9] hover:text-white hover:bg-[#243b47] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <MerchantBottomNav />
    </div>
  );
}

export default function MerchantLayout(props: { children: React.ReactNode }) {
  return (
    <MerchantAuthProvider>
      <MerchantLayoutContent {...props} />
    </MerchantAuthProvider>
  );
}

export const dynamic = 'force-dynamic';
