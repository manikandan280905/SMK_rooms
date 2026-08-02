import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let color = 'bg-slate-100 text-slate-800 border-slate-300';

  switch (status?.toUpperCase()) {
    case 'AVAILABLE':
    case 'PAID':
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'OCCUPIED':
    case 'PENDING':
      color = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'CLEANING':
    case 'PARTIAL':
      color = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'MAINTENANCE':
    case 'CANCELLED':
      color = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
    case 'RESERVED':
    case 'CHECKED_IN':
      color = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'CHECKED_OUT':
      color = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        color,
        className
      )}
    >
      {status?.replace('_', ' ')}
    </span>
  );
}
