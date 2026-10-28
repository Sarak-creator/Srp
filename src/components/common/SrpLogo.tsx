'use client';

import React from 'react';

interface SrpLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

export const SrpLogo: React.FC<SrpLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtitle = 'PURE WATER',
}) => {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 28;
      case 'md':
        return 38;
      case 'lg':
        return 48;
      case 'xl':
        return 64;
      default:
        return 38;
    }
  };

  const dim = getDimension();

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Premium SRP Vector Droplet Badge */}
      <div
        style={{ width: dim, height: dim }}
        className="relative shrink-0 flex items-center justify-center rounded-2xl shadow-lg shadow-cyan-500/20"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer Background Gradient */}
            <linearGradient id="srpBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>

            {/* Inner Liquid Droplet Gradient */}
            <linearGradient id="srpDropGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="35%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Glowing Ring Gradient */}
            <linearGradient id="srpRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Squircle App Container */}
          <rect width="100" height="100" rx="24" fill="url(#srpBgGrad)" />

          {/* Subtle Outer Border */}
          <rect
            x="1.5"
            y="1.5"
            width="97"
            height="97"
            rx="22.5"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="3"
          />

          {/* Ripple Wave Circle at bottom */}
          <ellipse
            cx="50"
            cy="76"
            rx="28"
            ry="9"
            stroke="url(#srpRingGrad)"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            opacity="0.75"
          />

          {/* Main Crystal Pure Water Droplet with Fluid Curve */}
          <path
            d="M50 16 C50 16 26 48 26 64 C26 77.25 36.75 84 50 84 C63.25 84 74 77.25 74 64 C74 48 50 16 50 16 Z"
            fill="url(#srpDropGrad)"
          />

          {/* Left Meniscus Light Reflection */}
          <path
            d="M50 24 C50 24 33 49 33 62 C33 66 35 70 38 73 C35 69 35 63 39 54 C43 45 50 24 50 24 Z"
            fill="#ffffff"
            opacity="0.65"
          />

          {/* Tiny Top-Right Sparkle Specular */}
          <circle cx="60" cy="52" r="3" fill="#ffffff" opacity="0.8" />

          {/* SRP Emblem Lettermark */}
          <text
            x="50"
            y="66"
            textAnchor="middle"
            fill="#ffffff"
            fontWeight="900"
            fontSize="18"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="1"
            style={{ filter: 'drop-shadow(0px 2px 3px rgba(2,6,23,0.7))' }}
          >
            SRP
          </text>
        </svg>
      </div>

      {/* Typography Brand Lockup */}
      {showText && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-sm font-black text-white tracking-wider">SRP</span>
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

