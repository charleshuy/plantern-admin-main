import { supabase } from './supabase';
import { profilesService } from './profiles';
import { transactionsService } from './transactions';

export const statsService = {
  // Get dashboard stats
  async getDashboardStats() {
    try {
      // Get total users
      const totalUsers = await profilesService.getTotalCount();

      // Get premium users count
      const totalPremium = await profilesService.getPremiumCount();

      // Get total tree sales (revenue from transactions)
      const totalTreeSales = await transactionsService.getTotalRevenue();

      // Get new users (users created in last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      // Get previous period stats for comparison
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const { count: previousUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twoDaysAgo.toISOString())
        .lt('created_at', yesterday.toISOString());

      const { count: previousPremiumCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true)
        .lt('created_at', yesterday.toISOString());

      const previousTreeSales = await transactionsService.getTotalRevenue(
        undefined,
        yesterday
      );

      // Calculate percentage changes
      const userChange = previousUsersCount 
        ? (((newUsers || 0) - (previousUsersCount || 0)) / (previousUsersCount || 1)) * 100
        : 0;

      const premiumChange = previousPremiumCount
        ? (((totalPremium || 0) - (previousPremiumCount || 0)) / (previousPremiumCount || 1)) * 100
        : 0;

      const salesChange = previousTreeSales
        ? (((totalTreeSales || 0) - previousTreeSales) / (previousTreeSales || 1)) * 100
        : 0;

      return {
        totalUsers: {
          value: totalUsers,
          change: userChange > 0 ? `${userChange.toFixed(1)}% Up from yesterday` : `${Math.abs(userChange).toFixed(1)}% Down from yesterday`,
          isPositive: userChange >= 0,
        },
        totalPremium: {
          value: totalPremium || 0,
          change: premiumChange > 0 ? `${premiumChange.toFixed(1)}% Up from past week` : `${Math.abs(premiumChange).toFixed(1)}% Down from past week`,
          isPositive: premiumChange >= 0,
        },
        totalTreeSales: {
          value: totalTreeSales,
          change: salesChange > 0 ? `${salesChange.toFixed(1)}% Up from yesterday` : `${Math.abs(salesChange).toFixed(1)}% Down from yesterday`,
          isPositive: salesChange >= 0,
        },
        totalNewUsers: {
          value: newUsers || 0,
          change: userChange > 0 ? `${userChange.toFixed(1)}% Up from yesterday` : `${Math.abs(userChange).toFixed(1)}% Down from yesterday`,
          isPositive: userChange >= 0,
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get revenue chart data
  async getRevenueChartData(month: number, year: number) {
    try {
      const revenueByDay = await transactionsService.getRevenueByMonth(year, month);
      
      // Convert to array format for chart
      const daysInMonth = new Date(year, month, 0).getDate();
      const data = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const key = `${day}`;
        return {
          name: `${day * 5}k`, // Simplified naming for chart
          value: revenueByDay[key] || 0,
        };
      });

      return data;
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      throw error;
    }
  },

  // Get recent deals/transactions
  async getRecentDeals(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!user_id (
            display_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((t: any) => ({
        tree: t.plants?.name || 'Unknown',
        user: t.profiles?.display_name || 'Unknown',
        date: new Date(t.created_at).toLocaleString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        amount: (t.amount || 0).toLocaleString('vi-VN'),
        status: 'Delivered',
      }));
    } catch (error) {
      console.error('Error fetching recent deals:', error);
      throw error;
    }
  },
};
