'use client';

import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  Building,
  Users,
  Receipt,
  Shield,
  RefreshCw,
  Boxes,
  Plus,
  Edit2,
  Tag,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SystemSettings, UserAccount, UserRole, ContainerUnitItem, Product } from '@/types/water-factory';
import { ContainerUnitsModal } from './ContainerUnitsModal';
import { testTelegramConnection } from '@/lib/telegram-service';

interface SettingsViewProps {
  settings: SystemSettings;
  users: UserAccount[];
  activeUser: UserAccount;
  containerUnits?: ContainerUnitItem[];
  products?: Product[];
  onSaveSettings: (settings: SystemSettings) => void;
  onSwitchUser: (user: UserAccount) => void;
  onResetData: () => void;
  onSaveContainerUnit?: (unit: ContainerUnitItem) => Promise<boolean | ContainerUnitItem | null>;
  onDeleteContainerUnit?: (id: string) => Promise<boolean>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  users,
  activeUser,
  containerUnits = [],
  products = [],
  onSaveSettings,
  onSwitchUser,
  onResetData,
  onSaveContainerUnit,
  onDeleteContainerUnit,
}) => {
  // Form State
  const [factoryNameKh, setFactoryNameKh] = useState(settings.factoryNameKh);
  const [factoryNameEn, setFactoryNameEn] = useState(settings.factoryNameEn);
  const [phoneNumber, setPhoneNumber] = useState(settings.phoneNumber);
  const [addressKh, setAddressKh] = useState(settings.addressKh);
  const [exchangeRate, setExchangeRate] = useState(settings.exchangeRateKhrPerUsd.toString());
  const [receiptFooterKh, setReceiptFooterKh] = useState(settings.receiptFooterKh);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);

  // Telegram Bot State
  const [telegramBotToken, setTelegramBotToken] = useState(settings.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || '');
  const [telegramNotifyOrder, setTelegramNotifyOrder] = useState(settings.telegramNotifyOrder ?? true);
  const [telegramNotifyDebt, setTelegramNotifyDebt] = useState(settings.telegramNotifyDebt ?? true);
  const [telegramNotifyClosing, setTelegramNotifyClosing] = useState(settings.telegramNotifyClosing ?? true);
  const [telegramNotifyBroken, setTelegramNotifyBroken] = useState(settings.telegramNotifyBroken ?? false);
  const [showToken, setShowToken] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');

  const handleTestBot = async () => {
    if (!telegramBotToken.trim()) {
      setTestStatus('error');
      setTestMsg('សូមបញ្ចូល Bot Token ជាមុនសិន!');
      return;
    }
    if (!telegramChatId.trim()) {
      setTestStatus('error');
      setTestMsg('សូមបញ្ចូល Chat ID ឬ Group ID ជាមុនសិន!');
      return;
    }

    setTestStatus('loading');
    setTestMsg('កំពុងសាកល្បងផ្ញើសារតេស្តទៅ Telegram...');

    const result = await testTelegramConnection(
      telegramBotToken,
      telegramChatId,
      factoryNameKh || 'សហគ្រាសផលិតទឹកបរិសុទ្ធ អេស អរ ភី'
    );

    if (result.success) {
      setTestStatus('success');
      setTestMsg(result.message);
    } else {
      setTestStatus('error');
      setTestMsg(result.message);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(exchangeRate) || 4100;

    const newSettings: SystemSettings = {
      ...settings,
      factoryNameKh: factoryNameKh.trim(),
      factoryNameEn: factoryNameEn.trim(),
      phoneNumber: phoneNumber.trim(),
      addressKh: addressKh.trim(),
      exchangeRateKhrPerUsd: rate,
      receiptFooterKh: receiptFooterKh.trim(),
      telegramBotToken: telegramBotToken.trim(),
      telegramChatId: telegramChatId.trim(),
      telegramNotifyOrder,
      telegramNotifyDebt,
      telegramNotifyClosing,
      telegramNotifyBroken,
    };

    onSaveSettings(newSettings);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Settings Header */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            ការកំណត់ប្រព័ន្ធ និងអ្នកប្រើប្រាស់ (Settings & RBAC)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            គ្រប់គ្រងអត្រាប្តូរប្រាក់ ព័ត៌មានរោងចក្រ វិក្កយបត្រ និងសិទ្ធិអ្នកប្រើប្រាស់
          </p>
        </div>

        {isSavedNotice && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-pulse">
            ✓ បានរក្សាទុកជោគជ័យ!
          </span>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Currency & Exchange Rate Section */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            ការកំណត់អត្រាប្តូរប្រាក់ (Exchange Rate Settings)
          </h3>

          <div className="max-w-xs">
            <label className="block text-xs text-slate-400 mb-1">
              អត្រាប្តូរប្រាក់ 1 ដុល្លារស្មើនឹង (៛) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="10"
                required
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">៛</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              អត្រានេះនឹងត្រូវយកទៅគណនាក្នុងការលក់ POS វិក្កយបត្រ និងបំណុល
            </p>
          </div>
        </div>

        {/* Factory Metadata */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            ព័ត៌មានសហគ្រាសផលិតទឹកបរិសុទ្ធ (Factory Metadata)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">ឈ្មោះរោងចក្រ (ភាសាខ្មែរ) *</label>
              <input
                type="text"
                required
                value={factoryNameKh}
                onChange={(e) => setFactoryNameKh(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">ឈ្មោះរោងចក្រ (ភាសាអង់គ្លេស)</label>
              <input
                type="text"
                value={factoryNameEn}
                onChange={(e) => setFactoryNameEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">លេខទូរស័ព្ទរោងចក្រ *</label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">អាសយដ្ឋានរោងចក្រ *</label>
              <input
                type="text"
                required
                value={addressKh}
                onChange={(e) => setAddressKh(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Receipt Customization */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-cyan-400" />
            ការរៀបចំវិក្កយបត្រព្រីនកម្តៅ 80mm (Receipt Footer)
          </h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              ពាក្យជូនពរ/សារខាងក្រោមវិក្កយបត្រ (Footer Note)
            </label>
            <input
              type="text"
              value={receiptFooterKh}
              onChange={(e) => setReceiptFooterKh(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Telegram Bot Integration Section */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">
                  ការភ្ជាប់ Telegram Bot សម្រាប់ទទួលដំណឹង (Telegram Bot Notifications)
                </h3>
                {telegramBotToken && telegramChatId ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    ● កំពុងដំណើរការ
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                    ○ មិនទាន់ភ្ជាប់
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                ទទួលសារដំណឹងភ្លាមៗរាល់ពេលមានការលក់ថ្មី ការសងប្រាក់បំណុល និងរបាយការណ៍បិទបញ្ជីប្រចាំថ្ងៃ
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 transition shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showGuide ? 'លាក់ការណែនាំ' : 'របៀបបង្កើត Bot'}</span>
            </button>
          </div>

          {/* Setup Guide Accordion */}
          {showGuide && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/30 text-xs text-slate-300 space-y-2.5">
              <h4 className="font-bold text-sky-400 flex items-center gap-1.5 text-xs">
                📖 របៀបបង្កើត Telegram Bot និងយក Chat ID៖
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                <li>
                  បើក Telegram ស្វែងរក <b className="text-white">@BotFather</b> រួចផ្ញើពាក្យ <code className="text-sky-400 font-mono">/newbot</code>
                </li>
                <li>
                  កំណត់ឈ្មោះ Bot និង Username (ត្រូវបញ្ចប់ដោយពាក្យ <b>bot</b> ឧទាហរណ៍៖ <code className="text-sky-300 font-mono">srppos_bot</code>)
                </li>
                <li>
                  Copy យក <b className="text-amber-400">HTTP API Token</b> (ឧទាហរណ៍៖ <code className="text-amber-300 font-mono">7123456789:AAHk...</code>) មកបិទភ្ជាប់ក្នុងប្រអប់ <b>Bot Token</b>
                </li>
                <li>
                  <b>របៀបយក Chat ID៖</b>
                  <div className="pl-4 mt-1 space-y-0.5 text-slate-400">
                    <div>• <b>ទទួលផ្ទាល់ខ្លួន៖</b> ឆាតទៅ <b className="text-white">@userinfobot</b> ឬ <b className="text-white">@getmyid_bot</b> រួចចុច <code className="text-sky-400 font-mono">/start</code> ដើម្បីមើល <code>Id</code> របស់អ្នក (ជាលេខសុទ្ធ)</div>
                    <div>• <b>ទទួលក្នុង Telegram Group៖</b> Add Bot ដែលទើបបង្កើតចូលក្នុង Group របស់អ្នក រួចយក Chat ID (ជាទូទៅចាប់ផ្ដើមដោយសញ្ញាដក <code className="text-sky-400 font-mono">-100...</code>)</div>
                  </div>
                </li>
                <li>
                  ចុចប៊ូតុង <b className="text-emerald-400">សាកល្បងផ្ញើសារតេស្ត</b> ដើម្បីផ្ទៀងផ្ទាត់!
                </li>
              </ol>
            </div>
          )}

          {/* Bot Token & Chat ID Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Telegram Bot Token (@BotFather Token)
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="7123456789:AAHk1_exampleToken..."
                  className="w-full px-3 py-2 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Telegram Chat ID ឬ Group ID
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="123456789 ឬ -1001234567890"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Notification Toggles */}
          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs font-bold text-slate-300 mb-2.5">
              ជ្រើសរើសប្រភេទដំណឹងដែលត្រូវផ្ញើស្វ័យប្រវត្តិ (Notification Events):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={telegramNotifyOrder}
                  onChange={(e) => setTelegramNotifyOrder(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="text-xs font-semibold text-white">🔔 ការលក់ថ្មី (POS New Sale)</div>
                  <div className="text-[10px] text-slate-400">ផ្ញើដំណឹងភ្លាមៗពេលចេញវិក្កយបត្រថ្មី</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={telegramNotifyDebt}
                  onChange={(e) => setTelegramNotifyDebt(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="text-xs font-semibold text-white">💰 ការទូទាត់បំណុល (Debt Repayments)</div>
                  <div className="text-[10px] text-slate-400">ផ្ញើដំណឹងពេលអតិថិជនសងប្រាក់បំណុល</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={telegramNotifyClosing}
                  onChange={(e) => setTelegramNotifyClosing(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="text-xs font-semibold text-white">📊 របាយការណ៍បិទបញ្ជី (Daily Report Summary)</div>
                  <div className="text-[10px] text-slate-400">ផ្ញើរបាយការណ៍សង្ខេបលក់ប្រចាំថ្ងៃ</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={telegramNotifyBroken}
                  onChange={(e) => setTelegramNotifyBroken(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="text-xs font-semibold text-white">⚠️ ទំនិញបាក់បែក / ខូចខាត (Damages)</div>
                  <div className="text-[10px] text-slate-400">ផ្ញើដំណឹងពេលកត់ត្រាសំបកធុង/ទំនិញបែក</div>
                </div>
              </label>
            </div>
          </div>

          {/* Test Connection Button & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="text-xs">
              {testStatus === 'loading' && (
                <span className="text-sky-400 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {testMsg}
                </span>
              )}
              {testStatus === 'success' && (
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  {testMsg}
                </span>
              )}
              {testStatus === 'error' && (
                <span className="text-rose-400 flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  {testMsg}
                </span>
              )}
              {testStatus === 'idle' && (
                <span className="text-[11px] text-slate-500">
                  ចុច "សាកល្បងផ្ញើសារតេស្ត" ដើម្បីពិនិត្យមើលថាតើសារអាចចូល Telegram បានឬនៅ
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleTestBot}
              disabled={testStatus === 'loading'}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-sky-300 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-700/50 transition active:scale-95 disabled:opacity-50 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testStatus === 'loading' ? 'កំពុងផ្ញើ...' : 'សាកល្បងផ្ញើសារតេស្ត (Test Bot)'}</span>
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition transform active:scale-95"
          >
            រក្សាទុកការកំណត់ទាំងអស់
          </button>
        </div>
      </form>

      {/* Container Units Management Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              គ្រប់គ្រងប្រភេទកញ្ចប់ និងឯកតាផលិតផល (Container Units Management)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              បន្ថែម កែប្រែ ឬលុបឯកតាកញ្ចប់/ធុងទឹក (ធុង ២០L, យួរ ៣៥០ml, យួរ ៥០០ml, កំប៉ុង, ដប)
            </p>
          </div>
          {onSaveContainerUnit && (
            <button
              onClick={() => setIsUnitsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែម/កែប្រែឯកតា</span>
            </button>
          )}
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {containerUnits.map((u) => {
            const usageCount = products.filter((p) => p.unit === u.code).length;
            return (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{u.nameKh}</span>
                    {u.isDefault && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{u.nameEn}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-cyan-400">
                      {u.code}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {usageCount} ផលិតផល
                    </span>
                  </div>
                </div>
                {onSaveContainerUnit && (
                  <button
                    onClick={() => setIsUnitsModalOpen(true)}
                    className="p-1 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-900 transition"
                    title="កែប្រែឯកតា"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Based Access Control / Switch User Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          ប្តូរគណនីអ្នកប្រើប្រាស់សាកល្បង (Role-Based Testing: Admin / Cashier / Driver)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {users.map((u) => {
            const isCurrent = u.id === activeUser.id;
            return (
              <button
                key={u.id}
                onClick={() => onSwitchUser(u)}
                className={`p-4 rounded-2xl border text-left transition ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                    {u.role}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] text-emerald-400 font-bold">✓ កំពុងប្រើប្រាស់</span>
                  )}
                </div>
                <p className="text-xs font-bold text-white mt-2">{u.fullName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">@{u.username} • {u.phoneNumber}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Data to Factory Defaults Section */}
      <div className="p-6 rounded-3xl bg-rose-950/10 border border-rose-900/30 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-rose-400">កំណត់ទិន្នន័យឡើងវិញ (Reset to Seed Data)</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            លុបទិន្នន័យដែលបានលក់សាកល្បង ហើយត្រឡប់ទៅទិន្នន័យដើមរបស់រោងចក្រទឹក
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យរោងចក្រឡើងវិញមែនទេ?')) {
              onResetData();
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-900/40 hover:bg-rose-900 border border-rose-700/50 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>កំណត់ទិន្នន័យដើមឡើងវិញ</span>
        </button>
      </div>

      {/* Container Units Modal */}
      {onSaveContainerUnit && onDeleteContainerUnit && (
        <ContainerUnitsModal
          isOpen={isUnitsModalOpen}
          onClose={() => setIsUnitsModalOpen(false)}
          containerUnits={containerUnits}
          products={products}
          onSaveUnit={onSaveContainerUnit}
          onDeleteUnit={onDeleteContainerUnit}
        />
      )}
    </div>
  );
};
