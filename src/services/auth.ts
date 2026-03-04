import { supabase } from './supabase';
import type { Profile } from '../types/database';

export interface AuthUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}

export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    
    if (!data.user) {
      throw new Error('Failed to sign in');
    }

    // Check if user is super admin
    // Note: is_super_admin is not directly accessible from client
    // We need to check via a database function or the user's metadata
    // For now, we'll check via profile lookup which will use the RLS policy
    const profile = await this.getProfile(data.user.id);
    
    if (!profile) {
      console.error('Profile not found for user:', data.user.id);
      await this.signOut();
      throw new Error('Profile not found. Please contact administrator.');
    }

    // The RLS policy will only allow super admins to read profiles
    // So if we got a profile, user is super admin
    return {
      user: data.user,
      profile,
    };
  },

  // Get user profile
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      
      // If no session, return null immediately
      if (!session) {
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const session = await this.getSession();
      
      if (!session?.user) {
        console.log('No session found in localStorage');
        return null;
      }

      console.log('Session found in localStorage, user ID:', session.user.id);
      console.log('Checking if user can access profile (super admin check)...');
      
      // Try to get profile - RLS will only allow if user is super admin
      const profile = await this.getProfile(session.user.id);
      
      // If profile is null, user is not super admin (RLS blocked it)
      if (!profile) {
        console.log('Profile not accessible - user is not super admin or fetch timed out');
        return null;
      }

      console.log('Profile found - user is super admin');
      return {
        id: session.user.id,
        email: session.user.email || null,
        profile,
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        // Don't throw - we still want to clear local state even if signout fails
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Don't throw - we still want to clear local state
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log('Auth state change event:', event, 'Has session:', !!session);
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('No session - calling callback with null');
          callback(null);
          return;
        }

        if (session.user) {
          console.log('Session user found, checking profile for:', session.user.id);
          // Try to get profile - RLS will only allow if user is super admin
          const profile = await this.getProfile(session.user.id);
          
          if (profile) {
            console.log('Profile found - super admin confirmed, calling callback');
            callback({
              id: session.user.id,
              email: session.user.email || null,
              profile,
            });
          } else {
            console.log('No profile - not super admin, calling callback with null');
            callback(null);
          }
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        callback(null);
      }
    });
  },
};
