'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLodge } from '@/lib/lodge-context';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  FileText,
  Settings,
  LogOut,
  Building2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '@/components/common/logo';
import { cn } from '@/lib/utils';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { logout, admin } = useAuth();
  const { lodges, selectedLodgeId, setSelectedLodgeId, selectedLodge } = useLodge();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Guests', href: '/guests', icon: Users },
    { label: 'Rooms', href: '/rooms', icon: BedDouble },
    { label: 'Reports', href: '/reports', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Public Landing Page', href: '/landing', icon: ExternalLink, external: true },
  ];

  const content = (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 w-64">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
        <Link href="/" title="Dashboard">
          <Logo size="sm" variant="light" subtitleText="Digital Register" />
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-slate-500 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Lodge Switcher Card in Sidebar */}
      <div className="p-3 border-b border-slate-100 bg-slate-50">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
          Active Lodge Context
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedLodgeId('ALL')}
            className={cn(
              'w-full text-left px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-2 transition-colors',
              selectedLodgeId === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            )}
          >
            <span>🌐</span>
            <span>All Lodges Combined</span>
          </button>
          {lodges.map((lodge) => (
            <button
              key={lodge.id}
              onClick={() => setSelectedLodgeId(lodge.id)}
              className={cn(
                'w-full text-left px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-2 transition-colors',
                selectedLodgeId === lodge.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              )}
            >
              <span>🏨</span>
              <span className="truncate">{lodge.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 rounded-l-none'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'text-blue-600' : 'text-slate-400')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs border border-blue-200">
            {admin?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-800 truncate">{admin?.name || 'Administrator'}</p>
            <p className="text-[11px] text-slate-500 truncate">{admin?.email || 'admin@smkrooms.com'}</p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-30">
        {content}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
}
