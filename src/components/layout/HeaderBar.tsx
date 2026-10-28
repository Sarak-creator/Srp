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
  Download,
  Smartphone,
  Monitor,
  X,
  Check,
  ExternalLink,
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

  // PWA / Shortcut Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    // Check if running in standalone/fullscreen mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      Boolean((window.navigator as any).standalone);
    setIsStandalone(isStandaloneMode);

    // Track fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Capture PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else {
      setShowInstallModal(true);
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
    <>
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
            className={`p-2 rounded-xl border transition flex items-center gap-1 ${
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

          {/* Install Shortcut App Button */}
          <button
            onClick={handleInstallClick}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isStandalone
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700/80'
            }`}
            title={
              isStandalone
                ? 'កម្មវិធីកំពុងដំណើរការជា Shortcut App ពេញអេក្រង់'
                : 'ដំឡើងជា Shortcut App ពេញអេក្រង់ (Install Fullscreen App)'
            }
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">
              {isStandalone ? 'Shortcut App' : 'ដំឡើង App'}
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

      {/* PWA / Shortcut App Installation Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    ដំឡើងកម្មវិធីជា Shortcut ពេញអេក្រង់ (Full Screen App)
                  </h3>
                  <p className="text-[11px] text-cyan-400">
                    ដំណើរការលឿន ដូច Native App គ្មានរបារ Browser Address Bar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              {/* Option 1: Chrome / Edge on Windows & Mac */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <Monitor className="w-4 h-4" />
                  <span>១. លើកុំព្យូទ័រ PC / Laptop (Google Chrome ឬ Microsoft Edge)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  • ចុចលើរូប Icon <span className="font-semibold text-white">«Install»</span> នៅចុងខាងស្តាំនៃ Address Bar (URL Bar)
                  <br />
                  • ឬចុច Menu ៣ចុច (⋮) ➔ ជ្រើសរើស <span className="font-semibold text-white">«Save and Share»</span> ➔ <span className="font-semibold text-white">«Create Shortcut...»</span> ➔ ធីកលើ <span className="font-semibold text-cyan-400">«Open as window»</span> រួចចុច Create។
                </p>
              </div>

              {/* Option 2: Android Phones & Tablets */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <Smartphone className="w-4 h-4" />
                  <span>២. លើទូរស័ព្ទ ឬថេប្លេត Android (Google Chrome)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  • ចុចលើ Menu ៣ចុច (⋮) នៅផ្នែកខាងលើស្តាំ
                  <br />
                  • ជ្រើសរើស <span className="font-semibold text-white">«Install App»</span> ឬ <span className="font-semibold text-emerald-400">«Add to Home screen»</span>។
                </p>
              </div>

              {/* Option 3: iPhone / iPad (Safari) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-300">
                  <Smartphone className="w-4 h-4" />
                  <span>៣. លើ iPhone / iPad (កម្មវិធីរុករក Safari)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  • ចុចលើប៊ូតុង Share (រូបប្រអប់មានសញ្ញាព្រួញឡើងលើ ⎋) នៅបាតអេក្រង់
                  <br />
                  • អូសចុះក្រោម រួចជ្រើសរើស <span className="font-semibold text-blue-400">«Add to Home Screen (បន្ថែមទៅទំព័រដើម ➕)»</span>។
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                ✓ គាំទ្រពេញលេញនូវ PWA Full Screen Display
              </span>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-600/30 transition"
              >
                យល់ព្រម
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
