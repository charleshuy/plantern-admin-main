import { supabase } from './supabase';
import type { Profile, UserWithStats } from '../types/database';

export const profilesService = {
  // Get all profiles with pagination
  async getAll(page: number = 1, pageSize: number = 10, search?: string) {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  // Get single profile
  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get profile with stats (bought trees count, etc.)
  async getWithStats(page: number = 1, pageSize: number = 10, search?: string): Promise<{ data: UserWithStats[]; count: number }> {
    const { data: profiles, count } = await this.getAll(page, pageSize, search);
    
    if (!profiles || profiles.length === 0) {
      return { data: [], count: count || 0 };
    }

    // Get bought trees count for each user
    const userIds = profiles.map(p => p.id);
    const { data: userPlants } = await supabase
      .from('user_plants')
      .select('user_id')
      .in('user_id', userIds);

    const treesCountMap = new Map<string, number>();
    userPlants?.forEach(up => {
      treesCountMap.set(up.user_id, (treesCountMap.get(up.user_id) || 0) + 1);
    });

    // Map profiles with stats
    const profilesWithStats: UserWithStats[] = profiles.map(profile => ({
      ...profile,
      bought_trees: treesCountMap.get(profile.id) || 0,
      subscription: profile.is_premium 
        ? (profile.premium_expires_at ? 'Premium Annually' : 'Premium Monthly')
        : 'Free',
      status: true, // Assuming active by default
      feedback_count: 0, // TODO: Add feedback table if needed
    }));

    return { data: profilesWithStats, count: count || 0 };
  },

  // Update profile
  async update(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete profile (soft delete by updating status)
  async delete(id: string) {
    // Note: You might want to implement soft delete or handle auth.users deletion
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get total count
  async getTotalCount() {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  },

  // Get premium users count
  async getPremiumCount() {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true);

    if (error) throw error;
    return count || 0;
  },
};
