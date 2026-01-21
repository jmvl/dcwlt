'use client';

import { Layers, Store } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'groups' | 'assignments';
  onTabChange: (tab: 'groups' | 'assignments') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange('groups')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          activeTab === 'groups'
            ? 'bg-[#13a4ec] text-white'
            : 'bg-[#1a2f38] text-[#9db0b9] hover:text-white hover:bg-[#24404d]'
        }`}
      >
        <Layers className="w-4 h-4" />
        Item Groups
      </button>

      <button
        onClick={() => onTabChange('assignments')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          activeTab === 'assignments'
            ? 'bg-[#13a4ec] text-white'
            : 'bg-[#1a2f38] text-[#9db0b9] hover:text-white hover:bg-[#24404d]'
        }`}
      >
        <Store className="w-4 h-4" />
        Merchant Assignments
      </button>
    </div>
  );
}
