import { Order, OperationalExpense, BrokenProduct, Customer } from '@/types/water-factory';

export const DEFAULT_EXCHANGE_RATE = 4100;

/**
 * បង្គត់ប្រាក់រៀលតាមទម្លាប់ទីផ្សារកម្ពុជា (បង្គត់ត្រឹមខ្ទង់ ១០០រៀល)
 */
export function roundKhr(amountKhr: number): number {
  return Math.round(amountKhr / 100) * 100;
}

/**
 * បម្លែងប្រាក់ដុល្លារទៅរៀល
 */
export function usdToKhr(usd: number, rate: number = DEFAULT_EXCHANGE_RATE): number {
  return roundKhr(usd * rate);
}

/**
 * បម្លែងប្រាក់រៀលទៅដុល្លារ
 */
export function khrToUsd(khr: number, rate: number = DEFAULT_EXCHANGE_RATE): number {
  if (rate <= 0) return 0;
  return Number((khr / rate).toFixed(2));
}

/**
 * ទម្រង់បង្ហាញរូបិយប័ណ្ណដុល្លារ ($)
 */
export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * ទម្រង់បង្ហាញរូបិយប័ណ្ណរៀល (៛)
 */
export function formatKhr(amount: number): string {
  return `${Math.round(amount).toLocaleString('en-US')} ៛`;
}

/**
 * គណនាការខូចខាតបែកបាក់ទំនិញ (Direct Operational Loss)
 * Broken Loss = Quantity * Unit Cost
 */
export function calculateBrokenLoss(quantity: number, unitCostUsd: number): number {
  if (quantity <= 0 || unitCostUsd <= 0) return 0;
  return Number((quantity * unitCostUsd).toFixed(2));
}

export interface FactoryFinancialReport {
  totalGrossSalesUsd: number;
  totalGrossSalesKhr: number;
  totalCashCollectedUsd: number;
  totalOperationalExpensesUsd: number;
  totalBrokenLossUsd: number;
  totalDeductionsUsd: number; // Expenses + Broken Loss
  netProfitUsd: number;
  netProfitKhr: number;
  profitMarginPercent: number;
  totalOutstandingDebtUsd: number;
  totalEmptyBottlesWithCustomers: number;
}

/**
 * គណនាលទ្ធផលហិរញ្ញវត្ថុពិតប្រាកដសម្រាប់សហគ្រាសផលិតទឹកបរិសុទ្ធ
 * Net Profit = Total Gross Sales - (Operational Expenses + Broken Loss)
 */
export function computeFinancialReport(
  orders: Order[],
  expenses: OperationalExpense[],
  brokenProducts: BrokenProduct[],
  customers: Customer[],
  exchangeRate: number = DEFAULT_EXCHANGE_RATE
): FactoryFinancialReport {
  // 1. Gross Sales (Completed orders only)
  const validOrders = orders.filter((o) => o.status === 'completed');
  const totalGrossSalesUsd = validOrders.reduce((sum, o) => sum + o.grandTotalUsd, 0);
  const totalGrossSalesKhr = usdToKhr(totalGrossSalesUsd, exchangeRate);

  // 2. Total Cash/Transfer Collected
  const totalCashCollectedUsd = validOrders.reduce(
    (sum, o) => sum + o.paidAmountUsd + khrToUsd(o.paidAmountKhr, exchangeRate),
    0
  );

  // 3. Operational Expenses
  const totalOperationalExpensesUsd = expenses.reduce((sum, e) => sum + e.totalEquivalentUsd, 0);

  // 4. Broken Products Loss (Direct Financial Loss)
  const totalBrokenLossUsd = brokenProducts.reduce((sum, b) => sum + b.totalLossUsd, 0);

  // 5. Total Deductions & Net Profit
  const totalDeductionsUsd = Number((totalOperationalExpensesUsd + totalBrokenLossUsd).toFixed(2));
  const netProfitUsd = Number((totalGrossSalesUsd - totalDeductionsUsd).toFixed(2));
  const netProfitKhr = usdToKhr(netProfitUsd, exchangeRate);

  const profitMarginPercent = totalGrossSalesUsd > 0
    ? Number(((netProfitUsd / totalGrossSalesUsd) * 100).toFixed(1))
    : 0;

  // 6. Outstanding Receivables & 20L Empty Bottles with customers
  const totalOutstandingDebtUsd = customers.reduce((sum, c) => sum + c.totalDebtUsd, 0);
  const totalEmptyBottlesWithCustomers = customers.reduce((sum, c) => sum + c.emptyContainersHeld, 0);

  return {
    totalGrossSalesUsd: Number(totalGrossSalesUsd.toFixed(2)),
    totalGrossSalesKhr,
    totalCashCollectedUsd: Number(totalCashCollectedUsd.toFixed(2)),
    totalOperationalExpensesUsd: Number(totalOperationalExpensesUsd.toFixed(2)),
    totalBrokenLossUsd: Number(totalBrokenLossUsd.toFixed(2)),
    totalDeductionsUsd,
    netProfitUsd,
    netProfitKhr,
    profitMarginPercent,
    totalOutstandingDebtUsd: Number(totalOutstandingDebtUsd.toFixed(2)),
    totalEmptyBottlesWithCustomers,
  };
}
