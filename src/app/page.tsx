'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StorageService, DEFAULT_CLEAN_SETTINGS, DEFAULT_CLEAN_USER } from '@/lib/storage';
import { SupabaseService } from '@/lib/supabase-service';
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
  ContainerUnitItem,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarFixed, setIsSidebarFixed] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // If sidebar is fixed, it stays open; if unpinned/not-fixed, auto-collapse on POS
  const handleSelectModule = (mod: ActiveModule) => {
    setActiveModule(mod);
    setIsMobileDrawerOpen(false);
    if (!isSidebarFixed && mod === 'pos') {
      setIsSidebarCollapsed(true);
    } else if (!isSidebarFixed && isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  // Core Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [brokenProducts, setBrokenProducts] = useState<BrokenProduct[]>([]);
  const [expenses, setExpenses] = useState<OperationalExpense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_CLEAN_SETTINGS);
  const [users, setUsers] = useState<UserAccount[]>([DEFAULT_CLEAN_USER]);
  const [activeUser, setActiveUser] = useState<UserAccount>(DEFAULT_CLEAN_USER);
  const [containerUnits, setContainerUnits] = useState<ContainerUnitItem[]>([]);

  // Load live data from Supabase Cloud Database on Mount
  const loadDataFromSupabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      // 1. Purge legacy demo data from local storage if present
      const cachedProducts = StorageService.getProducts();
      const hasLegacyDemo = cachedProducts.some((p) => p.id === 'prod-1' || p.id === 'prod-2');
      if (hasLegacyDemo) {
        StorageService.clearLocalDemoData();
      }

      // 2. Fetch fresh live records directly from Supabase
      const [
        dbProducts,
        dbCustomers,
        dbOrders,
        dbBroken,
        dbExpenses,
        dbSuppliers,
        dbPayments,
        dbSettings,
        dbUsers,
        dbUnits,
      ] = await Promise.all([
        SupabaseService.fetchProducts(),
        SupabaseService.fetchCustomers(),
        SupabaseService.fetchOrders(),
        SupabaseService.fetchBrokenProducts(),
        SupabaseService.fetchExpenses(),
        SupabaseService.fetchSuppliers(),
        SupabaseService.fetchPayments(),
        SupabaseService.fetchSettings(),
        SupabaseService.fetchUsers(),
        SupabaseService.fetchContainerUnits(),
      ]);

      setProducts(dbProducts);
      setCustomers(dbCustomers);
      setOrders(dbOrders);
      setBrokenProducts(dbBroken);
      setExpenses(dbExpenses);
      setSuppliers(dbSuppliers);
      setPayments(dbPayments);
      if (dbSettings) setSettings(dbSettings);
      if (dbUsers.length > 0) {
        setUsers(dbUsers);
        setActiveUser(dbUsers[0]);
      }
      setContainerUnits(dbUnits);

      // 3. Cache clean database rows locally
      StorageService.saveProducts(dbProducts);
      StorageService.saveCustomers(dbCustomers);
      StorageService.saveOrders(dbOrders);
      StorageService.saveBrokenProducts(dbBroken);
      StorageService.saveExpenses(dbExpenses);
      StorageService.saveSuppliers(dbSuppliers);
      StorageService.savePayments(dbPayments);
      if (dbSettings) StorageService.saveSettings(dbSettings);
      if (dbUsers.length > 0) StorageService.saveUsers(dbUsers);
      StorageService.saveContainerUnits(dbUnits);
    } catch (e) {
      console.error('Failed to load data from Supabase:', e);
    } finally {
      setIsLoaded(true);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadDataFromSupabase();
  }, [loadDataFromSupabase]);

  // Handlers for POS & Orders
  const handleCompleteOrder = async (newOrder: Order, updatedCustomer?: Customer) => {
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

    // Persist to Supabase Cloud Database
    await SupabaseService.createOrder(newOrder, activeUser.id);
  };

  const handleCancelOrder = async (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status === 'cancelled') return;

    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'cancelled' as const } : o
    );
    setOrders(updatedOrders);
    StorageService.saveOrders(updatedOrders);

    // Rollback customer debt and bottle balance locally
    const bottleDiff = targetOrder.containersDelivered20L - targetOrder.containersReturned20L;
    const cust = customers.find((c) => c.id === targetOrder.customerId);
    if (cust) {
      const updatedCust: Customer = {
        ...cust,
        totalDebtUsd: Math.max(0, Number((cust.totalDebtUsd - targetOrder.remainingDebtUsd).toFixed(2))),
        emptyContainersHeld: Math.max(0, cust.emptyContainersHeld - bottleDiff),
      };
      const updatedCustomers = customers.map((c) => (c.id === cust.id ? updatedCust : c));
      setCustomers(updatedCustomers);
      StorageService.saveCustomers(updatedCustomers);
    }

    // Persist to Supabase
    await SupabaseService.cancelOrder(
      orderId,
      targetOrder.customerId,
      targetOrder.remainingDebtUsd,
      bottleDiff
    );
  };

  const handleDeleteOrder = async (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    StorageService.saveOrders(updated);
    await SupabaseService.deleteOrder(orderId);
  };

  // Customers Handlers
  const handleSaveCustomer = async (cust: Customer) => {
    const exists = customers.some((c) => c.id === cust.id);
    const updated = exists ? customers.map((c) => (c.id === cust.id ? cust : c)) : [cust, ...customers];
    setCustomers(updated);
    StorageService.saveCustomers(updated);

    // Persist to Supabase
    const saved = await SupabaseService.saveCustomer(cust);
    if (saved && saved.id !== cust.id) {
      // Update ID if newly generated
      const refreshed = updated.map((c) => (c.id === cust.id ? saved : c));
      setCustomers(refreshed);
      StorageService.saveCustomers(refreshed);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    const updated = customers.filter((c) => c.id !== customerId);
    setCustomers(updated);
    StorageService.saveCustomers(updated);
    await SupabaseService.deleteCustomer(customerId);
  };

  const handleAdjustBottleBalance = async (customerId: string, delta: number, reason: string) => {
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
    await SupabaseService.adjustCustomerBottleBalance(customerId, delta);
  };

  // Products Handlers
  const handleSaveProduct = async (prod: Product) => {
    const exists = products.some((p) => p.id === prod.id);
    const updated = exists ? products.map((p) => (p.id === prod.id ? prod : p)) : [prod, ...products];
    setProducts(updated);
    StorageService.saveProducts(updated);

    // Persist to Supabase
    const saved = await SupabaseService.saveProduct(prod);
    if (saved && saved.id !== prod.id) {
      const refreshed = updated.map((p) => (p.id === prod.id ? saved : p));
      setProducts(refreshed);
      StorageService.saveProducts(refreshed);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    StorageService.saveProducts(updated);
    await SupabaseService.deleteProduct(productId);
  };

  // Container Units Handlers (Dynamic Packaging & Units)
  const handleSaveContainerUnit = async (
    unitItem: ContainerUnitItem
  ): Promise<boolean | ContainerUnitItem | null> => {
    const exists = containerUnits.some((u) => u.id === unitItem.id || u.code === unitItem.code);
    const updated = exists
      ? containerUnits.map((u) => (u.id === unitItem.id || u.code === unitItem.code ? unitItem : u))
      : [...containerUnits, unitItem];
    setContainerUnits(updated);
    StorageService.saveContainerUnits(updated);

    const saved = await SupabaseService.saveContainerUnit(unitItem);
    if (saved) {
      let refreshed = updated.map((u) =>
        u.id === unitItem.id || u.code === unitItem.code ? saved : u
      );
      if (saved.isDefault) {
        refreshed = refreshed.map((u) => (u.id === saved.id ? u : { ...u, isDefault: false }));
      }
      setContainerUnits(refreshed);
      StorageService.saveContainerUnits(refreshed);
      return saved;
    }
    return false;
  };

  const handleDeleteContainerUnit = async (unitId: string): Promise<boolean> => {
    const targetUnit = containerUnits.find((u) => u.id === unitId);
    if (!targetUnit) return false;

    // Safety: check if any product is using this unit
    const isUsed = products.some((p) => p.unit === targetUnit.code);
    if (isUsed) {
      return false;
    }

    const updated = containerUnits.filter((u) => u.id !== unitId);
    setContainerUnits(updated);
    StorageService.saveContainerUnits(updated);

    const ok = await SupabaseService.deleteContainerUnit(unitId);
    return ok;
  };

  // Broken Products Handlers
  const handleAddBroken = async (record: BrokenProduct) => {
    const updated = [record, ...brokenProducts];
    setBrokenProducts(updated);
    StorageService.saveBrokenProducts(updated);
    await SupabaseService.addBrokenProduct(record, activeUser.id);
  };

  const handleDeleteBroken = async (id: string) => {
    const updated = brokenProducts.filter((b) => b.id !== id);
    setBrokenProducts(updated);
    StorageService.saveBrokenProducts(updated);
    await SupabaseService.deleteBrokenProduct(id);
  };

  // Expenses Handlers
  const handleAddExpense = async (exp: OperationalExpense) => {
    const updated = [exp, ...expenses];
    setExpenses(updated);
    StorageService.saveExpenses(updated);
    await SupabaseService.addExpense(exp, activeUser.id);
  };

  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    StorageService.saveExpenses(updated);
    await SupabaseService.deleteExpense(id);
  };

  // Suppliers Handlers
  const handleSaveSupplier = async (sup: Supplier) => {
    const exists = suppliers.some((s) => s.id === sup.id);
    const updated = exists ? suppliers.map((s) => (s.id === sup.id ? sup : s)) : [sup, ...suppliers];
    setSuppliers(updated);
    StorageService.saveSuppliers(updated);

    // Persist to Supabase
    const saved = await SupabaseService.saveSupplier(sup);
    if (saved && saved.id !== sup.id) {
      const refreshed = updated.map((s) => (s.id === sup.id ? saved : s));
      setSuppliers(refreshed);
      StorageService.saveSuppliers(refreshed);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    const updated = suppliers.filter((s) => s.id !== id);
    setSuppliers(updated);
    StorageService.saveSuppliers(updated);
    await SupabaseService.deleteSupplier(id);
  };

  // Debt Payment Handler
  const handleRecordPayment = async (payment: CustomerPayment) => {
    const updatedPayments = [payment, ...payments];
    setPayments(updatedPayments);
    StorageService.savePayments(updatedPayments);

    // Deduct debt from customer locally
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

    // Persist to Supabase
    await SupabaseService.recordPayment(payment, activeUser.id);
  };

  const handleDeletePayment = async (paymentId: string) => {
    const target = payments.find((p) => p.id === paymentId);
    const updated = payments.filter((p) => p.id !== paymentId);
    setPayments(updated);
    StorageService.savePayments(updated);

    // Revert debt back to customer locally
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
      await SupabaseService.deletePayment(paymentId, target.customerId, target.equivalentUsd);
    } else {
      await SupabaseService.deletePayment(paymentId);
    }
  };

  // Settings Handlers
  const handleSaveSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    await SupabaseService.saveSettings(newSettings);
  };

  const handleUpdateExchangeRate = async (newRate: number) => {
    const newSettings = { ...settings, exchangeRateKhrPerUsd: newRate };
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    await SupabaseService.saveSettings(newSettings);
  };

  const handleResetData = async () => {
    StorageService.clearLocalDemoData();
    await loadDataFromSupabase();
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">កំពុងទាញយកទិន្នន័យពី Supabase Database...</p>
        </div>
      </div>
    );
  }

  // Count uncollected debtors & bottle holders for badges
  const uncollectedDebtCount = customers.filter((c) => c.totalDebtUsd > 0).length;
  const emptyBottleHoldersCount = customers.filter((c) => c.emptyContainersHeld > 0).length;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header Bar */}
      <HeaderBar
        settings={settings}
        activeUser={activeUser}
        onOpenPos={() => handleSelectModule('pos')}
        onUpdateRate={handleUpdateExchangeRate}
        onToggleMobileMenu={() => setIsMobileDrawerOpen((prev) => !prev)}
      />

      {/* Main Workspace with Fixed Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar (Desktop Fixed Sidebar + Mobile Slide-over Drawer) */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          uncollectedDebtCount={uncollectedDebtCount}
          emptyBottleHoldersCount={emptyBottleHoldersCount}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => {
            setIsSidebarCollapsed((prev) => !prev);
            if (!isSidebarCollapsed) {
              setIsSidebarFixed(false);
            }
          }}
          isFixed={isSidebarFixed}
          onToggleFixed={() => {
            setIsSidebarFixed((prev) => {
              const next = !prev;
              if (next) setIsSidebarCollapsed(false);
              return next;
            });
          }}
        />

        {/* Dynamic Content Pane for the 11 Modules (responsive padding with pb-24 for mobile nav bar) */}
        <main className="flex-1 h-full overflow-y-auto p-3 sm:p-4 lg:p-6 bg-slate-950/60 pb-24 lg:pb-6">
          {activeModule === 'dashboard' && (
            <DashboardView
              orders={orders}
              customers={customers}
              expenses={expenses}
              brokenProducts={brokenProducts}
              settings={settings}
              onNavigate={handleSelectModule}
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
              containerUnits={containerUnits}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onSaveContainerUnit={handleSaveContainerUnit}
              onDeleteContainerUnit={handleDeleteContainerUnit}
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
              containerUnits={containerUnits}
              products={products}
              onSaveSettings={handleSaveSettings}
              onSwitchUser={setActiveUser}
              onResetData={handleResetData}
              onSaveContainerUnit={handleSaveContainerUnit}
              onDeleteContainerUnit={handleDeleteContainerUnit}
            />
          )}
        </main>
      </div>

      {/* Modern Responsive Mobile Bottom Navigation Bar (< lg devices) */}
      <MobileBottomNav
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        isMobileDrawerOpen={isMobileDrawerOpen}
        uncollectedDebtCount={uncollectedDebtCount}
        emptyBottleHoldersCount={emptyBottleHoldersCount}
      />
    </div>
  );
}
