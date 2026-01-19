'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Clock, LogOut } from 'lucide-react';
import { useLogout } from '../utils/logout';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Items', href: '/merchant/inventory', icon: ShoppingCart },
  { name: 'History', href: '/merchant/sales', icon: Clock },
];

export default function MerchantBottomNav() {
  const pathname = usePathname();
  const { logout: handleLogout } = useLogout('merchant');

  const onLogout = async () => {
    await handleLogout();
  };

  // Check if current path matches or starts with a nav item's href
  const isActive = (href: string) => {
    if (pathname === href) return true;
    // Handle nested routes
    if (pathname.startsWith(href + '/')) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a2f38] border-t border-[#1a2f38] md:hidden z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-[#13a4ec]' : 'text-[#9db0b9] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#13a4ec] rounded-full" />
                )}
              </div>
              <span className="text-xs font-medium mt-1">{item.name}</span>
            </Link>
          );
        })}
        {/* Logout button */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center flex-1 h-full transition-colors text-[#9db0b9] hover:text-white"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs font-medium mt-1">Logout</span>
        </button>
      </div>
    </nav>
  );
}
