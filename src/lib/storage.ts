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
import { DEFAULT_EXCHANGE_RATE, roundKhr } from './financial-engine';

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
};

// Seed Products (Finished bottled water only - strictly no raw materials)
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    productCode: 'W20L-REF',
    nameKh: 'ទឹកធុង ២០លីត្រ (ប្តូរសំបក)',
    nameEn: '20L Container Refill',
    unit: 'container_20l',
    unitCostUsd: 0.25,
    salePriceUsd: 0.75,
    salePriceKhr: 3000,
    isRefill20l: true,
    isActive: true,
  },
  {
    id: 'prod-2',
    productCode: 'W20L-NEW',
    nameKh: 'ទឹកធុង ២០លីត្រ (ទិញទាំងសំបក)',
    nameEn: '20L Container with New Bottle',
    unit: 'container_20l',
    unitCostUsd: 2.80,
    salePriceUsd: 5.00,
    salePriceKhr: 20500,
    isRefill20l: true,
    isActive: true,
  },
  {
    id: 'prod-3',
    productCode: 'B350-PK',
    nameKh: 'ទឹកដប ៣៥០មល (១យួរ = ២៤ដប)',
    nameEn: '350ml Bottled Pack (24 bottles)',
    unit: 'pack_350ml',
    unitCostUsd: 1.20,
    salePriceUsd: 2.20,
    salePriceKhr: 9000,
    isRefill20l: false,
    isActive: true,
  },
  {
    id: 'prod-4',
    productCode: 'B500-PK',
    nameKh: 'ទឹកដប ៥០០មល (១យួរ = ២៤ដប)',
    nameEn: '500ml Bottled Pack (24 bottles)',
    unit: 'pack_500ml',
    unitCostUsd: 1.40,
    salePriceUsd: 2.50,
    salePriceKhr: 10000,
    isRefill20l: false,
    isActive: true,
  },
  {
    id: 'prod-5',
    productCode: 'B1500-PK',
    nameKh: 'ទឹកដប ១៥០០មល (១យួរ = ១២ដប)',
    nameEn: '1500ml Bottled Pack (12 bottles)',
    unit: 'pack_1500ml',
    unitCostUsd: 1.50,
    salePriceUsd: 2.75,
    salePriceKhr: 11000,
    isRefill20l: false,
    isActive: true,
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-retail',
    customerCode: 'CUST-000',
    fullName: 'អតិថិជនទូទៅ (Walk-in)',
    phoneNumber: '000000000',
    deliveryAddress: 'ទិញផ្ទាល់នៅរោងចក្រ',
    totalDebtUsd: 0,
    totalDebtKhr: 0,
    emptyContainersHeld: 0,
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'cust-1',
    customerCode: 'CUST-001',
    fullName: 'ភោជនីយដ្ឋាន ម្លប់ត្រជាក់',
    phoneNumber: '012 345 678',
    deliveryAddress: 'ផ្ទះលេខ ១២ ផ្លូវ ២៧១ សង្កាត់បឹងទំពុន',
    totalDebtUsd: 22.50,
    totalDebtKhr: 92000,
    emptyContainersHeld: 18,
    notes: 'ដឹកទឹក ២ថ្ងៃម្តង ពេលព្រឹកម៉ោង ៨',
    isActive: true,
    createdAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'cust-2',
    customerCode: 'CUST-002',
    fullName: 'ការដ្ឋានសំណង់ សុខសាន្ត',
    phoneNumber: '098 888 777',
    deliveryAddress: 'គម្រោងបុរីវិមានថ្មី ចោមចៅ',
    totalDebtUsd: 45.00,
    totalDebtKhr: 184500,
    emptyContainersHeld: 35,
    notes: 'ទូទាត់លុយរៀងរាល់ចុងខែ',
    isActive: true,
    createdAt: '2026-02-15T09:30:00Z',
  },
  {
    id: 'cust-3',
    customerCode: 'CUST-003',
    fullName: 'សាលាបឋមសិក្សា វត្តបូព៌',
    phoneNumber: '088 123 4567',
    deliveryAddress: 'ភូមិវត្តបូព៌ សង្កាត់សាលាកំរើក',
    totalDebtUsd: 0,
    totalDebtKhr: 0,
    emptyContainersHeld: 14,
    notes: 'បង់លុយសុទ្ធគ្រប់ពេលដឹក',
    isActive: true,
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'cust-4',
    customerCode: 'CUST-004',
    fullName: 'ម៉ាត ២៤ម៉ោង ផ្សារលើ',
    phoneNumber: '077 999 111',
    deliveryAddress: 'ក្បែររង្វង់មូលផ្សារលើ',
    totalDebtUsd: 15.00,
    totalDebtKhr: 61500,
    emptyContainersHeld: 8,
    isActive: true,
    createdAt: '2026-03-01T11:00:00Z',
  },
];

