'use client';

import React, { useState } from 'react';
import { AlertTriangle, Plus, Trash2, ArrowDownRight } from 'lucide-react';
import { BrokenProduct, Product, DamageReason, UserAccount } from '@/types/water-factory';
import { formatUsd, calculateBrokenLoss } from '@/lib/financial-engine';

interface BrokenProductsViewProps {
  brokenProducts: BrokenProduct[];
  products: Product[];
  activeUser: UserAccount;
  onAddBroken: (record: BrokenProduct) => void;
  onDeleteBroken: (id: string) => void;
}

export const BrokenProductsView: React.FC<BrokenProductsViewProps> = ({
  brokenProducts,
  products,
  activeUser,
  onAddBroken,
  onDeleteBroken,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState<DamageReason>('delivery_leak');
  const [notes, setNotes] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const numQty = parseInt(quantity, 10) || 0;
  const estimatedLossUsd = selectedProduct
    ? calculateBrokenLoss(numQty, selectedProduct.unitCostUsd)
    : 0;

  const totalLossAllUsd = brokenProducts.reduce((sum, b) => sum + b.totalLossUsd, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || numQty <= 0) return;

    const newRecord: BrokenProduct = {
      id: `brk-${Date.now()}`,
      incidentDate: new Date().toISOString().split('T')[0],
      productId: selectedProduct.id,
      productNameKh: selectedProduct.nameKh,
      quantity: numQty,
      unitCostUsd: selectedProduct.unitCostUsd,
      totalLossUsd: estimatedLossUsd,
      reason,
      reportedBy: activeUser.fullName,
      notes: notes.trim() || undefined,
    };

    onAddBroken(newRecord);
    setIsModalOpen(false);
    setQuantity('1');
    setNotes('');
  };

  const reasonLabels: Record<DamageReason, string> = {
    delivery_leak: 'បែកធ្លាយពេលដឹកជញ្ជូន (Delivery Leak)',
    factory_defect: 'កំហុសបច្ចេកទេសក្នុងរោងចក្រ (Factory Defect)',
    loading_crack: 'ប្រេះស្រាំពេលលើកដាក់ (Loading Crack)',
    customer_return: 'អតិថិជនប្តូរវិញដោយសារធ្លាយ (Customer Return)',
  };

  return (
    <div className="space-y-4">
      {/* Loss Summary Banner */}
      <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              ការខូចខាតបែកបាក់ទំនិញ (Direct Operational Loss)
            </h2>
            <p className="text-xs text-amber-300/80 mt-0.5">
              គណនាជាការខាតបង់ផ្ទាល់ (ចំនួន × ថ្លៃដើមផលិត) និងកាត់កងចេញពីប្រាក់ចំណេញសុទ្ធ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              ការខាតបង់សរុប (Total Broken Loss)
            </span>
            <p className="text-2xl font-extrabold text-amber-400">
              {formatUsd(totalLossAllUsd)}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>កត់ត្រាការបែកបាក់</span>
          </button>
        </div>
      </div>

      {/* Broken Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">កាលបរិច្ឆេទ</th>
                <th className="py-3 px-4">មុខទំនិញ</th>
                <th className="py-3 px-4 text-center">ចំនួនខូចខាត</th>
                <th className="py-3 px-4 text-right">ថ្លៃដើម/ឯកតា</th>
                <th className="py-3 px-4 text-right">ទឹកប្រាក់ខាតបង់ ($)</th>
                <th className="py-3 px-4">មូលហេតុ</th>
                <th className="py-3 px-4">អ្នករាយការណ៍</th>
                <th className="py-3 px-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {brokenProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    មិនមានទិន្នន័យខូចខាតបែកបាក់ទំនិញទេ។
                  </td>
                </tr>
              ) : (
                brokenProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400">{item.incidentDate}</td>
                    <td className="py-3 px-4 font-bold text-white">{item.productNameKh}</td>
                    <td className="py-3 px-4 text-center font-bold text-amber-400">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      ${item.unitCostUsd.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-amber-400">
                      -${item.totalLossUsd.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{reasonLabels[item.reason]}</td>
                    <td className="py-3 px-4 text-slate-400">{item.reportedBy}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`តើអ្នកពិតជាចង់លុបកំណត់ត្រាខូចខាត "${item.productNameKh}" ចំនួន ${item.quantity} នេះមែនទេ?`)) {
                            onDeleteBroken(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 transition"
                        title="លុបកំណត់ត្រាបែកបាក់"
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

      {/* Log Broken Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              កត់ត្រាការបែកបាក់ខូចខាតទំនិញ
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">ជ្រើសរើសមុខទំនិញ *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameKh} (ថ្លៃដើម: ${p.unitCostUsd.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">ចំនួនខូចខាត (Qty) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">ទឹកប្រាក់ខាតបង់ប៉ាន់ស្មាន</label>
                <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-400">
                  {formatUsd(estimatedLossUsd)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">មូលហេតុនៃការខូចខាត *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as DamageReason)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="delivery_leak">បែកធ្លាយពេលដឹកជញ្ជូន (Delivery Leak)</option>
                <option value="factory_defect">កំហុសបច្ចេកទេសក្នុងរោងចក្រ (Factory Defect)</option>
                <option value="loading_crack">ប្រេះស្រាំពេលលើកដាក់ (Loading Crack)</option>
                <option value="customer_return">អតិថិជនប្តូរវិញដោយសារធ្លាយ (Customer Return)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">កំណត់ចំណាំបន្ថែម</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ឧ. ធ្លាក់ពីលើឡានពេលបើកបរ..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
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
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-600/30"
              >
                រក្សាទុកការខូចខាត
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
