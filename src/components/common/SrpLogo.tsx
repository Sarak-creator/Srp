'use client';

import React from 'react';

interface SrpLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  className?: string;
  subtitle?: string;
  logoSrc?: string;
}

export const SrpLogo: React.FC<SrpLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtitle = 'PURE WATER',
  logoSrc = '/srp_logo_option1_minimalist.jpg',
}) => {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 32;
      case 'md':
        return 40;
      case 'lg':
        return 48;
      case 'xl':
        return 64;
      default:
        return 40;
    }
  };

  const dim = getDimension();

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Resolution Brand Logo Badge */}
      <div
        style={{ width: dim, height: dim }}
        className="relative shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-cyan-500/40 shadow-lg shadow-cyan-500/20 group transition-transform duration-200 hover:scale-105"
      >
        <img
          src={logoSrc}
          alt="SRP Pure Water Logo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Typography Lockup */}
      {showText && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-sm font-black text-white tracking-wide">SRP</span>
            <span className="text-xs font-bold text-cyan-400 tracking-wide uppercase">
              Pure Water
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider mt-0.5 uppercase truncate">
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
};
