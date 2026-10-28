import { SupabaseService } from './supabase-service';

/**
 * Re-export SupabaseService methods for backward compatibility
 */
export const SupabaseSync = {
  deleteProduct: SupabaseService.deleteProduct,
  deleteCustomer: SupabaseService.deleteCustomer,
  deleteOrder: SupabaseService.deleteOrder,
  deleteExpense: SupabaseService.deleteExpense,
  deleteBroken: SupabaseService.deleteBrokenProduct,
  deleteSupplier: SupabaseService.deleteSupplier,
  deletePayment: SupabaseService.deletePayment,
};
