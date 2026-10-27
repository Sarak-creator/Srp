'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { Order, SystemSettings } from '@/types/water-factory';
import { formatUsd, formatKhr } from '@/lib/financial-engine';

interface ThermalReceiptModalProps {
  order: Order | null;
  settings: SystemSettings;
  customerEmptyBalance?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  settings,
  customerEmptyBalance = 0,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-[420px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Printer className="w-4 h-4" />
            <span>វិក្កយបត្រម៉ាស៊ីនព្រីនកម្តៅ (80mm Thermal Receipt)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex justify-center">
          {/* Physical 80mm Print Paper Simulation */}
          <div
            id="thermal-receipt"
            className="w-[80mm] min-h-[140mm] bg-white text-slate-900 p-4 font-sans text-[11px] leading-tight shadow-md select-text"
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-800">
              <h2 className="text-[14px] font-bold text-slate-900">{settings.factoryNameKh}</h2>
              <p className="text-[10px] text-slate-600 font-medium">{settings.factoryNameEn}</p>
              <p className="text-[10px] mt-1 text-slate-700">ទូរស័ព្ទ៖ {settings.phoneNumber}</p>
              <p className="text-[9px] text-slate-600 leading-snug">{settings.addressKh}</p>
              <div className="mt-2 inline-block px-2 py-0.5 border border-slate-900 font-bold text-[11px] uppercase tracking-wider">
                វិក្កយបត្រ / INVOICE
              </div>
            </div>

            {/* Meta Information */}
            <div className="py-2 border-b border-dashed border-slate-800 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-600">លេខវិក្កយបត្រ:</span>
                <span className="font-bold">{order.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">កាលបរិច្ឆេទ:</span>
                <span>{new Date(order.orderDate).toLocaleString('km-KH')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">អ្នកគិតលុយ:</span>
                <span>{order.cashierName}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                <span className="text-slate-600">អតិថិជន:</span>
                <span className="font-bold">{order.customerName}</span>
              </div>
              {order.customerPhone && order.customerPhone !== '000000000' && (
                <div className="flex justify-between">
                  <span className="text-slate-600">ទូរស័ព្ទ:</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Products List Table */}
            <table className="w-full my-2 text-[10px]">
              <thead>
                <tr className="border-b border-slate-900 text-slate-800">
                  <th className="text-left py-1">ទំនិញ</th>
                  <th className="text-center py-1">ចំនួន</th>
                  <th className="text-right py-1">តម្លៃ ($)</th>
                  <th className="text-right py-1">សរុប ($)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-1 text-left font-medium">{item.productNameKh}</td>
                    <td className="py-1 text-center font-bold">{item.quantity}</td>
                    <td className="py-1 text-right">${item.unitPriceUsd.toFixed(2)}</td>
                    <td className="py-1 text-right font-bold">${item.totalUsd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Dual-Currency */}
            <div className="pt-1 border-t border-dashed border-slate-800 text-[10px] space-y-1">
              <div className="flex justify-between text-slate-700">
                <span>សរុបបឋម (Subtotal):</span>
                <span>${order.subtotalUsd.toFixed(2)}</span>
              </div>
              {order.discountUsd > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>បញ្ចុះតម្លៃ (Discount):</span>
                  <span>-${order.discountUsd.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[12px] font-bold border-t border-slate-300 pt-1">
                <span>សរុបគិតជាដុល្លារ (USD):</span>
                <span>{formatUsd(order.grandTotalUsd)}</span>
              </div>
              <div className="flex justify-between text-[12px] font-bold text-slate-900">
                <span>សរុបគិតជារៀល (KHR):</span>
                <span>{formatKhr(order.grandTotalKhr)}</span>
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 italic">
                <span>អត្រាប្តូរប្រាក់ផ្លូវការ:</span>
                <span>1$ = {order.exchangeRate.toLocaleString()} ៛</span>
              </div>

              {/* Payment Section */}
              <div className="mt-2 pt-1 border-t border-slate-200">
                <div className="flex justify-between text-slate-700">
                  <span>វិធីទូទាត់:</span>
                  <span className="font-semibold uppercase">
                    {order.paymentMethod === 'cash_khr' && 'លុយរៀល (Cash KHR)'}
                    {order.paymentMethod === 'cash_usd' && 'លុយដុល្លារ (Cash USD)'}
                    {order.paymentMethod === 'khqr' && 'ស្កេន KHQR'}
                    {order.paymentMethod === 'credit' && 'ជំពាក់ (Credit)'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>បានទូទាត់ជាក់ស្តែង:</span>
                  <span className="font-bold">
                    ${order.paidAmountUsd.toFixed(2)} {order.paidAmountKhr > 0 ? `+ ${order.paidAmountKhr.toLocaleString()} ៛` : ''}
                  </span>
                </div>
                {order.remainingDebtUsd > 0 && (
                  <div className="flex justify-between bg-slate-100 p-1 rounded font-bold text-slate-900 mt-1">
                    <span>នៅជំពាក់លើវិក្កយបត្រនេះ:</span>
                    <span className="text-red-600">${order.remainingDebtUsd.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 20L Empty Bottle Ledger Section */}
            {(order.containersDelivered20L > 0 || order.containersReturned20L > 0 || customerEmptyBalance > 0) && (
              <div className="my-2 p-1.5 border border-slate-900 rounded bg-slate-50 text-[10px] space-y-0.5">
                <div className="font-bold text-center border-b border-slate-300 pb-0.5 text-slate-900">
                  ចរន្តសំបកធុង ២០លីត្រ (20L BOTTLE LEDGER)
                </div>
                <div className="flex justify-between">
                  <span>ធុងទឹកបានដឹកជញ្ជូន (Delivered):</span>
                  <span className="font-bold">+{order.containersDelivered20L} ធុង</span>
                </div>
                <div className="flex justify-between">
                  <span>សំបកធុងយកត្រឡប់ (Returned):</span>
                  <span className="font-bold">-{order.containersReturned20L} ធុង</span>
                </div>
                <div className="flex justify-between border-t border-slate-300 pt-0.5 font-bold text-[11px] text-slate-900">
                  <span>សំបកធុងនៅជំពាក់សរុប (Total Held):</span>
                  <span className="px-1.5 py-0.2 bg-slate-200 rounded">{customerEmptyBalance} ធុង</span>
                </div>
              </div>
            )}

            {/* Receipt Footer */}
            <div className="text-center pt-2 border-t border-dashed border-slate-800 text-[9px] text-slate-600 space-y-0.5">
              <p>{settings.receiptFooterKh}</p>
              <p className="font-medium text-slate-800">សូមអរគុណ និងសូមជម្រាបលា!</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition"
          >
            បិទផ្ទាំង (Close)
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-600/30 transition transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>ព្រីនវិក្កយបត្រ (Print 80mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
