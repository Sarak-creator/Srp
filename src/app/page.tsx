'use client';

import React, { useState, useEffect } from 'react';
import { StorageService } from '@/lib/storage';
import { SupabaseSync } from '@/lib/supabase-sync';
import {
  Product,
  Customer,
  Order,
  BrokenProduct,
  OperationalExpense,
  Supplier,
  SystemSettings,
  UserAccount,
  CustomerPayment,
} from '@/types/water-factory';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Sidebar, ActiveModule } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { DashboardView } from '@/components/modules/DashboardView';
import { PosView } from '@/components/modules/PosView';
import { OrderHistoryView } from '@/components/modules/OrderHistoryView';
import { ProductsView } from '@/components/modules/ProductsView';
import { BrokenProductsView } from '@/components/modules/BrokenProductsView';
import { CustomersView } from '@/components/modules/CustomersView';
import { DebtView } from '@/components/modules/DebtView';
import { ExpensesView } from '@/components/modules/ExpensesView';
import { SuppliersView } from '@/components/modules/SuppliersView';
import { ReportsView } from '@/components/modules/ReportsView';
import { SettingsView } from '@/components/modules/SettingsView';

export default function AppHome() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Core Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [brokenProducts, setBrokenProducts] = useState<BrokenProduct[]>([]);
  const [expenses, setExpenses] = useState<OperationalExpense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(StorageService.getSettings());
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [activeUser, setActiveUser] = useState<UserAccount>(StorageService.getUsers()[0]);

  // Load from Storage on Mount
  useEffect(() => {
    setProducts(StorageService.getProducts());
    setCustomers(StorageService.getCustomers());
    setOrders(StorageService.getOrders());
    setBrokenProducts(StorageService.getBrokenProducts());
    setExpenses(StorageService.getExpenses());
    setSuppliers(StorageService.getSuppliers());
    setPayments(StorageService.getPayments());
    setSettings(StorageService.getSettings());
    const loadedUsers = StorageService.getUsers();
    setUsers(loadedUsers);
    if (loadedUsers.length > 0) setActiveUser(loadedUsers[0]);
    setIsLoaded(true);
  }, []);

  // Handlers for POS & Orders
  const handleCompleteOrder = (newOrder: Order, updatedCustomer?: Customer) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    StorageService.saveOrders(updatedOrders);

    if (updatedCustomer) {
      const updatedCustomers = customers.map((c) =>
        c.id === updatedCustomer.id ? updatedCustomer : c
      );
      setCustomers(updatedCustomers);
      StorageService.saveCustomers(updatedCustomers);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status === 'cancelled') return;

    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'cancelled' as const } : o
    );
    setOrders(updatedOrders);
    StorageService.saveOrders(updatedOrders);

    // Rollback customer debt and bottle balance
    const cust = customers.find((c) => c.id === targetOrder.customerId);
    if (cust) {
      const bottleDiff = targetOrder.containersDelivered20L - targetOrder.containersReturned20L;
      const updatedCust: Customer = {
        ...cust,
        totalDebtUsd: Math.max(0, Number((cust.totalDebtUsd - targetOrder.remainingDebtUsd).toFixed(2))),
        emptyContainersHeld: Math.max(0, cust.emptyContainersHeld - bottleDiff),
      };
      const updatedCustomers = customers.map((c) => (c.id === cust.id ? updatedCust : c));
      setCustomers(updatedCustomers);
      StorageService.saveCustomers(updatedCustomers);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    StorageService.saveOrders(updated);
    SupabaseSync.deleteOrder(orderId);
  };

  // Customers Handlers
  const handleSaveCustomer = (cust: Customer) => {
    const exists = customers.some((c) => c.id === cust.id);
    const updated = exists ? customers.map((c) => (c.id === cust.id ? cust : c)) : [cust, ...customers];
    setCustomers(updated);
    StorageService.saveCustomers(updated);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const updated = customers.filter((c) => c.id !== customerId);
    setCustomers(updated);
    StorageService.saveCustomers(updated);
    SupabaseSync.deleteCustomer(customerId);
  };

  const handleAdjustBottleBalance = (customerId: string, delta: number, reason: string) => {
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        return {
          ...c,
          emptyContainersHeld: Math.max(0, c.emptyContainersHeld + delta),
        };
      }
      return c;
    });
    setCustomers(updated);
    StorageService.saveCustomers(updated);
  };

  // Products Handlers
  const handleSaveProduct = (prod: Product) => {
    const exists = products.some((p) => p.id === prod.id);
    const updated = exists ? products.map((p) => (p.id === prod.id ? prod : p)) : [prod, ...products];
    setProducts(updated);
    StorageService.saveProducts(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    StorageService.saveProducts(updated);
    SupabaseSync.deleteProduct(productId);
  };

  // Broken Products Handlers
  const handleAddBroken = (record: BrokenProduct) => {
    const updated = [record, ...brokenProducts];
    setBrokenProducts(updated);
    StorageService.saveBrokenProducts(updated);
  };

  const handleDeleteBroken = (id: string) => {
    const updated = brokenProducts.filter((b) => b.id !== id);
    setBrokenProducts(updated);
    StorageService.saveBrokenProducts(updated);
    SupabaseSync.deleteBroken(id);
  };

  // Expenses Handlers
  const handleAddExpense = (exp: OperationalExpense) => {
    const updated = [exp, ...expenses];
    setExpenses(updated);
    StorageService.saveExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    StorageService.saveExpenses(updated);
    SupabaseSync.deleteExpense(id);
  };

  // Suppliers Handlers
  const handleSaveSupplier = (sup: Supplier) => {
    const exists = suppliers.some((s) => s.id === sup.id);
    const updated = exists ? suppliers.map((s) => (s.id === sup.id ? sup : s)) : [sup, ...suppliers];
    setSuppliers(updated);
    StorageService.saveSuppliers(updated);
  };

  const handleDeleteSupplier = (id: string) => {
    const updated = suppliers.filter((s) => s.id !== id);
    setSuppliers(updated);
    StorageService.saveSuppliers(updated);
    SupabaseSync.deleteSupplier(id);
  };

  // Debt Payment Handler
  const handleRecordPayment = (payment: CustomerPayment) => {
    const updatedPayments = [payment, ...payments];
    setPayments(updatedPayments);
    StorageService.savePayments(updatedPayments);

    // Deduct debt from customer
    const cust = customers.find((c) => c.id === payment.customerId);
    if (cust) {
      const updatedCust: Customer = {
        ...cust,
        totalDebtUsd: Math.max(0, Number((cust.totalDebtUsd - payment.equivalentUsd).toFixed(2))),
      };
      const updatedCustomers = customers.map((c) => (c.id === cust.id ? updatedCust : c));
      setCustomers(updatedCustomers);
      StorageService.saveCustomers(updatedCustomers);
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    const target = payments.find((p) => p.id === paymentId);
    const updated = payments.filter((p) => p.id !== paymentId);
    setPayments(updated);
    StorageService.savePayments(updated);
    SupabaseSync.deletePayment(paymentId);

    // Revert debt back to customer
    if (target) {
      const cust = customers.find((c) => c.id === target.customerId);
      if (cust) {
        const updatedCust: Customer = {
          ...cust,
          totalDebtUsd: Number((cust.totalDebtUsd + target.equivalentUsd).toFixed(2)),
        };
        const updatedCustomers = customers.map((c) => (c.id === cust.id ? updatedCust : c));
        setCustomers(updatedCustomers);
        StorageService.saveCustomers(updatedCustomers);
      }
    }
  };

  // Settings Handlers
  const handleSaveSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleUpdateExchangeRate = (newRate: number) => {
    const newSettings = { ...settings, exchangeRateKhrPerUsd: newRate };
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleResetData = () => {
    StorageService.resetFactoryData();
    setProducts(StorageService.getProducts());
    setCustomers(StorageService.getCustomers());
    setOrders([]);
    setBrokenProducts(StorageService.getBrokenProducts());
    setExpenses(StorageService.getExpenses());
    setSuppliers(StorageService.getSuppliers());
    setPayments([]);
    setSettings(StorageService.getSettings());
    setUsers(StorageService.getUsers());
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">កំពុងដំណើរការប្រព័ន្ធរោងចក្រទឹក...</p>
        </div>
      </div>
    );
  }

  // Count uncollected debtors & bottle holders for badges
  const uncollectedDebtCount = customers.filter((c) => c.totalDebtUsd > 0).length;
  const emptyBottleHoldersCount = customers.filter((c) => c.emptyContainersHeld > 0).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header Bar */}
      <HeaderBar
        settings={settings}
        activeUser={activeUser}
        onOpenPos={() => {
          setActiveModule('pos');
          setIsMobileDrawerOpen(false);
        }}
        onUpdateRate={handleUpdateExchangeRate}
        onToggleMobileMenu={() => setIsMobileDrawerOpen((prev) => !prev)}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (Desktop + Mobile Slide-over Drawer) */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => {
            setActiveModule(mod);
            setIsMobileDrawerOpen(false);
          }}
          uncollectedDebtCount={uncollectedDebtCount}
          emptyBottleHoldersCount={emptyBottleHoldersCount}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Dynamic Content Pane for the 11 Modules (responsive padding with pb-24 for mobile nav bar) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-slate-950/60 pb-24 lg:pb-6">
          {activeModule === 'dashboard' && (
            <DashboardView
              orders={orders}
              customers={customers}
              expenses={expenses}
              brokenProducts={brokenProducts}
              settings={settings}
              onNavigate={setActiveModule}
            />
          )}

          {activeModule === 'pos' && (
            <PosView
              products={products}
              customers={customers}
              settings={settings}
              activeUser={activeUser}
              onCompleteOrder={handleCompleteOrder}
              onAddCustomer={handleSaveCustomer}
            />
          )}

          {activeModule === 'orders' && (
            <OrderHistoryView
              orders={orders}
              settings={settings}
              onCancelOrder={handleCancelOrder}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeModule === 'products' && (
            <ProductsView
              products={products}
              settings={settings}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeModule === 'broken' && (
            <BrokenProductsView
              brokenProducts={brokenProducts}
              products={products}
              activeUser={activeUser}
              onAddBroken={handleAddBroken}
              onDeleteBroken={handleDeleteBroken}
            />
          )}

          {activeModule === 'customers' && (
            <CustomersView
              customers={customers}
              settings={settings}
              onSaveCustomer={handleSaveCustomer}
              onAdjustBottleBalance={handleAdjustBottleBalance}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeModule === 'debt' && (
            <DebtView
              customers={customers}
              payments={payments}
              settings={settings}
              activeUser={activeUser}
              onRecordPayment={handleRecordPayment}
              onDeletePayment={handleDeletePayment}
            />
          )}

          {activeModule === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              settings={settings}
              activeUser={activeUser}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeModule === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              onSaveSupplier={handleSaveSupplier}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}

          {activeModule === 'reports' && (
            <ReportsView
              orders={orders}
              expenses={expenses}
              brokenProducts={brokenProducts}
              customers={customers}
              settings={settings}
            />
          )}

          {activeModule === 'settings' && (
            <SettingsView
              settings={settings}
              users={users}
              activeUser={activeUser}
              onSaveSettings={handleSaveSettings}
              onSwitchUser={setActiveUser}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Modern Responsive Mobile Bottom Navigation Bar (< lg devices) */}
      <MobileBottomNav
        activeModule={activeModule}
        onSelectModule={(mod) => {
          setActiveModule(mod);
          setIsMobileDrawerOpen(false);
        }}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        isMobileDrawerOpen={isMobileDrawerOpen}
        uncollectedDebtCount={uncollectedDebtCount}
        emptyBottleHoldersCount={emptyBottleHoldersCount}
      />
    </div>
  );
}
