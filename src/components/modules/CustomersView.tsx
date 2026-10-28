'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  MapPin,
  Package,
  CreditCard,
  RotateCcw,
  Search,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { Customer, SystemSettings } from '@/types/water-factory';
import { formatUsd, formatKhr, usdToKhr } from '@/lib/financial-engine';
import { generateUuid } from '@/lib/supabase-service';

interface CustomersViewProps {
  customers: Customer[];
  settings: SystemSettings;
  onSaveCustomer: (customer: Customer) => void;
  onAdjustBottleBalance: (customerId: string, delta: number, reason: string) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  settings,
  onSaveCustomer,
  onAdjustBottleBalance,
  onDeleteCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Bottle Adjustment Modal State
  const [adjustTargetCustomer, setAdjustTargetCustomer] = useState<Customer | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<string>('0');
  const [adjustReason, setAdjustReason] = useState<string>('អតិថិជនយកសំបកធុងមកសងបន្ថែម');

  // Customer Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search) ||
      c.deliveryAddress.toLowerCase().includes(search.toLowerCase())
  );

  const totalEmptyContainersAll = customers.reduce((sum, c) => sum + c.emptyContainersHeld, 0);
  const totalDebtAllUsd = customers.reduce((sum, c) => sum + c.totalDebtUsd, 0);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFullName('');
    setPhoneNumber('');
    setDeliveryAddress('');
    setNotes('');
    setIsCustomerModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFullName(c.fullName);
    setPhoneNumber(c.phoneNumber);
    setDeliveryAddress(c.deliveryAddress);
    setNotes(c.notes || '');
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const cust: Customer = {
      id: editingCustomer ? editingCustomer.id : generateUuid(),
      customerCode: editingCustomer
        ? editingCustomer.customerCode
        : `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim() || 'N/A',
      deliveryAddress: deliveryAddress.trim() || 'ភ្នំពេញ',
      totalDebtUsd: editingCustomer ? editingCustomer.totalDebtUsd : 0,
      totalDebtKhr: editingCustomer ? editingCustomer.totalDebtKhr : 0,
      emptyContainersHeld: editingCustomer ? editingCustomer.emptyContainersHeld : 0,
      notes: notes.trim() || undefined,
      isActive: true,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    onSaveCustomer(cust);
    setIsCustomerModalOpen(false);
  };

  const handleExecuteBottleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetCustomer) return;
    const delta = parseInt(adjustDelta, 10);
    if (!isNaN(delta) && delta !== 0) {
      onAdjustBottleBalance(adjustTargetCustomer.id, delta, adjustReason);
      setAdjustTargetCustomer(null);
      setAdjustDelta('0');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">ចំនួនអតិថិជនសរុប</span>
          <p className="text-xl font-bold text-white mt-1">{customers.length} កន្លែង</p>
        </div>
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">
            សំបកធុង ២០L នៅអតិថិជនសរុប
          </span>
          <p className="text-xl font-bold text-cyan-300 mt-1">
            {totalEmptyContainersAll} <span className="text-xs font-normal text-slate-400">ធុង</span>
          </p>
        </div>
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">បំណុលជំពាក់សរុប</span>
          <p className="text-xl font-bold text-rose-400 mt-1">{formatUsd(totalDebtAllUsd)}</p>
        </div>
      </div>

      {/* Action and Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខទូរស័ព្ទ..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>បង្កើតអតិថិជនថ្មី</span>
        </button>
      </div>

      {/* Customer Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                    {cust.customerCode}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{cust.fullName}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cust)}
                    className="px-2 py-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                  >
                    កែប្រែ
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`តើអ្នកពិតជាចង់លុបអតិថិជន "${cust.fullName}" មែនទេ?`)) {
                        onDeleteCustomer(cust.id);
                      }
                    }}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 transition"
                    title="លុបអតិថិជន"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{cust.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="line-clamp-1">{cust.deliveryAddress}</span>
                </div>
              </div>
            </div>

            {/* Badges & Balances */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
              {/* Empty 20L Bottle Status */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
                <span className="text-cyan-300 font-medium flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-cyan-400" />
                  សំបកធុង ២០L ជំពាក់:
                </span>
                <span className="font-extrabold text-cyan-300">
                  {cust.emptyContainersHeld} ធុង
                </span>
              </div>

              {/* Debt Balance Status */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  បំណុលជំពាក់សរុប:
                </span>
                <span
                  className={
                    cust.totalDebtUsd > 0
                      ? 'font-bold text-rose-400'
                      : 'font-semibold text-slate-400'
                  }
                >
                  {formatUsd(cust.totalDebtUsd)}
                </span>
              </div>

              {/* Direct Bottle Adjust Button */}
              <button
                onClick={() => {
                  setAdjustTargetCustomer(cust);
                  setAdjustDelta('0');
                }}
                className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 font-medium flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>កែសម្រួល / ទទួលសំបកធុងសង</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Form Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveCustomer}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">
              {editingCustomer ? 'កែប្រែព័ត៌មានអតិថិជន' : 'បង្កើតអតិថិជនថ្មី'}
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">ឈ្មោះអតិថិជន/អាជីវកម្ម *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ឧ. ភោជនីយដ្ឋាន ម្លប់ត្រជាក់"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">លេខទូរស័ព្ទ *</label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="ឧ. 012 345 678"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">អាសយដ្ឋានដឹកជញ្ជូនទឹក</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="ឧ. ផ្ទះលេខ ១២ ផ្លូវ ២៧១ សង្កាត់បឹងទំពុន..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">កំណត់ចំណាំទម្លាប់ដឹកជញ្ជូន</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ឧ. ដឹក ២ថ្ងៃម្តង ពេលព្រឹកម៉ោង ៨..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
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

      {/* Direct Empty Bottle Adjustment Modal */}
      {adjustTargetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleExecuteBottleAdjust}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              កែសម្រួលសំបកធុង ២០L របស់អតិថិជន
            </h3>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <p className="font-bold text-white">{adjustTargetCustomer.fullName}</p>
              <p className="text-slate-400 mt-1">
                សំបកធុងកំពុងកាន់កាប់បច្ចុប្បន្ន៖{' '}
                <span className="font-bold text-cyan-300">
                  {adjustTargetCustomer.emptyContainersHeld} ធុង
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                ចំនួនសំបកធុងត្រូវផ្លាស់ប្តូរ (ឧ. -5 បើសងសំបក ឬ +5 បើដឹកថែម)
              </label>
              <input
                type="number"
                required
                value={adjustDelta}
                onChange={(e) => setAdjustDelta(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">មូលហេតុ</label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAdjustTargetCustomer(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-600/30"
              >
                កែសម្រួល
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
