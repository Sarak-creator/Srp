'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  AlertTriangle,
  Receipt,
  Users,
} from 'lucide-react';
import {
  Order,
  Customer,
  OperationalExpense,
  BrokenProduct,
  SystemSettings,
} from '@/types/water-factory';
import {
  computeFinancialReport,
  formatUsd,
  formatKhr,
} from '@/lib/financial-engine';
import { ActiveModule } from '../layout/Sidebar';

interface DashboardViewProps {
  orders: Order[];
  customers: Customer[];
  expenses: OperationalExpense[];
  brokenProducts: BrokenProduct[];
  settings: SystemSettings;
  onNavigate: (module: ActiveModule) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  customers,
  expenses,
  brokenProducts,
  settings,
  onNavigate,
}) => {
  const financial = computeFinancialReport(
    orders,
    expenses,
    brokenProducts,
    customers,
    settings.exchangeRateKhrPerUsd
  );

  // Today's orders
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.orderDate.startsWith(todayStr));
  const todayRevenueUsd = todayOrders.reduce((sum, o) => sum + o.grandTotalUsd, 0);
  const todayRevenueKhr = todayOrders.reduce((sum, o) => sum + o.grandTotalKhr, 0);

  // Recent 5 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            ស្ថានភាពប្រតិបត្តិការរោងចក្រទឹក • Live Operational Overview
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-2">
            សួស្តី! សូមស្វាគមន៍មកកាន់ {settings.factoryNameKh}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            អត្រាប្តូរប្រាក់ថ្ងៃនេះ៖ 1$ = {settings.exchangeRateKhrPerUsd.toLocaleString()} ៛ • ប្រព័ន្ធគណនេយ្យហិរញ្ញវត្ថុ និងសំបកធុងស្វ័យប្រវត្តិ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition transform active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>បើកកន្លែងលក់ POS</span>
          </button>
        </div>
      </div>

      {/* 4 High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">ចំណូលថ្ងៃនេះ (Today's Sales)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-white">{formatUsd(todayRevenueUsd)}</p>
            <p className="text-xs font-bold text-emerald-400 mt-0.5">{formatKhr(todayRevenueKhr)}</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>ចំនួនវិក្កយបត្រ៖</span>
            <span className="font-bold text-slate-300">{todayOrders.length} ច្បាប់</span>
          </div>
        </div>

        {/* Metric 2: Uncollected Customer Debt */}
        <div
          onClick={() => onNavigate('debt')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-900/50 cursor-pointer transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">បំណុលជំពាក់ (Uncollected Debt)</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-rose-400">
              {formatUsd(financial.totalOutstandingDebtUsd)}
            </p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              {formatKhr(financial.totalOutstandingDebtUsd * settings.exchangeRateKhrPerUsd)}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>អតិថិជនជំពាក់៖</span>
            <span className="font-bold text-rose-400">
              {customers.filter((c) => c.totalDebtUsd > 0).length} នាក់
            </span>
          </div>
        </div>

        {/* Metric 3: Total Empty 20L Containers with Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-800/50 cursor-pointer transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">សំបកធុង ២០L នៅអតិថិជន</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-cyan-300">
              {financial.totalEmptyBottlesWithCustomers}
              <span className="text-sm font-normal text-slate-400 ml-1.5">ធុង</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              សំបកធុង ២០លីត្រ កំពុងជំពាក់
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>ចំនួនអ្នកកាន់ធុង៖</span>
            <span className="font-bold text-cyan-400">
              {customers.filter((c) => c.emptyContainersHeld > 0).length} កន្លែង
            </span>
          </div>
        </div>

        {/* Metric 4: Month-to-Date Net Profit */}
        <div
          onClick={() => onNavigate('reports')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-800/50 cursor-pointer transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">ចំណេញសុទ្ធ (Net Profit)</span>
            <div className={`p-2 rounded-xl ${financial.netProfitUsd >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl font-extrabold ${financial.netProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatUsd(financial.netProfitUsd)}
            </p>
            <p className="text-xs font-bold text-slate-300 mt-0.5">
              {formatKhr(financial.netProfitKhr)}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>កម្រិតចំណេញ (Margin):</span>
            <span className="font-bold text-emerald-400">{financial.profitMarginPercent}%</span>
          </div>
        </div>
      </div>

      {/* Financial Breakdown Section (Strict Formula) */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              រូបមន្តហិរញ្ញវត្ថុជាក់ស្តែង (Factory Financial Breakdown Model)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ចំណេញសុទ្ធ = ចំណូលសរុប - (ចំណាយប្រតិបត្តិការទូទៅ + ការខូចខាតបែកបាក់ទំនិញ)
            </p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            មើលរបាយការណ៍លម្អិត &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400">
              <span>១. ចំណូលលក់សរុប (Gross Sales)</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-white mt-2">
              {formatUsd(financial.totalGrossSalesUsd)}
            </p>
            <p className="text-[11px] text-slate-400">{formatKhr(financial.totalGrossSalesKhr)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400">
              <span>២. ចំណាយប្រតិបត្តិការ (Expenses)</span>
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-lg font-bold text-rose-400 mt-2">
              -{formatUsd(financial.totalOperationalExpensesUsd)}
            </p>
            <p className="text-[11px] text-slate-400">ភ្លើង, ប្រេង, ប្រាក់ឈ្នួល, ថែទាំ</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400">
              <span>៣. ខូចខាតបែកបាក់ (Broken Loss)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-lg font-bold text-amber-400 mt-2">
              -{formatUsd(financial.totalBrokenLossUsd)}
            </p>
            <p className="text-[11px] text-slate-400">កាត់កងចូលជាការខាតផ្ទាល់</p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40">
            <div className="flex items-center justify-between text-cyan-300">
              <span>៤. ចំណេញសុទ្ធពិត (Net Profit)</span>
              <span className="font-bold text-cyan-400">= សុទ្ធ</span>
            </div>
            <p className="text-lg font-bold text-cyan-300 mt-2">
              {formatUsd(financial.netProfitUsd)}
            </p>
            <p className="text-[11px] text-cyan-400/80">{formatKhr(financial.netProfitKhr)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Shortcuts */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
          <h3 className="text-sm font-bold text-white mb-2">សកម្មភាពរហ័ស (Quick Actions)</h3>
          
          <button
            onClick={() => onNavigate('pos')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 transition text-xs font-semibold"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              <span>កត់ត្រាការលក់ថ្មី (New POS Sale)</span>
            </div>
            <span>&rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('broken')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition text-xs font-semibold"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>កត់ត្រាធុងបែក/ធ្លាយ (Log Broken Containers)</span>
            </div>
            <span>&rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('expenses')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition text-xs font-semibold"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>កត់ត្រាចំណាយប្រចាំថ្ងៃ (Add Daily Expense)</span>
            </div>
            <span>&rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('customers')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition text-xs font-semibold"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>តាមដានសំបកធុងអតិថិជន (Bottle Reconciliation)</span>
            </div>
            <span>&rarr;</span>
          </button>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyan-400" />
              វិក្កយបត្រថ្មីៗ (Recent Transactions)
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              មើលទាំងអស់ &rarr;
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              មិនទាន់មានវិក្កយបត្រលក់នៅឡើយទេ។ សូមចុច "បើកកន្លែងលក់ POS" ដើម្បីចាប់ផ្តើម។
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center font-bold text-[10px] text-cyan-400">
                      #{order.invoiceNumber.slice(-3)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(order.orderDate).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })} • {order.items.length} មុខទំនិញ
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-white">{formatUsd(order.grandTotalUsd)}</p>
                    <span
                      className={`inline-block px-2 py-0.2 rounded-full text-[9px] font-semibold ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : order.paymentStatus === 'partial'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {order.paymentStatus === 'paid' ? 'បានទូទាត់' : order.paymentStatus === 'partial' ? 'ទូទាត់ខ្លះ' : 'នៅជំពាក់'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