const INITIAL_EXPENSES: OperationalExpense[] = [
  {
    id: 'exp-1',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'electricity',
    title: 'ថ្លៃអគ្គិសនីរោងចក្រទឹក (EDC)',
    amountUsd: 185.00,
    amountKhr: 758500,
    totalEquivalentUsd: 185.00,
    paidTo: 'អគ្គិសនីកម្ពុជា EDC',
    approvedBy: 'អ្នកគ្រប់គ្រងរោងចក្រ',
    notes: 'វិក្កយបត្រភ្លើងប្រចាំខែ',
  },
  {
    id: 'exp-2',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'fuel',
    title: 'ប្រេងម៉ាស៊ូតឡានដឹកទឹក ២០លីត្រ',
    amountUsd: 45.00,
    amountKhr: 184500,
    totalEquivalentUsd: 45.00,
    paidTo: 'ស្ថានីយ៍ប្រេង តេលា',
    approvedBy: 'អ្នកបើកបរ វណ្ណា',
    notes: 'ចាក់ប្រេងពេញធុង',
  },
  {
    id: 'exp-3',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'salary',
    title: 'ប្រាក់ឈ្នួលអ្នកដឹកជញ្ជូនទឹកប្រចាំថ្ងៃ',
    amountUsd: 20.00,
    amountKhr: 82000,
    totalEquivalentUsd: 20.00,
    paidTo: 'តៃកុងឡាន និងព្រូ',
    approvedBy: 'គិតលុយ',
  },
  {
    id: 'exp-4',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'maintenance',
    title: 'ប្តូរស្នូលតម្រងចម្រោះកាបូន និងខ្សាច់ Quartz',
    amountUsd: 35.00,
    amountKhr: 143500,
    totalEquivalentUsd: 35.00,
    paidTo: 'ជាង សុវណ្ណ',
    approvedBy: 'មេជាងរោងចក្រ',
  },
];

const INITIAL_BROKEN: BrokenProduct[] = [
  {
    id: 'brk-1',
    incidentDate: new Date().toISOString().split('T')[0],
    productId: 'prod-2',
    productNameKh: 'ទឹកធុង ២០លីត្រ (ទិញទាំងសំបក)',
    quantity: 4,
    unitCostUsd: 2.80,
    totalLossUsd: 11.20,
    reason: 'delivery_leak',
    reportedBy: 'អ្នកបើកបរ វណ្ណា',
    notes: 'បែកបាតធុងពេលដឹកជញ្ជូនលើផ្លូវរលាក់',
  },
  {
    id: 'brk-2',
    incidentDate: new Date().toISOString().split('T')[0],
    productId: 'prod-4',
    productNameKh: 'ទឹកដប ៥០០មល (១យួរ = ២៤ដប)',
    quantity: 2,
    unitCostUsd: 1.40,
    totalLossUsd: 2.80,
    reason: 'loading_crack',
    reportedBy: 'អ្នកលើកទឹក',
    notes: 'ជ្រុះបែកពេលលើកដាក់ឡាន',
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    supplierName: 'រោងចក្រផ្លុំសំបកធុង និងគម្រប ជ័យជំនះ',
    contactPerson: 'លោក ជ័យ',
    phoneNumber: '012 888 999',
    serviceType: 'ផ្គត់ផ្គង់សំបកធុង ២០L និងគម្របស្អាត',
    address: 'ផ្លូវជាតិលេខ ៤ កំបូល ភ្នំពេញ',
  },
  {
    id: 'sup-2',
    supplierName: 'ជាងម៉ាស៊ីនចម្រោះទឹក RO សុវណ្ណ',
    contactPerson: 'ជាង សុវណ្ណ',
    phoneNumber: '098 777 666',
    serviceType: 'ជួសជុល ថែទាំប្រព័ន្ធ RO & UV',
    address: 'សង្កាត់ទួលសង្កែ ខណ្ឌឫស្សីកែវ',
  },
  {
    id: 'sup-3',
    supplierName: 'រោងពុម្ពតែមស្លាកសញ្ញា ភ្នំពេញ',
    contactPerson: 'អ្នកស្រី រចនា',
    phoneNumber: '077 555 444',
    serviceType: 'បោះពុម្ពតែមស្ទីកឃ័រ និងស្រោមបង្រួមកម្ដៅ',
    address: 'ផ្សារដេប៉ូ ខណ្ឌទួលគោក',
  },
];

