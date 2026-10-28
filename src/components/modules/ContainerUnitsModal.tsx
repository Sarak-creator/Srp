'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Tag,
  Info,
} from 'lucide-react';
import { ContainerUnitItem, Product } from '@/types/water-factory';
import { generateUuid } from '@/lib/supabase-service';

interface ContainerUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerUnits: ContainerUnitItem[];
  products: Product[];
  onSaveUnit: (unit: ContainerUnitItem) => Promise<boolean | ContainerUnitItem | null>;
  onDeleteUnit: (id: string) => Promise<boolean>;
  onSelectUnit?: (unitCode: string) => void;
}

export const ContainerUnitsModal: React.FC<ContainerUnitsModalProps> = ({
  isOpen,
  onClose,
  containerUnits,
  products,
  onSaveUnit,
  onDeleteUnit,
  onSelectUnit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [nameKh, setNameKh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setCode('');
    setNameKh('');
    setNameEn('');
    setDescription('');
    setIsDefault(false);
    setErrorMsg('');
  };

  const handleStartAdd = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleStartEdit = (u: ContainerUnitItem) => {
    setEditingId(u.id);
    setCode(u.code);
    setNameKh(u.nameKh);
    setNameEn(u.nameEn);
    setDescription(u.description || '');
    setIsDefault(Boolean(u.isDefault));
    setErrorMsg('');
    setIsEditing(true);
  };

  const handleAutoSlug = (val: string) => {
    setNameKh(val);
    if (!editingId && !code) {
      // Generate a suggested code from name or timestamp
      const slug = val
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      if (slug) {
        setCode(slug);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const formattedCode = code.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!formattedCode) {
      setErrorMsg('សូមបញ្ចូលកូដឯកតា (Unit Code) ជាអក្សរឡាតាំង ឬលេខ (ឧ. pack_330ml)');
      return;
    }

    if (!nameKh.trim()) {
      setErrorMsg('សូមបញ្ចូលឈ្មោះឯកតាជាភាសាខ្មែរ (ឧ. យួរ ៣៣០មល)');
      return;
    }

    // Check duplicate code if creating or changing code
    const isDup = containerUnits.some(
      (u) => u.code.toLowerCase() === formattedCode && u.id !== editingId
    );
    if (isDup) {
      setErrorMsg(`កូដឯកតា "${formattedCode}" នេះមានក្នុងប្រព័ន្ធរួចហើយ! សូមជ្រើសរើសកូដផ្សេង។`);
      return;
    }

    setIsSubmitting(true);
    const unitItem: ContainerUnitItem = {
      id: editingId || generateUuid(),
      code: formattedCode,
      nameKh: nameKh.trim(),
      nameEn: nameEn.trim() || nameKh.trim(),
      description: description.trim() || undefined,
      isDefault,
    };

    const res = await onSaveUnit(unitItem);
    setIsSubmitting(false);

    if (res !== false) {
      if (onSelectUnit) {
        onSelectUnit(formattedCode);
      }
      resetForm();
    } else {
      setErrorMsg('មានបញ្ហាក្នុងការរក្សាទុកឯកតាទៅកាន់ Supabase សូមព្យាយាមម្តងទៀត!');
    }
  };

  const handleDelete = async (u: ContainerUnitItem) => {
    // Check if any product is currently using this unit
    const usingProducts = products.filter((p) => p.unit === u.code);
    if (usingProducts.length > 0) {
      alert(
        `មិនអាចលុបឯកតា "${u.nameKh}" បានទេ!\n\nឯកតានេះកំពុងត្រូវបានប្រើប្រាស់ដោយផលិតផលចំនួន ${usingProducts.length}៖\n${usingProducts
          .map((p) => `• ${p.nameKh} (${p.productCode})`)
          .join('\n')}\n\nសូមកែប្រែឯកតារបស់ផលិតផលទាំងនោះជាមុនសិន។`
      );
      return;
    }

    if (u.isDefault) {
      if (
        !confirm(
          `ឯកតា "${u.nameKh}" គឺជាឯកតាដើម (Default)។ តើអ្នកពិតជាចង់លុបឯកតានេះចេញពីប្រព័ន្ធមែនទេ?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`តើអ្នកពិតជាចង់លុបឯកតា "${u.nameKh}" (${u.code}) មែនទេ?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    await onDeleteUnit(u.id);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                គ្រប់គ្រងប្រភេទកញ្ចប់ និងឯកតា (Container Units)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                បន្ថែម កែប្រែ ឬលុបឯកតាផលិតផល (ធុង ២០L, យួរដបទឹក, កេះ, កំប៉ុង) ក្នុងប្រព័ន្ធ
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Top action bar */}
          {!isEditing && (
            <div className="flex items-center justify-between bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span>
                  សរុបមាន <strong className="text-white font-mono">{containerUnits.length}</strong> ឯកតាក្នុងប្រព័ន្ធ
                </span>
              </div>
              <button
                onClick={handleStartAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>បន្ថែមឯកតាថ្មី</span>
              </button>
            </div>
          )}

          {/* Add / Edit Form */}
          {isEditing && (
            <form
              onSubmit={handleSave}
              className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 space-y-3.5 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                  <Edit2 className="w-3.5 h-3.5" />
                  {editingId ? 'កែប្រែព័ត៌មានឯកតា' : 'បន្ថែមឯកតាកញ្ចប់/ធុងថ្មី'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  បោះបង់
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ឈ្មោះជាភាសាខ្មែរ *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameKh}
                    onChange={(e) => handleAutoSlug(e.target.value)}
                    placeholder="ឧ. យួរ ៣៣០មល (២៤ដប)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ឈ្មោះជាភាសាអង់គ្លេស
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. 330ml Pack (24 bottles)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    កូដឯកតា (Unique Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ឧ. pack_330ml ឬ can_5l"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    ប្រើជាកូដសម្គាល់ក្នុងមូលដ្ឋានទិន្នន័យ (អក្សរតូច គ្មានដកឃ្លា)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ការពិពណ៌នាសង្ខេប
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="កំណត់ចំណាំបន្ថែមលើឯកតានេះ..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="unitIsDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="unitIsDefault" className="text-xs text-slate-300 cursor-pointer">
                  កំណត់ជាឯកតាដើម (Default Unit) ពេលបង្កើតផលិតផលថ្មី
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 transition disabled:opacity-50 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកឯកតា'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Table / List of Container Units */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">ឈ្មោះឯកតា (Unit Name)</th>
                  <th className="py-3 px-4">កូដសម្គាល់ (Code)</th>
                  <th className="py-3 px-4">ការប្រើប្រាស់ (Usage)</th>
                  <th className="py-3 px-4 text-right">សកម្មភាព (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {containerUnits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      មិនទាន់មានឯកតាក្នុងប្រព័ន្ធនៅឡើយទេ
                    </td>
                  </tr>
                ) : (
                  containerUnits.map((u) => {
                    const usageCount = products.filter((p) => p.unit === u.code).length;
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-900/50 transition group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{u.nameKh}</span>
                            {u.isDefault && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.nameEn}</div>
                          {u.description && (
                            <div className="text-[10px] text-slate-500 mt-0.5">{u.description}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-400">
                            {u.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {usageCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-[11px] text-cyan-300 font-medium">
                              <Info className="w-3 h-3 text-cyan-400" />
                              {usageCount} ផលិតផល
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">មិនទាន់មានប្រើ</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                              title="កែប្រែឯកតា"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                              title="លុបឯកតា"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            * ឯកតាដែលកំពុងប្រើដោយផលិតផល មិនអាចលុបបានទេ ដើម្បីការពារការខូចទិន្នន័យ។
          </p>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            បិទផ្ទាំង (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
