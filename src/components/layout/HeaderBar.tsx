'use client';

import React, { useState, useEffect } from 'react';
import {
  Droplets,
  DollarSign,
  ShoppingCart,
  UserCheck,
  RefreshCw,
  Menu,
  Maximize,
  Minimize,
} from 'lucide-react';
import { SystemSettings, UserAccount } from '@/types/water-factory';

interface HeaderBarProps {
  settings: SystemSettings;
  activeUser: UserAccount;
  onOpenPos: () => void;
  onUpdateRate: (newRate: number) => void;
  onToggleMobileMenu?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  settings,
  activeUser,
  onOpenPos,
  onUpdateRate,
  onToggleMobileMenu,
}) => {
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(settings.exchangeRateKhrPerUsd.toString());

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Track fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  const handleSaveRate = () => {
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val > 0) {
      onUpdateRate(val);
      setIsEditingRate(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 lg:px-6 flex items-center justify-between flex-shrink-0 select-none">
      {/* Brand & Factory Name with Mobile Menu Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 active:scale-95 transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
          <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xs sm:text-sm lg:text-base font-bold text-white tracking-wide truncate max-w-[140px] sm:max-w-[240px] md:max-w-none">
            {settings.factoryNameKh}
          </h1>
          <p className="text-[10px] sm:text-[11px] text-cyan-400 font-medium truncate max-w-[140px] sm:max-w-[240px] md:max-w-none">
            {settings.factoryNameEn} • ERP
          </p>
        </div>
      </div>

      {/* Center / Right Control Widgets */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
        {/* Fullscreen Toggle Button */}
        <button
          onClick={handleToggleFullscreen}
          className={`p-2 rounded-xl border transition flex items-center gap-1.5 ${
            isFullscreen
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700/80'
          }`}
          title={isFullscreen ? 'ចេញពីពេញអេក្រង់ (Exit Fullscreen)' : 'បើកពេញអេក្រង់ (Full Screen)'}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-cyan-400" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
          <span className="hidden xl:inline text-[11px] font-semibold">
            {isFullscreen ? 'បិទពេញអេក្រង់' : 'ពេញអេក្រង់'}
          </span>
        </button>

        {/* Exchange Rate Quick Widget */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400 font-medium">អត្រាប្តូរប្រាក់:</span>
          {isEditingRate ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                className="w-16 px-1.5 py-0.5 bg-slate-900 border border-cyan-500 rounded text-xs text-white text-right focus:outline-none"
                autoFocus
              />
              <span className="text-slate-400">៛</span>
              <button
                onClick={handleSaveRate}
                className="px-2 py-0.5 text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
              >
                រក្សាទុក
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingRate(true)}
              className="flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 transition"
              title="ចុចដើម្បីកែប្រែអត្រាប្តូរប្រាក់"
            >
              <span>1$ = {settings.exchangeRateKhrPerUsd.toLocaleString()} ៛</span>
              <RefreshCw className="w-3 h-3 text-slate-500" />
            </button>
          )}
        </div>

        {/* Quick Launch POS Button */}
        <button
          onClick={onOpenPos}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/30 transition transform active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">កន្លែងលក់រហ័ស</span>
          <span className="uppercase font-bold">POS</span>
        </button>

        {/* Current Active User Profile */}
        <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-800">
          <div
            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0"
            title={`${activeUser.fullName} (${activeUser.role})`}
          >
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="hidden sm:block text-left text-xs max-w-[120px]">
            <p className="font-semibold text-white leading-tight truncate">{activeUser.fullName}</p>
            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
              {activeUser.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
