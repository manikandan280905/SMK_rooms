'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, UserPlus, Building2 } from 'lucide-react';
import { useLodge } from '@/lib/lodge-context';

interface TopbarProps {
  setMobileOpen: (open: boolean) => void;
}

export function Topbar({ setMobileOpen }: TopbarProps) {
  const { lodges, selectedLodgeId, setSelectedLodgeId } = useLodge();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Lodge Selector Dropdown in Top Header */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md">
          <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <select
            value={selectedLodgeId}
            onChange={(e) => setSelectedLodgeId(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-bold text-blue-900 focus:outline-none cursor-pointer"
          >
            <option value="ALL">🌐 All Lodges Combined</option>
            {lodges.map((lodge) => (
              <option key={lodge.id} value={lodge.id}>
                🏨 {lodge.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/guests/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-md shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Guest Check-in</span>
        </Link>
      </div>
    </header>
  );
}
