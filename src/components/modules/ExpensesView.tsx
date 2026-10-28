'use client';

import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, Zap, Fuel, UserCheck, Wrench, FileText } from 'lucide-react';
import { OperationalExpense, ExpenseCategory, SystemSettings, UserAccount } from '@/types/water-factory';
import { formatUsd, formatKhr, khrToUsd, usdToKhr } from '@/lib/financial-engine';
import { generateUuid } from '@/lib/supabase-service';

interface ExpensesViewProps {
  expenses: OperationalExpense[];
  settings: SystemSettings;
  activeUser: UserAccount;
  onAddExpense: (expense: OperationalExpense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  settings,
  activeUser,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('electricity');
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD');
  const [amountInput, setAmountInput] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [notes, setNotes] = useState('');

  const totalExpensesUsd = expenses.reduce((sum, e) => sum + e.totalEquivalentUsd, 0);

  const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
    electricity: <Zap className="w-4 h-4 text-amber-400" />,
    fuel: <Fuel className="w-4 h-4 text-cyan-400" />,
    salary: <UserCheck className="w-4 h-4 text-emerald-400" />,
    maintenance: <Wrench className="w-4 h-4 text-rose-400" />,
    misc: <FileText className="w-4 h-4 text-slate-400" />,
  };

  const categoryLabels: Record<ExpenseCategory, string> = {
    electricity: 'ថ្លៃអគ្គិសនី (Electricity/EDC)',
    fuel: 'ប្រេងឥន្ធនៈឡានដឹក (Fuel)',
    salary: 'ប្រាក់ឈ្នួលកម្មករ/តៃកុង (Wages)',
    maintenance: 'ថែទាំ/ជួសជុលម៉ាស៊ីន (Maintenance)',
    misc: 'ចំណាយផ្សេងៗ (Misc)',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput) || 0;
    if (val <= 0 || !title.trim()) return;

    let amountUsd = 0;
    let amountKhr = 0;
    let totalEquivalentUsd = 0;

    if (currency === 'USD') {
      amountUsd = val;
      amountKhr = usdToKhr(val, settings.exchangeRateKhrPerUsd);
      totalEquivalentUsd = val;
    } else {
      amountKhr = val;
      amountUsd = khrToUsd(val, settings.exchangeRateKhrPerUsd);
      totalEquivalentUsd = amountUsd;
    }

    const newExpense: OperationalExpense = {
      id: generateUuid(),
      expenseDate: new Date().toISOString().split('T')[0],
      category,
      title: title.trim(),
      amountUsd,
      amountKhr,
      totalEquivalentUsd,
      paidTo: paidTo.trim() || undefined,
      approvedBy: activeUser.fullName,
      notes: notes.trim() || undefined,
    };

    onAddExpense(newExpense);
    setIsModalOpen(false);
    setTitle('');
    setAmountInput('');
    setPaidTo('');
    setNotes('');
  };

  return (
    <div className="space-y-4">
      {/* Expenses Summary Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            ការចំណាយប្រតិបត្តិការរោងចក្រ (Operational Expenses)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ថ្លៃភ្លើង EDC, ប្រេងឡាន, ថ្លៃឈ្នួល និងការថែទាំប្រព័ន្ធចម្រោះ
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              ចំណាយប្រតិបត្តិការសរុប
            </span>
            <p className="text-2xl font-extrabold text-rose-400">{formatUsd(totalExpensesUsd)}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>កត់ត្រាចំណាយថ្មី</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">កាលបរិច្ឆេទ</th>
                <th className="py-3 px-4">ចំណាត់ថ្នាក់</th>
                <th className="py-3 px-4">បរិយាយចំណាយ</th>
                <th className="py-3 px-4">បង់ជូនទៅ</th>
                <th className="py-3 px-4 text-right">ទឹកប្រាក់ ($ / ៛)</th>
                <th className="py-3 px-4">អនុម័តដោយ</th>
                <th className="py-3 px-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    មិនទាន់មានការកត់ត្រាចំណាយនៅឡើយទេ។
                  </td>
                </tr>
              ) : (
                expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400">{item.expenseDate}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {categoryIcons[item.category]}
                        <span className="font-medium text-white">
                          {categoryLabels[item.category].split(' ')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{item.title}</td>
                    <td className="py-3 px-4 text-slate-400">{item.paidTo || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-rose-400">
                        -{formatUsd(item.totalEquivalentUsd)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {formatKhr(item.amountKhr)}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.approvedBy}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`តើអ្នកពិតជាចង់លុបចំណាយ "${item.title}" នេះមែនទេ?`)) {
                            onDeleteExpense(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 transition"
                        title="លុបកំណត់ត្រាចំណាយ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              កត់ត្រាចំណាយប្រតិបត្តិការថ្មី
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">ចំណាត់ថ្នាក់ចំណាយ *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="electricity">ថ្លៃអគ្គិសនី (Electricity/EDC)</option>
                <option value="fuel">ប្រេងឥន្ធនៈឡានដឹក (Fuel)</option>
                <option value="salary">ប្រាក់ឈ្នួលកម្មករ/តៃកុង (Wages)</option>
                <option value="maintenance">ថែទាំ/ជួសជុលម៉ាស៊ីន (Maintenance)</option>
                <option value="misc">ចំណាយផ្សេងៗ (Misc)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">បរិយាយចំណាយ *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ឧ. ថ្លៃភ្លើងប្រចាំខែមីនា ឬ ប្រេងឡាន..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-xs text-slate-400 mb-1">រូបិយប័ណ្ណ</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'USD' | 'KHR')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                >
                  <option value="USD">ដុល្លារ ($)</option>
                  <option value="KHR">រៀល (៛)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">ចំនួនទឹកប្រាក់ *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder={currency === 'USD' ? 'ឧ. 45.00' : 'ឧ. 180000'}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">បង់ជូនទៅ (អ្នកទទួល)</label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="ឧ. EDC, ស្ថានីយ៍ប្រេង តេលា..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-600/30"
              >
                រក្សាទុកចំណាយ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
