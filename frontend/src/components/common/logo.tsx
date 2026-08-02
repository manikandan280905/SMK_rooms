'use client';

import React from 'react';
import { Building2, Sparkles, KeyRound } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'orange';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
}

export function Logo({
  size = 'md',
  variant = 'light',
  showSubtitle = true,
  subtitleText = 'Digital Register & Stays',
  className = '',
}: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-16 h-16 text-3xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Creative Light Orange Logo Badge */}
      <div
        className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-400 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center transition-transform hover:scale-105`}
      >
        <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center relative overflow-hidden group">
          {/* Subtle Orange Glow inside logo */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/10 opacity-80" />

          {/* Icon Composition */}
          <div className="relative z-10 flex items-center justify-center text-orange-400">
            <Building2 className="w-[55%] h-[55%] text-orange-400 drop-shadow-[0_2px_4px_rgba(249,115,22,0.5)]" />
            <Sparkles className="w-[30%] h-[30%] text-amber-300 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Brand Name (SMK Rooms) */}
      <div className="flex flex-col">
        <div className={`font-extrabold tracking-tight ${textSizes[size]} flex items-center gap-1.5 leading-none`}>
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
            SMK
          </span>
          <span className={variant === 'dark' ? 'text-white' : 'text-slate-900'}>
            Rooms
          </span>
        </div>

        {showSubtitle && (
          <span className={`font-semibold tracking-wider uppercase ${subtitleSizes[size]} ${variant === 'dark' ? 'text-orange-300/80' : 'text-orange-600/90'} mt-1`}>
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
}
