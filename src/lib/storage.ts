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
import { DEFAULT_EXCHANGE_RATE } from './financial-engine';

const STORAGE_KEYS = {
  PRODUCTS: 'srp_water_products',
  CUSTOMERS: 'srp_water_customers',
  ORDERS: 'srp_water_orders',
  BROKEN: 'srp_water_broken',
  EXPENSES: 'srp_water_expenses',
  SUPPLIERS: 'srp_water_suppliers',
  PAYMENTS: 'srp_water_payments',
  SETTINGS: 'srp_water_settings',
  USERS: 'srp_water_users',
  CONTAINER_UNITS: 'srp_water_container_units',
};

// Clean defaults - strictly NO demo or mock data
export const DEFAULT_CLEAN_SETTINGS: SystemSettings = {
  factoryNameKh: 'សហគ្រាសផលិតទឹកបរិសុទ្ធ អេស អរ ភី',
  factoryNameEn: 'SRP Pure Water Factory',
  phoneNumber: '',
  addressKh: '',
  exchangeRateKhrPerUsd: DEFAULT_EXCHANGE_RATE,
  receiptFooterKh: 'សូមអរគុណ! សូមពិនិត្យទំនិញ និងចំនួនសំបកធុងមុនពេលទទួល។',
  enableKhqr: true,
  khqrMerchantName: 'SRP PURIFIED WATER FACTORY',
};

export const DEFAULT_CLEAN_USER: UserAccount = {
  id: '',
  username: 'admin',
  fullName: 'អ្នកគ្រប់គ្រង',
  role: 'admin',
  phoneNumber: '',
  isActive: true,
};

// Helper to safely access LocalStorage as cache
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('LocalStorage read error for key:', key, e);
    return fallback;
  }
}

function setItem<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write error for key:', key, e);
  }
}

export const StorageService = {
  getProducts(): Product[] {
    return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  },
  saveProducts(products: Product[]): void {
    setItem(STORAGE_KEYS.PRODUCTS, products);
  },

  getCustomers(): Customer[] {
    return getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  },
  saveCustomers(customers: Customer[]): void {
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
  },

  getOrders(): Order[] {
    return getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  },
  saveOrders(orders: Order[]): void {
    setItem(STORAGE_KEYS.ORDERS, orders);
  },

  getBrokenProducts(): BrokenProduct[] {
    return getItem<BrokenProduct[]>(STORAGE_KEYS.BROKEN, []);
  },
  saveBrokenProducts(broken: BrokenProduct[]): void {
    setItem(STORAGE_KEYS.BROKEN, broken);
  },

  getExpenses(): OperationalExpense[] {
    return getItem<OperationalExpense[]>(STORAGE_KEYS.EXPENSES, []);
  },
  saveExpenses(expenses: OperationalExpense[]): void {
    setItem(STORAGE_KEYS.EXPENSES, expenses);
  },

  getSuppliers(): Supplier[] {
    return getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
  },
  saveSuppliers(suppliers: Supplier[]): void {
    setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
  },

  getPayments(): CustomerPayment[] {
    return getItem<CustomerPayment[]>(STORAGE_KEYS.PAYMENTS, []);
  },
  savePayments(payments: CustomerPayment[]): void {
    setItem(STORAGE_KEYS.PAYMENTS, payments);
  },

  getSettings(): SystemSettings {
    return getItem<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_CLEAN_SETTINGS);
  },
  saveSettings(settings: SystemSettings): void {
    setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  getUsers(): UserAccount[] {
    return getItem<UserAccount[]>(STORAGE_KEYS.USERS, []);
  },
  saveUsers(users: UserAccount[]): void {
    setItem(STORAGE_KEYS.USERS, users);
  },

  getContainerUnits(): ContainerUnitItem[] {
    return getItem<ContainerUnitItem[]>(STORAGE_KEYS.CONTAINER_UNITS, []);
  },
  saveContainerUnits(units: ContainerUnitItem[]): void {
    setItem(STORAGE_KEYS.CONTAINER_UNITS, units);
  },

  /**
   * Purge all local storage keys to ensure NO demo data persists on device
   */
  clearLocalDemoData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        console.error('Failed to clear key:', k, e);
      }
    });
  },

  /**
   * Reset store cleanly without adding demo data
   */
  resetFactoryData(): void {
    this.clearLocalDemoData();
  },
};
