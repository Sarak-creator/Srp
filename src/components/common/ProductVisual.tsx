'use client';

import React from 'react';
import { Droplets, Sparkles, Box, Package } from 'lucide-react';

interface ProductVisualProps {
  unit?: string;
  isRefill20l?: boolean;
  productCode?: string;
  className?: string;
  showRipples?: boolean;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  unit = 'container_20l',
  isRefill20l = false,
  productCode = '',
  className = '',
  showRipples = true,
}) => {
  const is20L = isRefill20l || unit === 'container_20l' || unit.includes('20l');
  const isPack = unit.includes('pack') || unit.includes('យួរ') || unit.includes('350') || unit.includes('500');
  const isLargePack = unit.includes('1500') || unit.includes('1.5');

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* Background Soft Glow & Radial Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950" />
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Grid Mesh overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Water Ripple Waves (Subtle aesthetic bottom glow) */}
      {showRipples && (
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-cyan-950/40 via-cyan-950/10 to-transparent pointer-events-none" />
      )}

      {/* SVG Container Illustration */}
      <div className="relative z-10 flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-108">
        {is20L ? (
          // 20L Water Gallon / Dispenser Container SVG
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_8px_20px_rgba(6,182,212,0.35)]"
            viewBox="0 0 100 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Bottle Neck / Handle */}
            <rect x="42" y="6" width="16" height="12" rx="4" fill="#0891b2" />
            <rect x="40" y="16" width="20" height="4" rx="2" fill="#06b6d4" />
            {/* Bottle Body */}
            <path
              d="M30 28 C30 22, 70 22, 70 28 L78 40 C80 44, 82 50, 82 56 L82 98 C82 108, 74 114, 64 114 L36 114 C26 114, 18 108, 18 98 L18 56 C18 50, 20 44, 22 40 Z"
              fill="url(#gallon_grad)"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeOpacity="0.7"
            />
            {/* Gallon Rib Lines */}
            <path d="M22 54 Q50 58 78 54" stroke="#67e8f9" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
            <path d="M20 72 Q50 76 80 72" stroke="#67e8f9" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
            <path d="M20 90 Q50 94 80 90" stroke="#67e8f9" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
            {/* Water Highlight & Reflection */}
            <path
              d="M26 44 L26 98 C26 102, 30 106, 35 106"
              stroke="#ffffff"
              strokeWidth="3"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />
            {/* 20L Brand Label */}
            <rect x="36" y="62" width="28" height="16" rx="4" fill="#0e7490" fillOpacity="0.8" />
            <text x="50" y="74" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif">
              20L
            </text>
            {/* Water Drop in center */}
            <circle cx="50" cy="40" r="3" fill="#a5f3fc" />
            {/* Gradients */}
            <defs>
              <linearGradient id="gallon_grad" x1="18" y1="24" x2="82" y2="114" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0891b2" stopOpacity="0.85" />
                <stop offset="0.5" stopColor="#0284c7" stopOpacity="0.7" />
                <stop offset="1" stopColor="#0f172a" stopOpacity="0.95" />
              </linearGradient>
            </defs>
          </svg>
        ) : isPack ? (
          // Bottled Water Pack (24 bottles bundle with shrink wrap)
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_8px_20px_rgba(16,185,129,0.3)]"
            viewBox="0 0 110 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Pack Outer Shrink Wrap */}
            <rect x="15" y="32" width="80" height="66" rx="14" fill="url(#pack_bg)" stroke="#34d399" strokeWidth="2" strokeOpacity="0.6" />
            {/* Bottle Caps (3 visible in front/top) */}
            <rect x="25" y="14" width="12" height="10" rx="3" fill="#06b6d4" />
            <rect x="49" y="14" width="12" height="10" rx="3" fill="#06b6d4" />
            <rect x="73" y="14" width="12" height="10" rx="3" fill="#06b6d4" />
            {/* Bottle Necks */}
            <path d="M28 24 L34 24 L36 32 L26 32 Z" fill="#0284c7" />
            <path d="M52 24 L58 24 L60 32 L50 32 Z" fill="#0284c7" />
            <path d="M76 24 L82 24 L84 32 L74 32 Z" fill="#0284c7" />
            {/* Bottle Bodies inside pack */}
            <rect x="23" y="36" width="16" height="54" rx="4" fill="#0ea5e9" fillOpacity="0.3" stroke="#67e8f9" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="47" y="36" width="16" height="54" rx="4" fill="#0ea5e9" fillOpacity="0.3" stroke="#67e8f9" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="71" y="36" width="16" height="54" rx="4" fill="#0ea5e9" fillOpacity="0.3" stroke="#67e8f9" strokeWidth="1" strokeOpacity="0.4" />
            {/* Pack Band Label */}
            <rect x="16" y="54" width="78" height="18" fill="#059669" fillOpacity="0.85" />
            <text x="55" y="67" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif">
              {isLargePack ? '1500ML x 12' : 'PACK 24'}
            </text>
            <defs>
              <linearGradient id="pack_bg" x1="15" y1="32" x2="95" y2="98" gradientUnits="userSpaceOnUse">
                <stop stopColor="#064e3b" stopOpacity="0.85" />
                <stop offset="0.6" stopColor="#0284c7" stopOpacity="0.5" />
                <stop offset="1" stopColor="#0f172a" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        ) : (
          // Single Pure Mineral Water Bottle SVG
          <svg
            className="w-14 h-16 sm:w-16 sm:h-20 drop-shadow-[0_8px_20px_rgba(59,130,246,0.35)]"
            viewBox="0 0 80 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Cap */}
            <rect x="34" y="8" width="12" height="10" rx="3" fill="#06b6d4" />
            <rect x="32" y="16" width="16" height="3" rx="1.5" fill="#22d3ee" />
            {/* Bottle Neck */}
            <path d="M35 19 L45 19 L48 30 L32 30 Z" fill="#0284c7" />
            {/* Bottle Body */}
            <path
              d="M32 30 C30 36, 26 42, 24 50 L24 100 C24 106, 28 110, 34 110 L46 110 C52 110, 56 106, 56 100 L56 50 C54 42, 50 36, 48 30 Z"
              fill="url(#bottle_grad)"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeOpacity="0.7"
            />
            {/* Label */}
            <rect x="24" y="58" width="32" height="20" fill="#0369a1" fillOpacity="0.9" />
            <text x="40" y="72" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="900" fontFamily="sans-serif">
              SRP
            </text>
            {/* Reflection line */}
            <path d="M28 46 L28 100" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.4" strokeLinecap="round" />
            <defs>
              <linearGradient id="bottle_grad" x1="24" y1="30" x2="56" y2="110" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="0.5" stopColor="#0369a1" stopOpacity="0.6" />
                <stop offset="1" stopColor="#0f172a" stopOpacity="0.95" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {/* Floating Sparkle Icon in top corner */}
      <div className="absolute bottom-2.5 right-2.5 opacity-40 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
      </div>
    </div>
  );
};
