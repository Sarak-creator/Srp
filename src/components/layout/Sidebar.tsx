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
} from 'lucide-react';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  uncollectedDebtCount = 0,
  emptyBottleHoldersCount = 0,
  isMobileOpen = false,
  onCloseMobile,
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

  const navContent = (isMobile = false) => (
    <>
      <div className="p-3 flex items-center justify-between">
        <p className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500">
          ម៉ឺនុយគ្រប់គ្រង (11 MODULES)
        </p>
        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all duration-150 ${
                item.isSpecial
                  ? isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 font-bold'
                    : 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 hover:text-white border border-cyan-800/40'
                  : isActive
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
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
                <div className="min-w-0">
                  <p className="font-medium leading-none truncate">{item.labelKh}</p>
                  <p className="text-[10px] opacity-70 mt-0.5 leading-none truncate">{item.labelEn}</p>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-md shrink-0 ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        <p className="font-medium text-slate-400">SRP Water ERP v1.0</p>
        <p>ប្រព័ន្ធសុវត្ថិភាព ផលិតទឹកបរិសុទ្ធ</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile and tablet < lg) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col flex-shrink-0 select-none">
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

          {/* Drawer Content */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10 shadow-2xl">
            {/* Mobile Header with Logo */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shrink-0">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">រោងចក្រទឹកបរិសុទ្ធ SRP</h3>
                  <p className="text-[10px] text-cyan-400 truncate">គ្រប់គ្រងម៉ឺនុយទាំងអស់</p>
                </div>
              </div>
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
