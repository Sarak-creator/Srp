'use client';

import React, { useState } from 'react';
import { Search, Printer, Ban, Receipt, CheckCircle, Clock } from 'lucide-react';
import { Order, SystemSettings } from '@/types/water-factory';
import { formatUsd, formatKhr } from '@/lib/financial-engine';
import { ThermalReceiptModal } from '../pos/ThermalReceiptModal';

interface OrderHistoryViewProps {
  orders: Order[];
  settings: SystemSettings;
  onCancelOrder: (orderId: string) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  settings,
  onCancelOrder,
}) => {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const filteredOrders = orders.filter(
    (o) =>
      o.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search)
  );

  const handlePrintOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Search & Stats Bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ ឬឈ្មោះអតិថិជន..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>សរុបវិក្កយបត្រ៖</span>
          <span className="font-bold text-white px-2 py-0.5 bg-slate-800 rounded-lg">
            {filteredOrders.length}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">លេខវិក្កយបត្រ</th>
                <th className="py-3 px-4">កាលបរិច្ឆេទ</th>
                <th className="py-3 px-4">អតិថិជន</th>
                <th className="py-3 px-4">មុខទំនិញ</th>
                <th className="py-3 px-4 text-center">សំបកធុង ២០L</th>
                <th className="py-3 px-4 text-right">សរុប ($ / ៛)</th>
                <th className="py-3 px-4 text-center">ស្ថានភាពទូទាត់</th>
                <th className="py-3 px-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    មិនមានទិន្នន័យវិក្កយបត្រត្រូវនឹងការស្វែងរកទេ។
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isCancelled = order.status === 'cancelled';
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isCancelled ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-cyan-400">
                        {order.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(order.orderDate).toLocaleString('km-KH', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {order.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {order.items.map((i) => `${i.productNameKh} (×${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-[10px]">
                          +{order.containersDelivered20L} / -{order.containersReturned20L}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="font-bold text-white">{formatUsd(order.grandTotalUsd)}</p>
                        <p className="text-[10px] text-slate-400">{formatKhr(order.grandTotalKhr)}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : order.paymentStatus === 'partial'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {order.paymentStatus === 'paid'
                            ? 'បានទូទាត់'
                            : order.paymentStatus === 'partial'
                            ? 'ទូទាត់ខ្លះ'
                            : 'ជំពាក់'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePrintOrder(order)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition"
                            title="ព្រីនវិក្កយបត្រឡើងវិញ (Reprint)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {!isCancelled && (
                            <button
                              onClick={() => onCancelOrder(order.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
                              title="លុបចោលវិក្កយបត្រ (Cancel)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reprint Thermal Receipt Modal */}
      <ThermalReceiptModal
        order={selectedOrder}
        settings={settings}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};
