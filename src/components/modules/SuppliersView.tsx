'use client';

import React, { useState } from 'react';
import { Truck, Plus, Phone, MapPin, Wrench, PackageCheck, Trash2 } from 'lucide-react';
import { Supplier } from '@/types/water-factory';

interface SuppliersViewProps {
  suppliers: Supplier[];
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  onSaveSupplier,
  onDeleteSupplier,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !phoneNumber.trim()) return;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      supplierName: supplierName.trim(),
      contactPerson: contactPerson.trim() || 'N/A',
      phoneNumber: phoneNumber.trim(),
      serviceType: serviceType.trim() || 'ផ្គត់ផ្គង់រោងចក្រ',
      address: address.trim() || 'ភ្នំពេញ',
    };

    onSaveSupplier(newSup);
    setIsModalOpen(false);
    setSupplierName('');
    setContactPerson('');
    setPhoneNumber('');
    setServiceType('');
    setAddress('');
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            សៀវភៅទំនាក់ទំនងអ្នកផ្គត់ផ្គង់ (Lightweight Supplier Contacts)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ទំនាក់ទំនងរហ័សសម្រាប់សំបកធុង គម្រប ជាងម៉ាស៊ីនចម្រោះទឹក និងរោងពុម្ព (គ្មានប្រព័ន្ធស្តុកទំនិញ)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>បន្ថែមអ្នកផ្គត់ផ្គង់</span>
        </button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950/70 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <button
                  onClick={() => {
                    if (confirm(`តើអ្នកពិតជាចង់លុបអ្នកផ្គត់ផ្គង់ "${sup.supplierName}" នេះមែនទេ?`)) {
                      onDeleteSupplier(sup.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 transition"
                  title="លុបអ្នកផ្គត់ផ្គង់"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                  {sup.serviceType}
                </span>
                <h3 className="text-sm font-bold text-white mt-2">{sup.supplierName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">អ្នកទំនាក់ទំនង: {sup.contactPerson}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold text-white">{sup.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="line-clamp-1">{sup.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              បន្ថែមអ្នកផ្គត់ផ្គង់ថ្មី
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">ឈ្មោះក្រុមហ៊ុន/រោងចក្រ *</label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="ឧ. រោងចក្រផ្លុំសំបកធុង ជ័យជំនះ"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">ឈ្មោះអ្នកទំនាក់ទំនង</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="ឧ. លោក ជ័យ ឬ មេការ..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">លេខទូរស័ព្ទទំនាក់ទំនង *</label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="ឧ. 012 888 999"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">ប្រភេទសេវាកម្ម/ទំនិញ</label>
              <input
                type="text"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="ឧ. សំបកធុង ២០L, គម្រប, ជួសជុលម៉ាស៊ីនចម្រោះ..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">អាសយដ្ឋាន</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ឧ. ផ្លូវជាតិលេខ ៤ កំបូល ភ្នំពេញ"
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
                រក្សាទុក
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
