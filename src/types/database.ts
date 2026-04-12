// Database types matching Supabase schema

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  water_balance: number;
  current_level: number;
  current_xp: number;
  slots_owned: number;
  created_at: string;
  last_focus_date: string | null;
  current_streak: number;
  longest_streak: number;
  gold: number;
  is_premium: boolean;
  premium_expires_at: string | null;
  revenuecat_customer_id: string | null;
  is_admin?: boolean;
}

export interface Plant {
  id: number;
  name: string;
  description: string | null;
  model_url: string;
  thumbnail_url: string | null;
  price: number;
  is_premium: boolean;
  required_level: number;
  max_level: number;
  water_needed_per_level: number;
  created_at: string;
}

export interface UserPlant {
  id: number;
  user_id: string;
  plant_id: number;
  current_level: number;
  growth_points: number;
  status: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: string;
  product_id: string | null;
  amount: number | null;
  created_at: string;
}

export interface FocusSession {
  id: number;
  user_id: string;
  duration_minutes: number;
  water_earned: number;
  created_at: string;
  is_strict: boolean;
}

export interface PlantStage {
  id: number;
  plant_id: number;
  level: number;
  model_url: string;
  thumbnail_url: string | null;
  xp_required: number;
}

export interface Level {
  level: number;
  xp_required: number;
  reward_slots: number;
}

// UI Types
export interface UserWithStats extends Profile {
  bought_trees?: number;
  subscription?: string;
  status?: boolean;
  feedback_count?: number;
}

export interface PlantWithSales extends Plant {
  sales?: number;
}

/** Resolved from auth.users (via RPC); not the public.profiles row. */
export interface TransactionOrderUser {
  id: string;
  email: string | null;
  display_name: string | null;
}

export interface TransactionWithUser extends Transaction {
  user?: TransactionOrderUser;
  plant?: Plant;
}
