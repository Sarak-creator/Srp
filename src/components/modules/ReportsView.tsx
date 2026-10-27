'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Calendar,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
} from 'lucide-react';
import {
  Order,
  OperationalExpense,
  BrokenProduct,
  Customer,
  SystemSettings,
} from '@/types/water-factory';
import {
  computeFinancialReport,
  formatUsd,
  formatKhr,
} from '@/lib/financial-engine';

interface ReportsViewProps {
  orders: Order[];
  expenses: OperationalExpense[];
  brokenProducts: BrokenProduct[];
  customers: Customer[];
  settings: SystemSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  expenses,
  brokenProducts,
  customers,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'pnl' | 'bottles' | 'debt'>('pnl');

  const financial = computeFinancialReport(
    orders,
    expenses,
    brokenProducts,
    customers,
    settings.exchangeRateKhrPerUsd
  );

  // Top empty container holders
  const topBottleHolders = [...customers]
    .filter((c) => c.emptyContainersHeld > 0)
    .sort((a, b) => b.emptyContainersHeld - a.emptyContainersHeld);

  // Top Debtors
  const topDebtors = [...customers]
    .filter((c) => c.totalDebtUsd > 0)
    .sort((a, b) => b.totalDebtUsd - a.totalDebtUsd);

  return (
    <div className="space-y-6">
      {/* Report Header Bar */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            របាយការណ៍ហិរញ្ញវត្ថុ និងផ្ទៀងផ្ទាត់សំបកធុង (Financial & Bottle Reports)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            វិភាគលម្អិតអំពីប្រាក់ចំណេញសុទ្ធពិតប្រាកដ បំណុលជំពាក់ និងចរន្តសំបកធុង ២០លីត្រ
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pnl')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'pnl' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ចំណេញ/ខាត (P&L)
          </button>
          <button
            onClick={() => setActiveTab('bottles')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'bottles'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            សំបកធុង ២០L
          </button>
          <button
            onClick={() => setActiveTab('debt')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'debt' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            បំណុលជំពាក់
          </button>
        </div>
      </div>

      {/* TAB 1: P&L Statement (របាយការណ៍ចំណេញ/ខាតពិតប្រាកដ) */}
      {activeTab === 'pnl' && (
        <div className="space-y-4">
          {/* Executive Net Profit Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  របាយការណ៍លទ្ធផលហិរញ្ញវត្ថុរួម (FINANCIAL SUMMARY)
                </span>
                <p className="text-3xl font-black text-white mt-2">
                  {formatUsd(financial.netProfitUsd)}
                </p>
                <p className="text-base font-bold text-emerald-400 mt-1">
                  {formatKhr(financial.netProfitKhr)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  អត្រាចំណេញសុទ្ធលើចំណូល (Net Margin)៖{' '}
                  <span className="font-bold text-white">{financial.profitMarginPercent}%</span>
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs min-w-[280px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">ចំណូលលក់ដុល (Gross Sales):</span>
                  <span className="font-bold text-white">{formatUsd(financial.totalGrossSalesUsd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">(-) ចំណាយប្រតិបត្តិការ:</span>
                  <span className="font-semibold text-rose-400">
                    -{formatUsd(financial.totalOperationalExpensesUsd)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">(-) ខូចខាតបែកបាក់ទំនិញ:</span>
                  <span className="font-semibold text-amber-400">
                    -{formatUsd(financial.totalBrokenLossUsd)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                  <span className="text-cyan-400">ចំណេញសុទ្ធ (Net Profit):</span>
                  <span className="text-emerald-400">{formatUsd(financial.netProfitUsd)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Items Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">
              ការបែងចែកសមាសធាតុចំណាយ និងការខាតបង់
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Operational Expenses Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-rose-400" />
                  ចំណាយប្រតិបត្តិការតាមប្រភេទ (By Category)
                </h4>
                <div className="space-y-2">
                  {expenses.map((e) => (
                    <div key={e.id} className="flex justify-between items-center text-slate-400">
                      <span>{e.title}</span>
                      <span className="font-bold text-rose-400">
                        ${e.totalEquivalentUsd.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Broken Products Loss Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ការខូចខាតបែកបាក់ទំនិញ (By Incident)
                </h4>
                <div className="space-y-2">
                  {brokenProducts.map((b) => (
                    <div key={b.id} className="flex justify-between items-center text-slate-400">
                      <span>
                        {b.productNameKh} (×{b.quantity})
                      </span>
                      <span className="font-bold text-amber-400">-${b.totalLossUsd.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Empty 20L Bottle Reconciliation (ផ្ទៀងផ្ទាត់សំបកធុង ២០លីត្រ) */}
      {activeTab === 'bottles' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-cyan-950/20 border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                ស្ថានភាពសំបកធុង ២០លីត្រ សរុបនៅអតិថិជន
              </h3>
              <p className="text-xs text-cyan-300/80 mt-0.5">
                តាមដានការបាត់បង់សំបកធុង និងធានាថាអតិថិជនមានការប្រគល់សំបកមកវិញទៀងទាត់
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                សំបកធុងកំពុងជំពាក់សរុប
              </span>
              <p className="text-3xl font-extrabold text-cyan-300">
                {financial.totalEmptyBottlesWithCustomers}{' '}
                <span className="text-sm font-normal text-slate-400">ធុង</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 font-bold text-xs text-white">
              តារាងអតិថិជនដែលកំពុងកាន់កាប់សំបកធុង ២០លីត្រ ({topBottleHolders.length} កន្លែង)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">កូដ</th>
                    <th className="py-3 px-4">ឈ្មោះអតិថិជន</th>
                    <th className="py-3 px-4">លេខទូរស័ព្ទ</th>
                    <th className="py-3 px-4">អាសយដ្ឋានដឹកជញ្ជូន</th>
                    <th className="py-3 px-4 text-right">ចំនួនសំបកធុងកាន់កាប់</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {topBottleHolders.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-500 font-bold">{c.customerCode}</td>
                      <td className="py-3 px-4 font-bold text-white">{c.fullName}</td>
                      <td className="py-3 px-4 text-slate-400">{c.phoneNumber}</td>
                      <td className="py-3 px-4 text-slate-400">{c.deliveryAddress}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-extrabold text-cyan-300 text-sm px-2.5 py-1 rounded-xl bg-cyan-950 border border-cyan-800/50">
                          {c.emptyContainersHeld} ធុង
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Customer Debt Aging (របាយការណ៍បំណុលជំពាក់) */}
      {activeTab === 'debt' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-rose-400" />
                របាយការណ៍បំណុលជំពាក់សរុប (Receivables Aging)
              </h3>
              <p className="text-xs text-rose-300/80 mt-0.5">
                តាមដានការជំពាក់ប្រាក់ថ្លៃទឹក និងរំលឹកការទូទាត់
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                បំណុលមិនទាន់ប្រមូល
              </span>
              <p className="text-3xl font-extrabold text-rose-400">
                {formatUsd(financial.totalOutstandingDebtUsd)}
              </p>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                {formatKhr(financial.totalOutstandingDebtUsd * settings.exchangeRateKhrPerUsd)}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 font-bold text-xs text-white">
              តារាងអតិថិជនជំពាក់ប្រាក់ថ្លៃទឹក ({topDebtors.length} នាក់)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">កូដ</th>
                    <th className="py-3 px-4">ឈ្មោះអតិថិជន</th>
                    <th className="py-3 px-4">លេខទូរស័ព្ទ</th>
                    <th className="py-3 px-4 text-right">ទឹកប្រាក់ជំពាក់ ($)</th>
                    <th className="py-3 px-4 text-right">ទឹកប្រាក់ជំពាក់ (៛)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {topDebtors.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-500 font-bold">{c.customerCode}</td>
                      <td className="py-3 px-4 font-bold text-white">{c.fullName}</td>
                      <td className="py-3 px-4 text-slate-400">{c.phoneNumber}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-rose-400 text-sm">
                        {formatUsd(c.totalDebtUsd)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {formatKhr(c.totalDebtUsd * settings.exchangeRateKhrPerUsd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
