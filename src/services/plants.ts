import { supabase } from './supabase';
import type { Plant, PlantWithSales } from '../types/database';

export const plantsService = {
  // Get all plants with pagination
  async getAll(page: number = 1, pageSize: number = 10, search?: string) {
    let query = supabase
      .from('plants')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to).select('*', { count: 'exact' });

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  // Get plants with sales count
  async getWithSales(page: number = 1, pageSize: number = 10, search?: string): Promise<{ data: PlantWithSales[]; count: number }> {
    const { data: plants, count } = await this.getAll(page, pageSize, search);
    
    if (!plants || plants.length === 0) {
      return { data: [], count: count || 0 };
    }

    // Get sales count for each plant
    const plantIds = plants.map(p => p.id);
    const { data: userPlants } = await supabase
      .from('user_plants')
      .select('plant_id')
      .in('plant_id', plantIds);

    const salesCountMap = new Map<number, number>();
    userPlants?.forEach(up => {
      salesCountMap.set(up.plant_id, (salesCountMap.get(up.plant_id) || 0) + 1);
    });

    // Map plants with sales
    const plantsWithSales: PlantWithSales[] = plants.map(plant => ({
      ...plant,
      sales: salesCountMap.get(plant.id) || 0,
    }));

    return { data: plantsWithSales, count: count || 0 };
  },

  // Get single plant
  async getById(id: number) {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create plant
  async create(plant: Omit<Plant, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('plants')
      .insert(plant)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update plant
  async update(id: number, updates: Partial<Plant>) {
    const { data, error } = await supabase
      .from('plants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete plant
  async delete(id: number) {
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get total count
  async getTotalCount() {
    const { count, error } = await supabase
      .from('plants')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  },
};
