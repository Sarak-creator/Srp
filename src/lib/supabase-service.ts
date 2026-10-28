import { supabase } from './supabase/client';
import {
  Product,
  Customer,
  Order,
  OrderItem,
  BrokenProduct,
  OperationalExpense,
  Supplier,
  SystemSettings,
  UserAccount,
  CustomerPayment,
  ContainerUnitItem,
} from '@/types/water-factory';
import { DEFAULT_EXCHANGE_RATE } from './financial-engine';

export function isUuid(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const SupabaseService = {
  // ==========================================
  // PRODUCTS
  // ==========================================
  async fetchProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('product_code', { ascending: true });

      if (error) {
        console.error('Error fetching products from Supabase:', error.message);
        return [];
      }

      return (data || []).map((row) => {
        const retailKhr = Number(row.retail_price_khr || row.sale_price_khr || 0);
        const wholesaleKhr = Number(row.wholesale_price_khr || 0);
        const saleUsd = Number(row.sale_price_usd || (retailKhr / 4100));

        return {
          id: row.id,
          productCode: row.product_code,
          nameKh: row.name_kh,
          nameEn: row.name_en || '',
          unit: row.unit,
          retailPriceKhr: retailKhr,
          wholesalePriceKhr: wholesaleKhr,
          retailPriceUsd: saleUsd,
          wholesalePriceUsd: Number((wholesaleKhr / 4100).toFixed(2)),
          salePriceKhr: retailKhr,
          salePriceUsd: saleUsd,
          unitCostUsd: Number(row.unit_cost_usd || 0),
          isRefill20l: Boolean(row.is_refill_20l),
          isActive: Boolean(row.is_active),
        };
      });
    } catch (e) {
      console.error('Unexpected error fetching products:', e);
      return [];
    }
  },

  async saveProduct(prod: Product): Promise<Product | null> {
    try {
      const isExisting = isUuid(prod.id);
      const retailKhr = prod.retailPriceKhr ?? prod.salePriceKhr ?? 0;
      const wholesaleKhr = prod.wholesalePriceKhr ?? 0;
      const saleUsd = prod.salePriceUsd ?? Number((retailKhr / 4100).toFixed(2));

      const payload: Record<string, any> = {
        product_code: prod.productCode,
        name_kh: prod.nameKh,
        name_en: prod.nameEn || '',
        unit: prod.unit,
        retail_price_khr: retailKhr,
        wholesale_price_khr: wholesaleKhr,
        sale_price_khr: retailKhr,
        sale_price_usd: saleUsd,
        unit_cost_usd: prod.unitCostUsd || 0,
        is_refill_20l: prod.isRefill20l,
        is_active: prod.isActive ?? true,
      };

      if (isExisting) {
        const { data, error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', prod.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating product in Supabase:', error.message);
          return null;
        }
        const updatedRetailKhr = Number(data.retail_price_khr || data.sale_price_khr || 0);
        const updatedWholesaleKhr = Number(data.wholesale_price_khr || 0);
        const updatedSaleUsd = Number(data.sale_price_usd || 0);

        return {
          id: data.id,
          productCode: data.product_code,
          nameKh: data.name_kh,
          nameEn: data.name_en,
          unit: data.unit,
          retailPriceKhr: updatedRetailKhr,
          wholesalePriceKhr: updatedWholesaleKhr,
          retailPriceUsd: updatedSaleUsd,
          wholesalePriceUsd: Number((updatedWholesaleKhr / 4100).toFixed(2)),
          salePriceKhr: updatedRetailKhr,
          salePriceUsd: updatedSaleUsd,
          unitCostUsd: Number(data.unit_cost_usd || 0),
          isRefill20l: data.is_refill_20l,
          isActive: data.is_active,
        };
      } else {
        const newId = generateUuid();
        payload.id = newId;

        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('Error inserting product in Supabase:', error.message);
          return null;
        }
        const createdRetailKhr = Number(data.retail_price_khr || data.sale_price_khr || 0);
        const createdWholesaleKhr = Number(data.wholesale_price_khr || 0);
        const createdSaleUsd = Number(data.sale_price_usd || 0);

        return {
          id: data.id,
          productCode: data.product_code,
          nameKh: data.name_kh,
          nameEn: data.name_en,
          unit: data.unit,
          retailPriceKhr: createdRetailKhr,
          wholesalePriceKhr: createdWholesaleKhr,
          retailPriceUsd: createdSaleUsd,
          wholesalePriceUsd: Number((createdWholesaleKhr / 4100).toFixed(2)),
          salePriceKhr: createdRetailKhr,
          salePriceUsd: createdSaleUsd,
          unitCostUsd: Number(data.unit_cost_usd || 0),
          isRefill20l: data.is_refill_20l,
          isActive: data.is_active,
        };
      }
    } catch (e) {
      console.error('Unexpected error saving product:', e);
      return null;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        // If foreign key constraint prevents hard delete, soft delete
        console.warn('Hard delete blocked, falling back to soft delete:', error.message);
        const { error: softErr } = await supabase
          .from('products')
          .update({ is_active: false })
          .eq('id', id);
        return !softErr;
      }
      return true;
    } catch (e) {
      console.error('Error deleting product:', e);
      return false;
    }
  },

  // ==========================================
  // CUSTOMERS
  // ==========================================
  async fetchCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('customer_code', { ascending: true });

      if (error) {
        console.error('Error fetching customers from Supabase:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        customerCode: row.customer_code,
        fullName: row.full_name,
        phoneNumber: row.phone_number,
        deliveryAddress: row.delivery_address || '',
        totalDebtUsd: Number(row.total_debt_usd || 0),
        totalDebtKhr: Number(row.total_debt_khr || 0),
        emptyContainersHeld: Number(row.empty_containers_held || 0),
        notes: row.notes || undefined,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at || new Date().toISOString(),
      }));
    } catch (e) {
      console.error('Unexpected error fetching customers:', e);
      return [];
    }
  },

  async saveCustomer(cust: Customer): Promise<Customer | null> {
    try {
      const isExisting = isUuid(cust.id);
      const payload: Record<string, any> = {
        customer_code: cust.customerCode,
        full_name: cust.fullName,
        phone_number: cust.phoneNumber,
        delivery_address: cust.deliveryAddress || '',
        total_debt_usd: cust.totalDebtUsd,
        total_debt_khr: cust.totalDebtKhr,
        empty_containers_held: cust.emptyContainersHeld,
        notes: cust.notes || null,
        is_active: cust.isActive ?? true,
      };

      if (isExisting) {
        const { data, error } = await supabase
          .from('customers')
          .update(payload)
          .eq('id', cust.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating customer in Supabase:', error.message);
          return null;
        }
        return {
          id: data.id,
          customerCode: data.customer_code,
          fullName: data.full_name,
          phoneNumber: data.phone_number,
          deliveryAddress: data.delivery_address || '',
          totalDebtUsd: Number(data.total_debt_usd || 0),
          totalDebtKhr: Number(data.total_debt_khr || 0),
          emptyContainersHeld: Number(data.empty_containers_held || 0),
          notes: data.notes || undefined,
          isActive: Boolean(data.is_active),
          createdAt: data.created_at,
        };
      } else {
        const newId = generateUuid();
        payload.id = newId;

        const { data, error } = await supabase
          .from('customers')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('Error inserting customer in Supabase:', error.message);
          return null;
        }
        return {
          id: data.id,
          customerCode: data.customer_code,
          fullName: data.full_name,
          phoneNumber: data.phone_number,
          deliveryAddress: data.delivery_address || '',
          totalDebtUsd: Number(data.total_debt_usd || 0),
          totalDebtKhr: Number(data.total_debt_khr || 0),
          emptyContainersHeld: Number(data.empty_containers_held || 0),
          notes: data.notes || undefined,
          isActive: Boolean(data.is_active),
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.error('Unexpected error saving customer:', e);
      return null;
    }
  },

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) {
        console.warn('Hard delete blocked for customer, soft deleting:', error.message);
        const { error: softErr } = await supabase
          .from('customers')
          .update({ is_active: false })
          .eq('id', id);
        return !softErr;
      }
      return true;
    } catch (e) {
      console.error('Error deleting customer:', e);
      return false;
    }
  },

  async adjustCustomerBottleBalance(customerId: string, delta: number): Promise<boolean> {
    try {
      const { data: cust, error: fetchErr } = await supabase
        .from('customers')
        .select('empty_containers_held')
        .eq('id', customerId)
        .single();

      if (fetchErr || !cust) return false;

      const newBalance = Math.max(0, (cust.empty_containers_held || 0) + delta);
      const { error: updateErr } = await supabase
        .from('customers')
        .update({ empty_containers_held: newBalance })
        .eq('id', customerId);

      return !updateErr;
    } catch (e) {
      console.error('Error adjusting bottle balance:', e);
      return false;
    }
  },

  // ==========================================
  // ORDERS & ORDER ITEMS
  // ==========================================
  async fetchOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (id, full_name, phone_number),
          users (id, full_name),
          order_items (
            id,
            product_id,
            quantity,
            unit_cost_usd,
            unit_price_usd,
            unit_price_khr,
            line_total_usd,
            line_total_khr,
            products (id, name_kh, unit)
          )
        `)
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error fetching orders from Supabase:', error.message);
        return [];
      }

      return (data || []).map((row) => {
        const items: OrderItem[] = (row.order_items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productNameKh: item.products?.name_kh || 'ទឹកបរិសុទ្ធ',
          unit: item.products?.unit || 'container_20l',
          quantity: item.quantity,
          unitCostUsd: Number(item.unit_cost_usd || 0),
          unitPriceUsd: Number(item.unit_price_usd || 0),
          unitPriceKhr: Number(item.unit_price_khr || 0),
          totalUsd: Number(item.line_total_usd || 0),
          totalKhr: Number(item.line_total_khr || 0),
        }));

        return {
          id: row.id,
          invoiceNumber: row.invoice_number,
          customerId: row.customer_id,
          customerName: row.customers?.full_name || 'អតិថិជនទូទៅ',
          customerPhone: row.customers?.phone_number || '',
          cashierName: row.users?.full_name || 'អ្នកគិតលុយ',
          orderDate: row.order_date,
          status: row.status,
          paymentStatus: row.payment_status,
          paymentMethod: row.payment_method,
          exchangeRate: Number(row.exchange_rate_applied || DEFAULT_EXCHANGE_RATE),
          subtotalUsd: Number(row.subtotal_usd || 0),
          discountUsd: Number(row.discount_usd || 0),
          grandTotalUsd: Number(row.grand_total_usd || 0),
          grandTotalKhr: Number(row.grand_total_khr || 0),
          paidAmountUsd: Number(row.paid_amount_usd || 0),
          paidAmountKhr: Number(row.paid_amount_khr || 0),
          remainingDebtUsd: Number(row.remaining_debt_usd || 0),
          containersDelivered20L: Number(row.containers_delivered_20l || 0),
          containersReturned20L: Number(row.containers_returned_20l || 0),
          items,
          notes: row.notes || undefined,
        };
      });
    } catch (e) {
      console.error('Unexpected error fetching orders:', e);
      return [];
    }
  },

  async createOrder(order: Order, cashierUserId?: string): Promise<Order | null> {
    try {
      const orderId = isUuid(order.id) ? order.id : generateUuid();
      const customerId = isUuid(order.customerId) ? order.customerId : null;
      const cashierId = isUuid(cashierUserId) ? cashierUserId : null;

      // 1. Insert Order
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          invoice_number: order.invoiceNumber,
          customer_id: customerId,
          cashier_id: cashierId,
          order_date: order.orderDate || new Date().toISOString(),
          status: order.status || 'completed',
          payment_status: order.paymentStatus || 'paid',
          exchange_rate_applied: order.exchangeRate,
          subtotal_usd: order.subtotalUsd,
          discount_usd: order.discountUsd,
          grand_total_usd: order.grandTotalUsd,
          grand_total_khr: order.grandTotalKhr,
          paid_amount_usd: order.paidAmountUsd,
          paid_amount_khr: order.paidAmountKhr,
          remaining_debt_usd: order.remainingDebtUsd,
          containers_delivered_20l: order.containersDelivered20L,
          containers_returned_20l: order.containersReturned20L,
          net_containers_difference: order.containersDelivered20L - order.containersReturned20L,
          payment_method: order.paymentMethod,
          notes: order.notes || null,
        })
        .select()
        .single();

      if (orderErr) {
        console.error('Error inserting order in Supabase:', orderErr.message);
        return null;
      }

      // 2. Insert Order Items
      if (order.items && order.items.length > 0) {
        const itemsToInsert = order.items.map((item) => ({
          id: isUuid(item.id) ? item.id : generateUuid(),
          order_id: orderId,
          product_id: isUuid(item.productId) ? item.productId : null,
          quantity: item.quantity,
          unit_cost_usd: item.unitCostUsd,
          unit_price_usd: item.unitPriceUsd,
          unit_price_khr: item.unitPriceKhr,
          line_total_usd: item.totalUsd,
          line_total_khr: item.totalKhr,
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
        if (itemsErr) {
          console.error('Error inserting order items:', itemsErr.message);
        }
      }

      // 3. Update customer total debt and bottle balance if customer exists
      if (customerId) {
        const { data: cust } = await supabase
          .from('customers')
          .select('total_debt_usd, total_debt_khr, empty_containers_held')
          .eq('id', customerId)
          .single();

        if (cust) {
          const bottleDiff = order.containersDelivered20L - order.containersReturned20L;
          const newDebtUsd = Math.max(0, Number(((cust.total_debt_usd || 0) + order.remainingDebtUsd).toFixed(2)));
          const newDebtKhr = Math.round(newDebtUsd * order.exchangeRate);
          const newBottles = Math.max(0, (cust.empty_containers_held || 0) + bottleDiff);

          await supabase
            .from('customers')
            .update({
              total_debt_usd: newDebtUsd,
              total_debt_khr: newDebtKhr,
              empty_containers_held: newBottles,
            })
            .eq('id', customerId);
        }
      }

      return {
        ...order,
        id: orderId,
      };
    } catch (e) {
      console.error('Unexpected error creating order:', e);
      return null;
    }
  },

  async cancelOrder(orderId: string, customerId?: string, debtToRollbackUsd = 0, bottleDiff = 0): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) {
        console.error('Error cancelling order:', error.message);
        return false;
      }

      // Revert customer debt and bottle balance
      if (customerId && isUuid(customerId)) {
        const { data: cust } = await supabase
          .from('customers')
          .select('total_debt_usd, empty_containers_held')
          .eq('id', customerId)
          .single();

        if (cust) {
          const updatedDebtUsd = Math.max(0, Number(((cust.total_debt_usd || 0) - debtToRollbackUsd).toFixed(2)));
          const updatedBottles = Math.max(0, (cust.empty_containers_held || 0) - bottleDiff);

          await supabase
            .from('customers')
            .update({
              total_debt_usd: updatedDebtUsd,
              empty_containers_held: updatedBottles,
            })
            .eq('id', customerId);
        }
      }

      return true;
    } catch (e) {
      console.error('Error cancelling order:', e);
      return false;
    }
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      return !error;
    } catch (e) {
      console.error('Error deleting order:', e);
      return false;
    }
  },

  // ==========================================
  // CUSTOMER PAYMENTS (DEBT SETTLEMENTS)
  // ==========================================
  async fetchPayments(): Promise<CustomerPayment[]> {
    try {
      const { data, error } = await supabase
        .from('customer_payments')
        .select(`
          *,
          customers (full_name)
        `)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        receiptNumber: row.receipt_number,
        customerId: row.customer_id,
        customerName: row.customers?.full_name || 'អតិថិជន',
        paymentDate: row.payment_date,
        amountPaidUsd: Number(row.amount_paid_usd || 0),
        amountPaidKhr: Number(row.amount_paid_khr || 0),
        equivalentUsd: Number(row.equivalent_usd || 0),
        paymentMethod: row.payment_method,
        notes: row.notes || undefined,
      }));
    } catch (e) {
      console.error('Unexpected error fetching payments:', e);
      return [];
    }
  },

  async recordPayment(payment: CustomerPayment, collectedByUserId?: string): Promise<CustomerPayment | null> {
    try {
      const paymentId = isUuid(payment.id) ? payment.id : generateUuid();
      const customerId = isUuid(payment.customerId) ? payment.customerId : null;
      const collectedBy = isUuid(collectedByUserId) ? collectedByUserId : null;

      const { data, error } = await supabase
        .from('customer_payments')
        .insert({
          id: paymentId,
          receipt_number: payment.receiptNumber,
          customer_id: customerId,
          collected_by: collectedBy,
          payment_date: payment.paymentDate || new Date().toISOString(),
          amount_paid_usd: payment.amountPaidUsd,
          amount_paid_khr: payment.amountPaidKhr,
          equivalent_usd: payment.equivalentUsd,
          payment_method: payment.paymentMethod,
          notes: payment.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording payment in Supabase:', error.message);
        return null;
      }

      // Deduct customer debt
      if (customerId) {
        const { data: cust } = await supabase
          .from('customers')
          .select('total_debt_usd, total_debt_khr')
          .eq('id', customerId)
          .single();

        if (cust) {
          const newDebtUsd = Math.max(0, Number(((cust.total_debt_usd || 0) - payment.equivalentUsd).toFixed(2)));
          const newDebtKhr = Math.round(newDebtUsd * DEFAULT_EXCHANGE_RATE);

          await supabase
            .from('customers')
            .update({
              total_debt_usd: newDebtUsd,
              total_debt_khr: newDebtKhr,
            })
            .eq('id', customerId);
        }
      }

      return {
        ...payment,
        id: data.id,
      };
    } catch (e) {
      console.error('Unexpected error recording payment:', e);
      return null;
    }
  },

  async deletePayment(paymentId: string, customerId?: string, equivalentUsd = 0): Promise<boolean> {
    try {
      const { error } = await supabase.from('customer_payments').delete().eq('id', paymentId);
      if (error) return false;

      // Revert customer debt
      if (customerId && isUuid(customerId)) {
        const { data: cust } = await supabase
          .from('customers')
          .select('total_debt_usd, total_debt_khr')
          .eq('id', customerId)
          .single();

        if (cust) {
          const newDebtUsd = Number(((cust.total_debt_usd || 0) + equivalentUsd).toFixed(2));
          const newDebtKhr = Math.round(newDebtUsd * DEFAULT_EXCHANGE_RATE);

          await supabase
            .from('customers')
            .update({
              total_debt_usd: newDebtUsd,
              total_debt_khr: newDebtKhr,
            })
            .eq('id', customerId);
        }
      }

      return true;
    } catch (e) {
      console.error('Error deleting payment:', e);
      return false;
    }
  },

  // ==========================================
  // BROKEN PRODUCTS
  // ==========================================
  async fetchBrokenProducts(): Promise<BrokenProduct[]> {
    try {
      const { data, error } = await supabase
        .from('broken_products')
        .select(`
          *,
          products (name_kh),
          users (full_name)
        `)
        .order('incident_date', { ascending: false });

      if (error) {
        console.error('Error fetching broken products:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        incidentDate: row.incident_date ? row.incident_date.split('T')[0] : new Date().toISOString().split('T')[0],
        productId: row.product_id,
        productNameKh: row.products?.name_kh || 'ទឹកបរិសុទ្ធ',
        quantity: row.quantity,
        unitCostUsd: Number(row.unit_cost_usd || 0),
        totalLossUsd: Number(row.total_loss_usd || 0),
        reason: row.reason,
        reportedBy: row.users?.full_name || 'បុគ្គលិករោងចក្រ',
        notes: row.notes || undefined,
      }));
    } catch (e) {
      console.error('Unexpected error fetching broken products:', e);
      return [];
    }
  },

  async addBrokenProduct(broken: BrokenProduct, reportedByUserId?: string): Promise<BrokenProduct | null> {
    try {
      const brokenId = isUuid(broken.id) ? broken.id : generateUuid();
      const productId = isUuid(broken.productId) ? broken.productId : null;
      const reportedBy = isUuid(reportedByUserId) ? reportedByUserId : null;

      const { data, error } = await supabase
        .from('broken_products')
        .insert({
          id: brokenId,
          incident_date: broken.incidentDate || new Date().toISOString(),
          product_id: productId,
          quantity: broken.quantity,
          unit_cost_usd: broken.unitCostUsd,
          total_loss_usd: broken.totalLossUsd,
          reason: broken.reason,
          reported_by: reportedBy,
          notes: broken.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting broken product:', error.message);
        return null;
      }

      return {
        ...broken,
        id: data.id,
      };
    } catch (e) {
      console.error('Unexpected error adding broken product:', e);
      return null;
    }
  },

  async deleteBrokenProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('broken_products').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('Error deleting broken product:', e);
      return false;
    }
  },

  // ==========================================
  // OPERATIONAL EXPENSES
  // ==========================================
  async fetchExpenses(): Promise<OperationalExpense[]> {
    try {
      const { data, error } = await supabase
        .from('operational_expenses')
        .select(`
          *,
          users (full_name)
        `)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        expenseDate: row.expense_date,
        category: row.category,
        title: row.title,
        amountUsd: Number(row.amount_usd || 0),
        amountKhr: Number(row.amount_khr || 0),
        totalEquivalentUsd: Number(row.total_equivalent_usd || 0),
        paidTo: row.paid_to || undefined,
        approvedBy: row.users?.full_name || 'អ្នកគ្រប់គ្រង',
        notes: row.notes || undefined,
      }));
    } catch (e) {
      console.error('Unexpected error fetching expenses:', e);
      return [];
    }
  },

  async addExpense(expense: OperationalExpense, approvedByUserId?: string): Promise<OperationalExpense | null> {
    try {
      const expenseId = isUuid(expense.id) ? expense.id : generateUuid();
      const approvedBy = isUuid(approvedByUserId) ? approvedByUserId : null;

      const { data, error } = await supabase
        .from('operational_expenses')
        .insert({
          id: expenseId,
          expense_date: expense.expenseDate || new Date().toISOString().split('T')[0],
          category: expense.category,
          title: expense.title,
          amount_usd: expense.amountUsd,
          amount_khr: expense.amountKhr,
          total_equivalent_usd: expense.totalEquivalentUsd,
          paid_to: expense.paidTo || null,
          approved_by: approvedBy,
          notes: expense.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting expense:', error.message);
        return null;
      }

      return {
        ...expense,
        id: data.id,
      };
    } catch (e) {
      console.error('Unexpected error adding expense:', e);
      return null;
    }
  },

  async deleteExpense(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('operational_expenses').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('Error deleting expense:', e);
      return false;
    }
  },

  // ==========================================
  // SUPPLIERS
  // ==========================================
  async fetchSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('supplier_name', { ascending: true });

      if (error) {
        console.error('Error fetching suppliers:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        supplierName: row.supplier_name,
        contactPerson: row.contact_person || '',
        phoneNumber: row.phone_number,
        serviceType: row.service_type,
        address: row.address || '',
        notes: row.notes || undefined,
      }));
    } catch (e) {
      console.error('Unexpected error fetching suppliers:', e);
      return [];
    }
  },

  async saveSupplier(sup: Supplier): Promise<Supplier | null> {
    try {
      const isExisting = isUuid(sup.id);
      const payload: Record<string, any> = {
        supplier_name: sup.supplierName,
        contact_person: sup.contactPerson || '',
        phone_number: sup.phoneNumber,
        service_type: sup.serviceType,
        address: sup.address || '',
        notes: sup.notes || null,
      };

      if (isExisting) {
        const { data, error } = await supabase
          .from('suppliers')
          .update(payload)
          .eq('id', sup.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating supplier:', error.message);
          return null;
        }
        return {
          id: data.id,
          supplierName: data.supplier_name,
          contactPerson: data.contact_person || '',
          phoneNumber: data.phone_number,
          serviceType: data.service_type,
          address: data.address || '',
          notes: data.notes || undefined,
        };
      } else {
        const newId = generateUuid();
        payload.id = newId;

        const { data, error } = await supabase
          .from('suppliers')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('Error inserting supplier:', error.message);
          return null;
        }
        return {
          id: data.id,
          supplierName: data.supplier_name,
          contactPerson: data.contact_person || '',
          phoneNumber: data.phone_number,
          serviceType: data.service_type,
          address: data.address || '',
          notes: data.notes || undefined,
        };
      }
    } catch (e) {
      console.error('Unexpected error saving supplier:', e);
      return null;
    }
  },

  async deleteSupplier(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('Error deleting supplier:', e);
      return false;
    }
  },

  // ==========================================
  // SYSTEM SETTINGS
  // ==========================================
  async fetchSettings(): Promise<SystemSettings | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        console.warn('System settings not found in Supabase:', error?.message);
        return null;
      }

      return {
        factoryNameKh: data.factory_name_kh,
        factoryNameEn: data.factory_name_en || 'SRP Pure Water Factory',
        phoneNumber: data.phone_number || '',
        addressKh: data.address_kh || '',
        exchangeRateKhrPerUsd: Number(data.exchange_rate_khr_per_usd || DEFAULT_EXCHANGE_RATE),
        receiptFooterKh: data.receipt_footer_kh || 'សូមអរគុណ! សូមពិនិត្យទំនិញ និងចំនួនសំបកធុងមុនពេលទទួល។',
        enableKhqr: true,
        khqrMerchantName: data.factory_name_en || 'SRP PURIFIED WATER FACTORY',
      };
    } catch (e) {
      console.error('Unexpected error fetching settings:', e);
      return null;
    }
  },

  async saveSettings(settings: SystemSettings): Promise<boolean> {
    try {
      // Find existing settings row id
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      const payload = {
        factory_name_kh: settings.factoryNameKh,
        factory_name_en: settings.factoryNameEn,
        phone_number: settings.phoneNumber,
        address_kh: settings.addressKh,
        exchange_rate_khr_per_usd: settings.exchangeRateKhrPerUsd,
        receipt_footer_kh: settings.receiptFooterKh,
        updated_at: new Date().toISOString(),
      };

      if (existing?.id) {
        const { error } = await supabase
          .from('system_settings')
          .update(payload)
          .eq('id', existing.id);
        return !error;
      } else {
        const { error } = await supabase
          .from('system_settings')
          .insert({ id: generateUuid(), ...payload });
        return !error;
      }
    } catch (e) {
      console.error('Unexpected error saving settings:', e);
      return false;
    }
  },

  // ==========================================
  // USERS
  // ==========================================
  async fetchUsers(): Promise<UserAccount[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, role, phone, is_active')
        .eq('is_active', true)
        .order('username', { ascending: true });

      if (error) {
        console.error('Error fetching users from Supabase:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        username: row.username,
        fullName: row.full_name,
        role: row.role,
        phoneNumber: row.phone || '',
        isActive: Boolean(row.is_active),
      }));
    } catch (e) {
      console.error('Unexpected error fetching users:', e);
      return [];
    }
  },

  // ==========================================
  // CONTAINER UNITS (DYNAMIC PACKAGING & UNITS)
  // ==========================================
  async fetchContainerUnits(): Promise<ContainerUnitItem[]> {
    try {
      const { data, error } = await supabase
        .from('container_units')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching container units from Supabase:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        code: row.code,
        nameKh: row.name_kh,
        nameEn: row.name_en || '',
        description: row.description || '',
        isDefault: Boolean(row.is_default),
        createdAt: row.created_at,
      }));
    } catch (e) {
      console.error('Unexpected error fetching container units:', e);
      return [];
    }
  },

  async saveContainerUnit(item: ContainerUnitItem): Promise<ContainerUnitItem | null> {
    try {
      const isExisting = isUuid(item.id);
      const payload: Record<string, any> = {
        code: item.code.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        name_kh: item.nameKh.trim(),
        name_en: item.nameEn?.trim() || item.nameKh.trim(),
        description: item.description?.trim() || null,
        is_default: Boolean(item.isDefault),
      };

      if (isExisting) {
        const { data, error } = await supabase
          .from('container_units')
          .update(payload)
          .eq('id', item.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating container unit in Supabase:', error.message);
          return null;
        }

        return {
          id: data.id,
          code: data.code,
          nameKh: data.name_kh,
          nameEn: data.name_en,
          description: data.description || '',
          isDefault: Boolean(data.is_default),
          createdAt: data.created_at,
        };
      } else {
        const newId = generateUuid();
        payload.id = newId;

        const { data, error } = await supabase
          .from('container_units')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('Error inserting container unit in Supabase:', error.message);
          return null;
        }

        return {
          id: data.id,
          code: data.code,
          nameKh: data.name_kh,
          nameEn: data.name_en,
          description: data.description || '',
          isDefault: Boolean(data.is_default),
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.error('Unexpected error saving container unit:', e);
      return null;
    }
  },

  async deleteContainerUnit(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('container_units')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting container unit from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Unexpected error deleting container unit:', e);
      return false;
    }
  },
};

