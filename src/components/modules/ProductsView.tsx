'use client';

import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Droplets, Tag, Layers, Boxes, Barcode, Check } from 'lucide-react';
import { Product, ContainerUnit, ContainerUnitItem, SystemSettings } from '@/types/water-factory';
import { formatCurrency, formatKhr, khrToUsd } from '@/lib/financial-engine';
import { generateUuid } from '@/lib/supabase-service';
import { ContainerUnitsModal } from './ContainerUnitsModal';
import { ProductVisual } from '@/components/common/ProductVisual';

interface ProductsViewProps {
  products: Product[];
  settings: SystemSettings;
  containerUnits?: ContainerUnitItem[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onSaveContainerUnit?: (unit: ContainerUnitItem) => Promise<boolean | ContainerUnitItem | null>;
  onDeleteContainerUnit?: (id: string) => Promise<boolean>;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  settings,
  containerUnits = [],
  onSaveProduct,
  onDeleteProduct,
  onSaveContainerUnit,
  onDeleteContainerUnit,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State - Prices in Khmer Riel (៛)
  const [nameKh, setNameKh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [productCode, setProductCode] = useState('');
  const [unit, setUnit] = useState<ContainerUnit>('container_20l');
  const [retailPriceKhr, setRetailPriceKhr] = useState('3000');
  const [wholesalePriceKhr, setWholesalePriceKhr] = useState('2500');
  const [isRefill20l, setIsRefill20l] = useState(true);

  const openCreateModal = () => {
    setEditingProduct(null);
    setNameKh('');
    setNameEn('');
    setProductCode(`W-${Date.now().toString().slice(-4)}`);
    const defaultUnit = containerUnits.find((u) => u.isDefault)?.code || containerUnits[0]?.code || 'container_20l';
    setUnit(defaultUnit);
    setRetailPriceKhr('3000');
    setWholesalePriceKhr('2500');
    setIsRefill20l(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setNameKh(p.nameKh);
    setNameEn(p.nameEn);
    setProductCode(p.productCode);
    setUnit(p.unit);
    setRetailPriceKhr((p.retailPriceKhr || p.salePriceKhr || 0).toString());
    setWholesalePriceKhr((p.wholesalePriceKhr || 0).toString());
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
    const retailKhr = Math.round(parseFloat(retailPriceKhr) || 0);
    const wholesaleKhr = Math.round(parseFloat(wholesalePriceKhr) || 0);
    const retailUsd = khrToUsd(retailKhr, settings.exchangeRateKhrPerUsd);
    const wholesaleUsd = khrToUsd(wholesaleKhr, settings.exchangeRateKhrPerUsd);

    const productData: Product = {
      id: editingProduct ? editingProduct.id : generateUuid(),
      productCode: productCode.trim() || `P-${Date.now().toString().slice(-4)}`,
      nameKh: nameKh.trim(),
      nameEn: nameEn.trim() || nameKh.trim(),
      unit,
      retailPriceKhr: retailKhr,
      wholesalePriceKhr: wholesaleKhr,
      retailPriceUsd: retailUsd,
      wholesalePriceUsd: wholesaleUsd,
      salePriceKhr: retailKhr,
      salePriceUsd: retailUsd,
      unitCostUsd: 0,
      isRefill20l,
      isActive: true,
    };

    onSaveProduct(productData);
    setIsModalOpen(false);
  };

  const getUnitLabel = (u: ContainerUnit) => {
    const found = containerUnits.find((item) => item.code === u);
    if (found) return found.nameKh;
    switch (u) {
      case 'container_20l':
        return 'ធុង ២០លីត្រ';
      case 'pack_350ml':
        return 'យួរ ៣៥០មល (២៤ដប)';
      case 'pack_500ml':
        return 'យួរ ៥០០មល (២៤ដប)';
      case 'pack_1500ml':
        return 'យួរ ១៥០០មល (១២ដប)';
      case 'bottle_custom':
        return 'ដប/កញ្ចប់ផ្សេងៗ';
      default:
        return u;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            បញ្ជីផលិតផលទឹកសម្រេច (Finished Bottled Water Registry)
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            គ្រប់គ្រងតម្លៃរាយ និងតម្លៃដុំ គិតជារៀល (៛) សម្រាប់ទឹកធុង ២០L និងទឹកដបសម្រេច
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onSaveContainerUnit && (
            <button
              onClick={() => setIsUnitsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 shadow-sm transition active:scale-95"
            >
              <Boxes className="w-4 h-4 text-cyan-400" />
              <span>គ្រប់គ្រងឯកតា (Units)</span>
            </button>
          )}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែមផលិតផលថ្មី</span>
          </button>
        </div>
      </div>

      {/* Products Grid - MyPOS Inspired Product Showcase Cards (Adaptive Multi-Screen & Strict Uniform Geometry) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1920px]:grid-cols-7 gap-3 sm:gap-4 items-stretch content-start">
        {products.map((product) => {
          const retailKhrVal = product.retailPriceKhr || product.salePriceKhr || 0;
          const wholesaleKhrVal = product.wholesalePriceKhr || 0;
          const diffKhr = retailKhrVal - wholesaleKhrVal;
          const discountPercent =
            retailKhrVal > 0 && diffKhr > 0
              ? Math.round((diffKhr / retailKhrVal) * 100)
              : 0;

          return (
            <article
              key={product.id}
              className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-slate-900/95 p-3 sm:p-3.5 text-left shadow-md hover:border-cyan-500/60 hover:shadow-xl hover:shadow-cyan-950/20 transition-all duration-200 select-none overflow-hidden"
            >
              {/* TOP SECTION: Visual & Info */}
              <div className="flex flex-col">
                {/* 1. MyPOS Style Strict Aspect-Ratio Product Visual Showcase */}
                <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shrink-0 flex items-center justify-center group-hover:border-slate-700 transition">
                  <ProductVisual
                    unit={product.unit}
                    isRefill20l={product.isRefill20l}
                    productCode={product.productCode}
                  />

                  {/* Top-Left Floating Code Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-950/85 backdrop-blur-md text-cyan-400 border border-slate-700/80 shadow-xs flex items-center gap-1">
                      <Barcode className="w-2.5 h-2.5 text-cyan-400/80" />
                      {product.productCode}
                    </span>
                  </div>

                  {/* Top-Right Floating Unit Badge */}
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-cyan-950/85 backdrop-blur-md text-cyan-300 border border-cyan-700/60 shadow-xs">
                      {getUnitLabel(product.unit)}
                    </span>
                  </div>

                  {/* Bottom-Left Floating Refill Pill (if 20L) */}
                  {product.isRefill20l && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-blue-950/90 backdrop-blur-md text-cyan-300 border border-cyan-500/40 shadow-xs flex items-center gap-1">
                        <Droplets className="w-2 h-2 text-cyan-400 fill-cyan-400" />
                        ប្តូរសំបក ២០L
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Standardized Fixed-Height Title & Subtitle (Strictly 40px) */}
                <div className="mt-2 sm:mt-2.5 h-10 flex flex-col justify-start overflow-hidden">
                  <h3
                    title={product.nameKh}
                    className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug"
                  >
                    {product.nameKh}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {product.nameEn || 'SRP Pure Water'}
                  </p>
                </div>
              </div>

              {/* BOTTOM SECTION: Uniform Pricing & Actions */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-2">
                {/* Dual-Pricing Boxes (Fixed-height per box for strict uniformity) */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {/* Retail Box */}
                  <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-800/90 group-hover:border-slate-700/80 transition h-[64px] sm:h-[68px] flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-cyan-400 font-bold">
                      <span className="flex items-center gap-1 truncate">
                        <Tag className="w-2.5 h-2.5 shrink-0" />
                        តម្លៃរាយ
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm lg:text-base font-black font-mono text-cyan-300 leading-tight truncate">
                      {formatCurrency(retailKhrVal, 'KHR')}
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-slate-500 font-mono font-medium truncate">
                      ≈ {formatCurrency(product.retailPriceUsd || khrToUsd(retailKhrVal, settings.exchangeRateKhrPerUsd), 'USD')}
                    </div>
                  </div>

                  {/* Wholesale Box */}
                  <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-800/90 group-hover:border-slate-700/80 transition h-[64px] sm:h-[68px] flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-emerald-400 font-bold">
                      <span className="flex items-center gap-1 truncate">
                        <Layers className="w-2.5 h-2.5 shrink-0" />
                        តម្លៃដុំ
                      </span>
                      {discountPercent > 0 && (
                        <span className="text-[8px] font-black px-1 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm lg:text-base font-black font-mono text-emerald-400 leading-tight truncate">
                      {formatCurrency(wholesaleKhrVal, 'KHR')}
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-slate-500 font-mono font-medium truncate">
                      ≈ {formatCurrency(product.wholesalePriceUsd || khrToUsd(wholesaleKhrVal, settings.exchangeRateKhrPerUsd), 'USD')}
                    </div>
                  </div>
                </div>

                {/* Uniform 1-Line Info Strip (Always present to guarantee 100% equal card height) */}
                <div className="h-6 flex items-center justify-between px-2 sm:px-2.5 rounded-lg bg-slate-950/60 border border-slate-800/70 text-[9px] sm:text-[10px] overflow-hidden">
                  {diffKhr > 0 ? (
                    <>
                      <span className="text-slate-400 font-medium truncate">ចំណេញទិញដុំ:</span>
                      <span className="font-bold text-emerald-400 font-mono shrink-0">
                        -{formatCurrency(diffKhr, 'KHR')}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500 font-medium truncate">តម្លៃស្តង់ដារ:</span>
                      <span className="font-medium text-slate-500 font-mono shrink-0">តម្លៃរាយ/ដុំស្មើគ្នា</span>
                    </>
                  )}
                </div>

                {/* Footer Action Bar (Fixed 36px Height) */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/50 h-9 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-medium">សកម្ម</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-cyan-600 hover:text-white text-slate-300 text-xs font-bold transition shadow-2xs active:scale-95"
                      title="កែប្រែផលិតផល"
                    >
                      <Edit2 className="w-3 h-3 shrink-0" />
                      <span className="text-[11px] hidden min-[360px]:inline">កែប្រែ</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-1 rounded-lg bg-slate-800/90 hover:bg-rose-600 hover:text-white text-slate-400 text-xs transition shadow-2xs active:scale-95"
                      title="លុបផលិតផល"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                {editingProduct ? 'កែប្រែផលិតផលទឹក' : 'បន្ថែមផលិតផលទឹកសម្រេចថ្មី'}
              </h3>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                គិតជារៀល (៛)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  កូដផលិតផល *
                </label>
                <input
                  type="text"
                  required
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    ប្រភេទកញ្ចប់/ធុង *
                  </label>
                  {onSaveContainerUnit && (
                    <button
                      type="button"
                      onClick={() => setIsUnitsModalOpen(true)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <Boxes className="w-3 h-3" />
                      <span>+ គ្រប់គ្រងឯកតា</span>
                    </button>
                  )}
                </div>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {containerUnits.length > 0 ? (
                    containerUnits.map((u) => (
                      <option key={u.id} value={u.code}>
                        {u.nameKh} ({u.nameEn || u.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="container_20l">ធុង ២០លីត្រ (20L Container)</option>
                      <option value="pack_350ml">យួរ ៣៥០មល (24 ដប)</option>
                      <option value="pack_500ml">យួរ ៥០០មល (24 ដប)</option>
                      <option value="pack_1500ml">យួរ ១៥០០មល (12 ដប)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ឈ្មោះជាភាសាខ្មែរ *
              </label>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ឈ្មោះជាអង់គ្លេស
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="ឧ. 20L Water Refill"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Pricing Section - In Khmer Riel (៛) */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-800/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-1.5">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Tag className="w-3.5 h-3.5" />
                  កំណត់តម្លៃលក់ (គិតជារៀល ៛)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  អត្រាប្តូរប្រាក់: 1$ = {settings.exchangeRateKhrPerUsd.toLocaleString()} ៛
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Retail Price Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    តម្លៃរាយ (៛) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="100"
                      min="0"
                      required
                      value={retailPriceKhr}
                      onChange={(e) => setRetailPriceKhr(e.target.value)}
                      placeholder="3000"
                      className="w-full pl-3 pr-7 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-500">
                      ៛
                    </span>
                  </div>
                  <p className="text-[10px] text-cyan-400 font-semibold mt-1">
                    = {formatCurrency(parseFloat(retailPriceKhr) || 0, 'KHR')}
                  </p>
                </div>

                {/* Wholesale Price Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    តម្លៃដុំ (៛) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="100"
                      min="0"
                      required
                      value={wholesalePriceKhr}
                      onChange={(e) => setWholesalePriceKhr(e.target.value)}
                      placeholder="2500"
                      className="w-full pl-3 pr-7 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-500">
                      ៛
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                    = {formatCurrency(parseFloat(wholesalePriceKhr) || 0, 'KHR')}
                  </p>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 pt-1 cursor-pointer select-none">
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
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-600/30 transition"
              >
                រក្សាទុកផលិតផល
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Container Units Modal */}
      {onSaveContainerUnit && onDeleteContainerUnit && (
        <ContainerUnitsModal
          isOpen={isUnitsModalOpen}
          onClose={() => setIsUnitsModalOpen(false)}
          containerUnits={containerUnits}
          products={products}
          onSaveUnit={onSaveContainerUnit}
          onDeleteUnit={onDeleteContainerUnit}
          onSelectUnit={(newCode) => {
            setUnit(newCode);
          }}
        />
      )}
    </div>
  );
};
