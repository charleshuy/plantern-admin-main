import { supabase } from './supabase';
import type { Transaction, TransactionWithUser } from '../types/database';

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
    let query = supabase
      .from('transactions')
      .select('*, profiles!user_id(id, display_name, email)', { count: 'exact' });

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

    // Transform data to include user info
    const transactionsWithUser: TransactionWithUser[] = (data || []).map((t: any) => ({
      id: t.id,
      user_id: t.user_id,
      product_id: t.product_id,
      amount: t.amount,
      created_at: t.created_at,
      user: Array.isArray(t.profiles) ? t.profiles[0] : t.profiles,
    }));

    return { data: transactionsWithUser, count: count || 0 };
  },

  // Get single transaction
  async getById(id: number) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles!user_id(id, display_name, email)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get total revenue
  async getTotalRevenue(startDate?: Date, endDate?: Date) {
    let query = supabase
      .from('transactions')
      .select('amount');

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = (data || []).reduce((sum, t) => sum + (t.amount || 0), 0);
    return total;
  },

  // Get revenue by month
  async getRevenueByMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day
    const dailyRevenue: Record<string, number> = {};
    (data || []).forEach(t => {
      const date = new Date(t.created_at).getDate();
      const key = `${date}`;
      dailyRevenue[key] = (dailyRevenue[key] || 0) + (t.amount || 0);
    });

    return dailyRevenue;
  },
};
