'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  AlertTriangle,
  Users,
  CreditCard,
  DollarSign,
  Truck,
  BarChart3,
  Settings,
  X,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Pin,
} from 'lucide-react';
import { SrpLogo } from '@/components/common/SrpLogo';

export type ActiveModule =
  | 'dashboard'
  | 'pos'
  | 'orders'
  | 'products'
  | 'broken'
  | 'customers'
  | 'debt'
  | 'expenses'
  | 'suppliers'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  uncollectedDebtCount?: number;
  emptyBottleHoldersCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isFixed?: boolean;
  onToggleFixed?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  uncollectedDebtCount = 0,
  emptyBottleHoldersCount = 0,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  isFixed = true,
  onToggleFixed,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveModule,
      labelKh: 'ផ្ទាំងគ្រប់គ្រងទូទៅ',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'pos' as ActiveModule,
      labelKh: 'កន្លែងលក់រហ័ស (POS)',
      labelEn: 'Point of Sale',
      icon: ShoppingCart,
      isSpecial: true,
    },
    {
      id: 'orders' as ActiveModule,
      labelKh: 'ប្រវត្តិវិក្កយបត្រ',
      labelEn: 'Order History',
      icon: Receipt,
    },
    {
      id: 'products' as ActiveModule,
      labelKh: 'ផលិតផលទឹកសម្រេច',
      labelEn: 'Finished Products',
      icon: Package,
    },
    {
      id: 'broken' as ActiveModule,
      labelKh: 'ទំនិញខូចខាត/បែកបាក់',
      labelEn: 'Broken Loss Tracker',
      icon: AlertTriangle,
    },
    {
      id: 'customers' as ActiveModule,
      labelKh: 'អតិថិជន & សំបកធុង',
      labelEn: 'Customers & Bottles',
      icon: Users,
      badge: emptyBottleHoldersCount > 0 ? `${emptyBottleHoldersCount} កាន់ធុង` : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    },
    {
      id: 'debt' as ActiveModule,
      labelKh: 'បំណុល និងការទូទាត់',
      labelEn: 'Debt & Receivables',
      icon: CreditCard,
      badge: uncollectedDebtCount > 0 ? `${uncollectedDebtCount} ជំពាក់` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    {
      id: 'expenses' as ActiveModule,
      labelKh: 'ចំណាយប្រតិបត្តិការ',
      labelEn: 'Daily Expenses',
      icon: DollarSign,
    },
    {
      id: 'suppliers' as ActiveModule,
      labelKh: 'អ្នកផ្គត់ផ្គង់ (សៀវភៅលេខ)',
      labelEn: 'Suppliers Directory',
      icon: Truck,
    },
    {
      id: 'reports' as ActiveModule,
      labelKh: 'របាយការណ៍ហិរញ្ញវត្ថុ',
      labelEn: 'Financial Reports',
      icon: BarChart3,
    },
    {
      id: 'settings' as ActiveModule,
      labelKh: 'ការកំណត់ & អ្នកប្រើប្រាស់',
      labelEn: 'Settings & Users',
      icon: Settings,
    },
  ];

  const handleItemClick = (id: ActiveModule) => {
    onSelectModule(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (isMobile = false) => {
    const collapsed = !isMobile && isCollapsed;

    return (
      <>
        {/* Header Section */}
        <div
          className={`p-3 flex items-center ${
            collapsed ? 'justify-center' : 'justify-between'
          } border-b border-slate-800/60 flex-shrink-0 overflow-hidden`}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <p className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
                  ម៉ឺនុយគ្រប់គ្រង (11)
                </p>
                {isFixed && !isMobile && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 shrink-0">
                    <Pin className="w-2.5 h-2.5" />
                    <span>ថេរ</span>
                  </span>
                )}
              </div>

              {isMobile ? (
                onCloseMobile && (
                  <button
                    onClick={onCloseMobile}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  {onToggleFixed && (
                    <button
                      onClick={onToggleFixed}
                      className={`p-1.5 rounded-lg transition ${
                        isFixed
                          ? 'text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={isFixed ? 'ម៉ឺនុយថេរ (Sidebar is Fixed)' : 'ចុចដើម្បីកំណត់ម៉ឺនុយថេរ (Pin Sidebar)'}
                      aria-label="Toggle fixed sidebar"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onToggleCollapse && (
                    <button
                      onClick={onToggleCollapse}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="បង្រួមម៉ឺនុយ (Collapse Sidebar)"
                      aria-label="Collapse sidebar"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
                title="ពង្រីកម៉ឺនុយ (Expand Sidebar)"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* Navigation Items List (Strictly overflow-x-hidden to prevent horizontal scrolling) */}
        <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} py-2 space-y-1.5 overflow-y-auto overflow-x-hidden`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            if (collapsed) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={`${item.labelKh} (${item.labelEn})`}
                  className={`w-11 h-11 mx-auto flex items-center justify-center rounded-xl relative group transition-all duration-150 ${
                    item.isSpecial
                      ? isActive
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                        : 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 hover:text-white border border-cyan-800/40'
                      : isActive
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive
                        ? item.isSpecial
                          ? 'text-white'
                          : 'text-cyan-400'
                        : item.isSpecial
                        ? 'text-cyan-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />

                  {/* Collapsed Badge Indicator */}
                  {item.badge && (
                    <span
                      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[9px] font-bold rounded-full ${
                        item.id === 'debt'
                          ? 'bg-rose-500 text-white'
                          : 'bg-cyan-500 text-slate-950'
                      } ring-2 ring-slate-900 shadow`}
                    >
                      {item.id === 'debt' ? uncollectedDebtCount : emptyBottleHoldersCount}
                    </span>
                  )}

                  {/* Floating Tooltip */}
                  <div className="hidden group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg shadow-xl text-xs whitespace-nowrap pointer-events-none items-center gap-1.5">
                    <span className="font-medium">{item.labelKh}</span>
                    <span className="text-[10px] text-cyan-400 font-normal">({item.labelEn})</span>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all duration-150 overflow-hidden ${
                  item.isSpecial
                    ? isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 font-bold'
                      : 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 hover:text-white border border-cyan-800/40'
                    : isActive
                    ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? item.isSpecial
                          ? 'text-white'
                          : 'text-cyan-400'
                        : item.isSpecial
                        ? 'text-cyan-400'
                        : 'text-slate-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="font-medium leading-none truncate">{item.labelKh}</p>
                    <p className="text-[10px] opacity-70 mt-1 leading-none truncate">{item.labelEn}</p>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-md shrink-0 ml-1 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div
          className={`p-3 border-t border-slate-800 text-[10px] text-slate-500 flex-shrink-0 overflow-hidden ${
            collapsed ? 'flex justify-center' : 'text-center'
          }`}
        >
          {collapsed ? (
            <span className="font-bold text-cyan-500/80" title="SRP Water ERP v1.0">
              SRP
            </span>
          ) : (
            <>
              <p className="font-medium text-slate-400 truncate">SRP Water ERP v1.0</p>
              <p className="truncate">ប្រព័ន្ធសុវត្ថិភាព ផលិតទឹកបរិសុទ្ធ</p>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {/* Desktop Fixed Sidebar (hidden on mobile and tablet < lg) */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 select-none bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out h-full overflow-hidden overflow-x-hidden ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {navContent(false)}
      </aside>

      {/* Mobile Slide-over Drawer (visible when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Content with Safe Area Notch padding */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10 shadow-2xl overflow-hidden overflow-x-hidden pt-[env(safe-area-inset-top,0px)]">
            {/* Mobile Header with Logo */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <SrpLogo size={34} showText={true} subtitle="គ្រប់គ្រងម៉ឺនុយទាំងអស់" />
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {navContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
