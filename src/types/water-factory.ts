export type UserRole = 'admin' | 'cashier' | 'driver';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type PaymentMethod = 'cash_khr' | 'cash_usd' | 'khqr' | 'credit';
export type ContainerUnit = 'container_20l' | 'pack_350ml' | 'pack_500ml' | 'pack_1500ml' | 'bottle_custom';
export type ExpenseCategory = 'electricity' | 'fuel' | 'salary' | 'maintenance' | 'misc';
export type DamageReason = 'delivery_leak' | 'factory_defect' | 'loading_crack' | 'customer_return';

export interface Product {
  id: string;
  productCode: string;
  nameKh: string;
  nameEn: string;
  unit: ContainerUnit;
  retailPriceKhr: number; // តម្លៃរាយ (គិតជារៀល)
  wholesalePriceKhr: number; // តម្លៃដុំ (គិតជារៀល)
  retailPriceUsd?: number;
  wholesalePriceUsd?: number;
  salePriceKhr: number; // Alias to retailPriceKhr
  salePriceUsd: number; // USD equivalent
  unitCostUsd?: number; // Removed from UI, kept optional for DB compatibility
  isRefill20l: boolean;
  isActive: boolean;
}

export interface Customer {
  id: string;
  customerCode: string;
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  totalDebtUsd: number;
  totalDebtKhr: number;
  emptyContainersHeld: number; // ចំនួនសំបកធុង ២០លីត្រ ដែលអតិថិជនកាន់កាប់
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productNameKh: string;
  unit: ContainerUnit;
  quantity: number;
  unitCostUsd: number;
  unitPriceUsd: number;
  unitPriceKhr: number;
  totalUsd: number;
  totalKhr: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  cashierName: string;
  orderDate: string; // ISO date
  status: 'completed' | 'cancelled';
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  exchangeRate: number;
  subtotalUsd: number;
  discountUsd: number;
  grandTotalUsd: number;
  grandTotalKhr: number;
  paidAmountUsd: number;
  paidAmountKhr: number;
  remainingDebtUsd: number;
  containersDelivered20L: number;
  containersReturned20L: number;
  items: OrderItem[];
  notes?: string;
}

export interface CustomerPayment {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  paymentDate: string;
  amountPaidUsd: number;
  amountPaidKhr: number;
  equivalentUsd: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface ContainerLog {
  id: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  date: string;
  bottlesDelivered: number;
  bottlesReturned: number;
  balanceChange: number;
  reason: string;
}

export interface BrokenProduct {
  id: string;
  incidentDate: string;
  productId: string;
  productNameKh: string;
  quantity: number;
  unitCostUsd: number;
  totalLossUsd: number; // quantity * unitCostUsd
  reason: DamageReason;
  reportedBy: string;
  notes?: string;
}

export interface OperationalExpense {
  id: string;
  expenseDate: string;
  category: ExpenseCategory;
  title: string;
  amountUsd: number;
  amountKhr: number;
  totalEquivalentUsd: number;
  paidTo?: string;
  approvedBy: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  supplierName: string;
  contactPerson: string;
  phoneNumber: string;
  serviceType: string;
  address: string;
  notes?: string;
}

export interface SystemSettings {
  factoryNameKh: string;
  factoryNameEn: string;
  phoneNumber: string;
  addressKh: string;
  exchangeRateKhrPerUsd: number;
  receiptFooterKh: string;
  enableKhqr: boolean;
  khqrMerchantName: string;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  phoneNumber: string;
  isActive: boolean;
}
