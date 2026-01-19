'use client';

import { usePathname, useRouter } from 'next/navigation';
import { usePrivyAuth } from '../hooks/usePrivyAuth';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Link,
  Package,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLogout, getStoredUserType, clearStoredUserType, storeUserType } from '../utils/logout';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Merchants', href: '/admin', icon: Users },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Assignments', href: '/admin/assignments', icon: Link },
  { name: 'Inventory', href: '/admin/inventory', icon: Package },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, user, login } = usePrivyAuth();
  const { logout: handleLogout } = useLogout('admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is admin (DCWLT email domain)
  // Privy's user.email is an object with .address property
  const userEmail = user?.email?.address;
  const isAdmin = userEmail?.endsWith('@dcwlt.com') || userEmail?.endsWith('@accelior.com') || false;

  // Check for session type mismatch
  useEffect(() => {
    if (user && isAdmin) {
      const storedUserType = getStoredUserType();
      if (storedUserType && storedUserType !== 'admin') {
        // User is authenticated but stored type doesn't match admin route
        console.log('[AdminLayout] Session type mismatch:', storedUserType, '!= admin');
        // Clear the mismatched session and redirect
        clearStoredUserType();
        router.push('/admin');
      } else if (!storedUserType) {
        // Store admin type for session tracking
        storeUserType('admin');
      }
    }
  }, [user, isAdmin, router]);

  // Loading state
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101c22]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
        <p className="ml-4 text-[#9db0b9]">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101c22]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Login Required</h1>
          <button
            onClick={() => login()}
            className="px-6 py-3 bg-[#13a4ec] text-white rounded-lg font-medium hover:bg-[#0d8bc4] transition-colors"
          >
            Login with Privy
          </button>
          <p className="mt-4 text-[#9db0b9]">You must be logged in with an approved email to access this page.</p>
        </div>
      </div>
    );
  }

  // Authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101c22]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-[#9db0b9]">You don't have permission to access this page.</p>
          <p className="mt-2 text-sm text-[#9db0b9]">Logged in as: {userEmail}</p>
          <p className="mt-3 text-sm text-[#13a4ec]">Please log in with an admin account (@dcwlt.com or @accelior.com)</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#13a4ec] text-white rounded-lg hover:bg-[#0d8bc4] transition-colors font-medium"
            >
              Logout and Login as Admin
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-[#243b47] text-white rounded-lg hover:bg-[#1a2f38] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101c22] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-[#1a2f38] border-r border-[#1a2f38]">
        {/* Logo/Header */}
        <div className="p-6 border-b border-[#1a2f38]">
          <h1 className="text-xl font-bold text-white">DCWLT Admin</h1>
          <p className="text-xs text-[#9db0b9] mt-1">Merchant Management</p>
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
            <p className="text-sm font-medium text-white">{userEmail || 'Unknown'}</p>
            <p className="text-xs text-[#9db0b9]">Administrator</p>
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
              <h1 className="text-lg font-bold text-white">DCWLT Admin</h1>
              <p className="text-xs text-[#9db0b9]">{userEmail || 'Unknown'}</p>
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
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
