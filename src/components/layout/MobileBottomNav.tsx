'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Users,
  Menu,
} from 'lucide-react';
import { ActiveModule } from './Sidebar';

interface MobileBottomNavProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  onOpenMobileDrawer: () => void;
  isMobileDrawerOpen: boolean;
  uncollectedDebtCount?: number;
  emptyBottleHoldersCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeModule,
  onSelectModule,
  onOpenMobileDrawer,
  isMobileDrawerOpen,
  uncollectedDebtCount = 0,
  emptyBottleHoldersCount = 0,
}) => {
  const primaryTabs = [
    {
      id: 'dashboard' as ActiveModule,
      labelKh: 'ទូទៅ',
      labelEn: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'pos' as ActiveModule,
      labelKh: 'លក់ POS',
      labelEn: 'POS',
      icon: ShoppingCart,
      isSpecial: true,
    },
    {
      id: 'orders' as ActiveModule,
      labelKh: 'វិក្កយបត្រ',
      labelEn: 'Orders',
      icon: Receipt,
    },
    {
      id: 'customers' as ActiveModule,
      labelKh: 'អតិថិជន',
      labelEn: 'Customers',
      icon: Users,
      badge: emptyBottleHoldersCount > 0 ? emptyBottleHoldersCount : undefined,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 flex items-center justify-around shadow-2xl safe-area-pb">
      {primaryTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeModule === tab.id;

        if (tab.isSpecial) {
          return (
            <button
              key={tab.id}
              onClick={() => onSelectModule(tab.id)}
              className="relative -top-3 flex flex-col items-center justify-center group focus:outline-none"
              aria-label="Open POS"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-cyan-500/40 ring-2 ring-cyan-400'
                    : 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-600/30'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={`text-[10px] font-bold mt-1 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`}
              >
                {tab.labelKh}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onSelectModule(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative active:scale-95 ${
              isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-0.5" />
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2 px-1 py-0.2 min-w-[14px] text-[9px] font-black rounded-full bg-cyan-500 text-slate-950 text-center leading-none">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px]">{tab.labelKh}</span>
          </button>
        );
      })}

      {/* Menu / All 11 Modules Button */}
      <button
        onClick={onOpenMobileDrawer}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative active:scale-95 ${
          isMobileDrawerOpen ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Menu className="w-5 h-5 mb-0.5" />
          {uncollectedDebtCount > 0 && (
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 min-w-[14px] text-[9px] font-black rounded-full bg-rose-500 text-white text-center leading-none">
              {uncollectedDebtCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">ម៉ឺនុយ</span>
      </button>
    </nav>
  );
};
