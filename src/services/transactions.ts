import { supabase } from './supabase';
import type { TransactionOrderUser, TransactionWithUser } from '../types/database';

/** Load auth.users fields for transaction rows (see supabase_transaction_order_users.sql). */
export async function fetchTransactionOrderUsers(
  userIds: string[],
): Promise<Map<string, TransactionOrderUser>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, TransactionOrderUser>();
  if (unique.length === 0) return map;

  const { data, error } = await supabase.rpc('transaction_order_users', {
    p_user_ids: unique,
  });

  if (error) {
    console.warn(
      '[transactions] transaction_order_users RPC failed — run supabase_transaction_order_users.sql:',
      error.message,
    );
    return map;
  }

  for (const row of data || []) {
    const r = row as { id: string; email: string | null; display_name: string | null };
    map.set(r.id, {
      id: r.id,
      email: r.email ?? null,
      display_name: r.display_name ?? null,
    });
  }
  return map;
}

/** Tree purchases use numeric string ids (e.g. "1", "2", "3"), not SKUs like "gold_100". */
export function isNumericTreeProductId(productId: string | null | undefined): boolean {
  return productId != null && /^\d+$/.test(String(productId));
}

function treeSaleDisplayAmount(amount: number | null | undefined): number {
  return Math.abs(Number(amount) || 0);
}

export const transactionsService = {
  // Get all transactions with pagination and filters
  async getAll(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      dateFilter?: 'week' | 'month' | 'year' | 'all';
      type?: string[];
      status?: string[];
    },
    sortNewest: boolean = true
  ) {
    let query = supabase.from('transactions').select('*', { count: 'exact' });

    // Date filter
    if (filters?.dateFilter && filters.dateFilter !== 'all') {
      const now = new Date();
      let dateThreshold = new Date();
      
      switch (filters.dateFilter) {
        case 'week':
          dateThreshold.setDate(now.getDate() - 7);
          break;
        case 'month':
          dateThreshold.setDate(now.getDate() - 30);
          break;
        case 'year':
          dateThreshold.setDate(now.getDate() - 365);
          break;
      }
      
      query = query.gte('created_at', dateThreshold.toISOString());
    }

    // Sort
    query = query.order('created_at', { ascending: !sortNewest });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    const rows = data || [];
    const userMap = await fetchTransactionOrderUsers(rows.map((t: { user_id: string }) => t.user_id));

    const transactionsWithUser: TransactionWithUser[] = rows.map((t: any) => ({
      id: t.id,
      user_id: t.user_id,
      product_id: t.product_id,
      amount: t.amount,
      created_at: t.created_at,
      user: userMap.get(t.user_id),
    }));

    return { data: transactionsWithUser, count: count || 0 };
  },

  // Get single transaction (user fields from auth.users via RPC)
  async getById(id: number) {
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();

    if (error) throw error;
    const userMap = await fetchTransactionOrderUsers([data.user_id]);
    return { ...data, user: userMap.get(data.user_id) };
  },

  // Get total revenue (numeric tree product_id only; amounts shown as positive)
  async getTotalRevenue(startDate?: Date, endDate?: Date) {
    let query = supabase
      .from('transactions')
      .select('amount, product_id');

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = (data || [])
      .filter((t) => isNumericTreeProductId(t.product_id))
      .reduce((sum, t) => sum + treeSaleDisplayAmount(t.amount), 0);
    return total;
  },

  // Get revenue by month
  async getRevenueByMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, created_at, product_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day
    const dailyRevenue: Record<string, number> = {};
    (data || []).forEach((t) => {
      if (!isNumericTreeProductId(t.product_id)) return;
      const date = new Date(t.created_at).getDate();
      const key = `${date}`;
      dailyRevenue[key] = (dailyRevenue[key] || 0) + treeSaleDisplayAmount(t.amount);
    });

    return dailyRevenue;
  },
};
