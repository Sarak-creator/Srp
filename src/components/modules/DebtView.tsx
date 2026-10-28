'use client';

import React, { useState } from 'react';
import { CreditCard, DollarSign, CheckCircle2, History, ArrowDownLeft, Trash2 } from 'lucide-react';
import { Customer, CustomerPayment, PaymentMethod, SystemSettings, UserAccount } from '@/types/water-factory';
import { formatUsd, formatKhr, khrToUsd, usdToKhr } from '@/lib/financial-engine';
import { generateUuid } from '@/lib/supabase-service';

interface DebtViewProps {
  customers: Customer[];
  payments: CustomerPayment[];
  settings: SystemSettings;
  activeUser: UserAccount;
  onRecordPayment: (payment: CustomerPayment) => void;
  onDeletePayment: (paymentId: string) => void;
}

export const DebtView: React.FC<DebtViewProps> = ({
  customers,
  payments,
  settings,
  activeUser,
  onRecordPayment,
  onDeletePayment,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [payAmountUsd, setPayAmountUsd] = useState('');
  const [payAmountKhr, setPayAmountKhr] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash_khr');
  const [notes, setNotes] = useState('');

  // Customers with debt
  const debtorCustomers = customers.filter((c) => c.totalDebtUsd > 0);
  const totalDebtUsd = debtorCustomers.reduce((sum, c) => sum + c.totalDebtUsd, 0);
  const totalDebtKhr = usdToKhr(totalDebtUsd, settings.exchangeRateKhrPerUsd);

  const openPaymentModal = (cust: Customer) => {
    setSelectedCustomer(cust);
    setPayAmountUsd(cust.totalDebtUsd.toString());
    setPayAmountKhr(usdToKhr(cust.totalDebtUsd, settings.exchangeRateKhrPerUsd).toString());
    setPayMethod('cash_khr');
    setNotes('');
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    let usdVal = 0;
    if (payMethod === 'cash_usd') {
      usdVal = parseFloat(payAmountUsd) || 0;
    } else if (payMethod === 'cash_khr') {
      const khrVal = parseFloat(payAmountKhr) || 0;
      usdVal = khrToUsd(khrVal, settings.exchangeRateKhrPerUsd);
    } else if (payMethod === 'khqr') {
      usdVal = parseFloat(payAmountUsd) || 0;
    }

    if (usdVal <= 0) return;

    const payment: CustomerPayment = {
      id: generateUuid(),
      receiptNumber: `PAY-${Date.now().toString().slice(-6)}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.fullName,
      paymentDate: new Date().toISOString(),
      amountPaidUsd: payMethod === 'cash_usd' ? usdVal : 0,
      amountPaidKhr: payMethod === 'cash_khr' ? parseFloat(payAmountKhr) || 0 : 0,
      equivalentUsd: usdVal,
      paymentMethod: payMethod,
      notes: notes.trim() || undefined,
    };

    onRecordPayment(payment);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Total Debt Card */}
      <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              ការគ្រប់គ្រងបំណុល និងការទូទាត់ (Debt & Receivables)
            </h2>
            <p className="text-xs text-rose-300/80 mt-0.5">
              តាមដានវិក្កយបត្រជំពាក់ ទទួលប្រាក់សងបង្គ្រប់ និងកត់ត្រាប្រវត្តិទូទាត់
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            បំណុលជំពាក់សរុបមិនទាន់ប្រមូល
          </span>
          <p className="text-2xl font-extrabold text-rose-400">{formatUsd(totalDebtUsd)}</p>
          <p className="text-xs font-bold text-slate-400 mt-0.5">{formatKhr(totalDebtKhr)}</p>
        </div>
      </div>

      {/* Debtors List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white">
            បញ្ជីអតិថិជនមានសមតុល្យជំពាក់ ({debtorCustomers.length} នាក់)
          </h3>
          <span className="text-[10px] text-slate-400">
            អត្រាប្តូរប្រាក់៖ 1$ = {settings.exchangeRateKhrPerUsd.toLocaleString()} ៛
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">កូដ</th>
                <th className="py-3 px-4">ឈ្មោះអតិថិជន</th>
                <th className="py-3 px-4">លេខទូរស័ព្ទ</th>
                <th className="py-3 px-4">សំបកធុង ២០L ជំពាក់</th>
                <th className="py-3 px-4 text-right">បំណុលជំពាក់ ($)</th>
                <th className="py-3 px-4 text-right">បំណុលជំពាក់ (៛)</th>
                <th className="py-3 px-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {debtorCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-emerald-400 font-medium">
                    ✓ អស្ចារ្យណាស់! គ្មានអតិថិជនណាជំពាក់ប្រាក់ទៀតទេ។
                  </td>
                </tr>
              ) : (
                debtorCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-slate-500">{cust.customerCode}</td>
                    <td className="py-3 px-4 font-bold text-white">{cust.fullName}</td>
                    <td className="py-3 px-4 text-slate-400">{cust.phoneNumber}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[10px]">
                        {cust.emptyContainersHeld} ធុង
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-400">
                      {formatUsd(cust.totalDebtUsd)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {formatKhr(usdToKhr(cust.totalDebtUsd, settings.exchangeRateKhrPerUsd))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openPaymentModal(cust)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow transition active:scale-95"
                      >
                        ទូទាត់សងប្រាក់
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Repayment Logs */}
      {payments.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
          <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-cyan-400" />
            ប្រវត្តិនៃការបង់ប្រាក់សងបង្គ្រប់ (Repayment History)
          </h3>
          <div className="space-y-2">
            {payments.slice(0, 5).map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div>
                  <p className="font-bold text-white">{pay.customerName}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(pay.paymentDate).toLocaleString('km-KH')} • បង់តាម {pay.paymentMethod}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold text-emerald-400">
                      +{formatUsd(pay.equivalentUsd)}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {pay.amountPaidKhr > 0 ? `${pay.amountPaidKhr.toLocaleString()} ៛` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`តើអ្នកពិតជាចង់លុបប្រវត្តិទូទាត់ "${pay.receiptNumber}" នេះមែនទេ?`)) {
                        onDeletePayment(pay.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 transition"
                    title="លុបប្រវត្តិទូទាត់"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleExecutePayment}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              ទទួលប្រាក់សងបំណុល (Record Debt Repayment)
            </h3>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <p className="text-slate-400">អតិថិជន៖ <span className="font-bold text-white">{selectedCustomer.fullName}</span></p>
              <p className="text-slate-400 mt-1">
                បំណុលជំពាក់បច្ចុប្បន្ន៖{' '}
                <span className="font-bold text-rose-400">
                  {formatUsd(selectedCustomer.totalDebtUsd)} ({formatKhr(usdToKhr(selectedCustomer.totalDebtUsd, settings.exchangeRateKhrPerUsd))})
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">វិធីសាស្ត្រទូទាត់</label>
              <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setPayMethod('cash_khr')}
                  className={`py-1.5 px-2 rounded-xl border transition ${
                    payMethod === 'cash_khr'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  លុយរៀល (KHR)
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('cash_usd')}
                  className={`py-1.5 px-2 rounded-xl border transition ${
                    payMethod === 'cash_usd'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  លុយដុល្លារ ($)
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('khqr')}
                  className={`py-1.5 px-2 rounded-xl border transition ${
                    payMethod === 'khqr'
                      ? 'bg-cyan-600 text-white border-cyan-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  KHQR Scan
                </button>
              </div>
            </div>

            {payMethod === 'cash_khr' ? (
              <div>
                <label className="block text-xs text-slate-400 mb-1">ចំនួនទឹកប្រាក់បង់ជារៀល (៛) *</label>
                <input
                  type="number"
                  step="100"
                  required
                  value={payAmountKhr}
                  onChange={(e) => setPayAmountKhr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-slate-400 mb-1">ចំនួនទឹកប្រាក់បង់ជាដុល្លារ ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmountUsd}
                  onChange={(e) => setPayAmountUsd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">សម្គាល់បន្ថែម</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ឧ. បង់ផ្តាច់វិក្កយបត្រចាស់..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30"
              >
                កត់ត្រាការទូទាត់
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
