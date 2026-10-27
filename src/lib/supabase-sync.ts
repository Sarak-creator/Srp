import { supabase } from './supabase/client';

/**
 * Helper to sync deletes directly to Supabase cloud database
 */
export const SupabaseSync = {
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete product warning:', error.message);
        // Fallback: soft-delete if foreign key constraint blocks hard delete
        const { error: softErr } = await supabase.from('products').update({ is_active: false }).eq('id', id);
        return !softErr;
      }
      return true;
    } catch (e) {
      console.warn('Supabase deleteProduct error:', e);
      return false;
    }
  },

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete customer warning:', error.message);
        // Fallback: soft-delete if foreign key constraint blocks hard delete
        const { error: softErr } = await supabase.from('customers').update({ is_active: false }).eq('id', id);
        return !softErr;
      }
      return true;
    } catch (e) {
      console.warn('Supabase deleteCustomer error:', e);
      return false;
    }
  },

  async deleteOrder(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) console.warn('Supabase delete order warning:', error.message);
      return !error;
    } catch (e) {
      console.warn('Supabase deleteOrder error:', e);
      return false;
    }
  },

  async deleteExpense(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('operational_expenses').delete().eq('id', id);
      if (error) console.warn('Supabase delete expense warning:', error.message);
      return !error;
    } catch (e) {
      console.warn('Supabase deleteExpense error:', e);
      return false;
    }
  },

  async deleteBroken(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('broken_products').delete().eq('id', id);
      if (error) console.warn('Supabase delete broken warning:', error.message);
      return !error;
    } catch (e) {
      console.warn('Supabase deleteBroken error:', e);
      return false;
    }
  },

  async deleteSupplier(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) console.warn('Supabase delete supplier warning:', error.message);
      return !error;
    } catch (e) {
      console.warn('Supabase deleteSupplier error:', e);
      return false;
    }
  },

  async deletePayment(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('customer_payments').delete().eq('id', id);
      if (error) console.warn('Supabase delete payment warning:', error.message);
      return !error;
    } catch (e) {
      console.warn('Supabase deletePayment error:', e);
      return false;
    }
  },
};