const INITIAL_SETTINGS: SystemSettings = {
  factoryNameKh: 'សហគ្រាសផលិតទឹកបរិសុទ្ធ អេស អរ ភី',
  factoryNameEn: 'SRP Pure Water Factory',
  phoneNumber: '012 333 444 / 098 555 666',
  addressKh: 'ភូមិព្រៃទា សង្កាត់ចោមចៅ ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ',
  exchangeRateKhrPerUsd: DEFAULT_EXCHANGE_RATE,
  receiptFooterKh: 'សូមអរគុណ! សូមពិនិត្យទំនិញ និងចំនួនសំបកធុងមុនពេលទទួល។',
  enableKhqr: true,
  khqrMerchantName: 'SRP PURIFIED WATER FACTORY',
};

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    username: 'admin',
    fullName: 'អ្នកគ្រប់គ្រងទូទៅ (Admin)',
    role: 'admin',
    phoneNumber: '012 333 444',
    isActive: true,
  },
  {
    id: 'usr-2',
    username: 'cashier1',
    fullName: 'បុគ្គលិកគិតលុយ (Cashier)',
    role: 'cashier',
    phoneNumber: '098 111 222',
    isActive: true,
  },
  {
    id: 'usr-3',
    username: 'driver1',
    fullName: 'អ្នកដឹកជញ្ជូន វណ្ណា (Driver)',
    role: 'driver',
    phoneNumber: '077 444 333',
    isActive: true,
  },
];

// Helper to safely access LocalStorage
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
    return getItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProducts(products: Product[]): void {
    setItem(STORAGE_KEYS.PRODUCTS, products);
  },

  getCustomers(): Customer[] {
    return getItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },
  saveCustomers(customers: Customer[]): void {
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
  },

  getOrders(): Order[] {
    return getItem(STORAGE_KEYS.ORDERS, []);
  },
  saveOrders(orders: Order[]): void {
    setItem(STORAGE_KEYS.ORDERS, orders);
  },

  getBrokenProducts(): BrokenProduct[] {
    return getItem(STORAGE_KEYS.BROKEN, INITIAL_BROKEN);
  },
  saveBrokenProducts(broken: BrokenProduct[]): void {
    setItem(STORAGE_KEYS.BROKEN, broken);
  },

  getExpenses(): OperationalExpense[] {
    return getItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  },
  saveExpenses(expenses: OperationalExpense[]): void {
    setItem(STORAGE_KEYS.EXPENSES, expenses);
  },

  getSuppliers(): Supplier[] {
    return getItem(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  },
  saveSuppliers(suppliers: Supplier[]): void {
    setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
  },

  getPayments(): CustomerPayment[] {
    return getItem(STORAGE_KEYS.PAYMENTS, []);
  },
  savePayments(payments: CustomerPayment[]): void {
    setItem(STORAGE_KEYS.PAYMENTS, payments);
  },

  getSettings(): SystemSettings {
    return getItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  saveSettings(settings: SystemSettings): void {
    setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  getUsers(): UserAccount[] {
    return getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  saveUsers(users: UserAccount[]): void {
    setItem(STORAGE_KEYS.USERS, users);
  },

  /**
   * Reset store to initial factory seed data
   */
  resetFactoryData(): void {
    if (typeof window === 'undefined') return;
    setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    setItem(STORAGE_KEYS.ORDERS, []);
    setItem(STORAGE_KEYS.BROKEN, INITIAL_BROKEN);
    setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    setItem(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    setItem(STORAGE_KEYS.PAYMENTS, []);
    setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
};
