'use client';

import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Droplets } from 'lucide-react';
import { Product, ContainerUnit, SystemSettings } from '@/types/water-factory';
import { usdToKhr } from '@/lib/financial-engine';

interface ProductsViewProps {
  products: Product[];
  settings: SystemSettings;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  settings,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [nameKh, setNameKh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [productCode, setProductCode] = useState('');
  const [unit, setUnit] = useState<ContainerUnit>('container_20l');
  const [unitCostUsd, setUnitCostUsd] = useState('0.25');
  const [salePriceUsd, setSalePriceUsd] = useState('0.75');
  const [isRefill20l, setIsRefill20l] = useState(true);

  const openCreateModal = () => {
    setEditingProduct(null);
    setNameKh('');
    setNameEn('');
    setProductCode(`W-${Date.now().toString().slice(-4)}`);
    setUnit('container_20l');
    setUnitCostUsd('0.25');
    setSalePriceUsd('0.75');
    setIsRefill20l(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setNameKh(p.nameKh);
    setNameEn(p.nameEn);
    setProductCode(p.productCode);
    setUnit(p.unit);
    setUnitCostUsd(p.unitCostUsd.toString());
    setSalePriceUsd(p.salePriceUsd.toString());
    setIsRefill20l(p.isRefill20l);
    setIsModalOpen(true);
  };

  const handleDelete = (p: Product) => {
    if (confirm(`តើអ្នកពិតជាចង់លុបផលិតផល "${p.nameKh}" មែនទេ?`)) {
      onDeleteProduct(p.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(unitCostUsd) || 0;
    const price = parseFloat(salePriceUsd) || 0;
    const priceKhr = usdToKhr(price, settings.exchangeRateKhrPerUsd);

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      productCode: productCode.trim() || `P-${Date.now().toString().slice(-4)}`,
      nameKh: nameKh.trim(),
      nameEn: nameEn.trim() || nameKh.trim(),
      unit,
      unitCostUsd: cost,
      salePriceUsd: price,
      salePriceKhr: priceKhr,
      isRefill20l,
      isActive: true,
    };

    onSaveProduct(productData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            បញ្ជីផលិតផលទឹកសម្រេច (Finished Bottled Water Registry)
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            គ្រប់គ្រងតែទឹកធុង ២០L និងទឹកដបសម្រេច (គ្មានវត្ថុធាតុដើម)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>បន្ថែមផលិតផលថ្មី</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const marginUsd = product.salePriceUsd - product.unitCostUsd;
          const marginPercent =
            product.salePriceUsd > 0
              ? Math.round((marginUsd / product.salePriceUsd) * 100)
              : 0;

          return (
            <div
              key={product.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-950/70 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                      title="កែប្រែផលិតផល"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 transition"
                      title="លុបផលិតផល"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {product.productCode}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{product.nameKh}</h3>
                  <p className="text-[11px] text-slate-400">{product.nameEn}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">ថ្លៃដើមផលិត (Unit Cost):</span>
                  <span className="font-semibold text-slate-300">
                    ${product.unitCostUsd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">តម្លៃលក់ចេញ (Sale Price):</span>
                  <span className="font-bold text-cyan-300">
                    ${product.salePriceUsd.toFixed(2)} ({product.salePriceKhr.toLocaleString()} ៛)
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-[11px]">
                  <span className="text-slate-500">ចំណេញដុល (Gross Margin):</span>
                  <span className="font-bold text-emerald-400">
                    +${marginUsd.toFixed(2)} ({marginPercent}%)
                  </span>
                </div>

                {product.isRefill20l && (
                  <div className="mt-2 text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-1 rounded-lg text-center font-semibold">
                    ✓ ភ្ជាប់ការតាមដានសំបកធុង ២០លីត្រ
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">
              {editingProduct ? 'កែប្រែផលិតផលទឹក' : 'បន្ថែមផលិតផលទឹកសម្រេចថ្មី'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">កូដផលិតផល *</label>
                <input
                  type="text"
                  required
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">ប្រភេទកញ្ចប់/ធុង *</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as ContainerUnit)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="container_20l">ធុង ២០លីត្រ (20L Container)</option>
                  <option value="pack_350ml">យួរ ៣៥០មល (24 ដប)</option>
                  <option value="pack_500ml">យួរ ៥០០មល (24 ដប)</option>
                  <option value="pack_1500ml">យួរ ១៥០០មល (12 ដប)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">ឈ្មោះជាភាសាខ្មែរ *</label>
              <input
                type="text"
                required
                value={nameKh}
                onChange={(e) => setNameKh(e.target.value)}
                placeholder="ឧ. ទឹកធុង ២០លីត្រ (ប្តូរសំបក)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">ឈ្មោះជាអង់គ្លេស</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="ឧ. 20L Water Refill"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">ថ្លៃដើមផលិត Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={unitCostUsd}
                  onChange={(e) => setUnitCostUsd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">តម្លៃលក់ចេញ Sale Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={salePriceUsd}
                  onChange={(e) => setSalePriceUsd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isRefill20l}
                onChange={(e) => setIsRefill20l(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-950 border-slate-700"
              />
              <span>តាមដានការប្តូរសំបកធុង ២០លីត្រ ជាមួយអតិថិជន</span>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
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
                រក្សាទុកផលិតផល
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
