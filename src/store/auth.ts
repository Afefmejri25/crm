import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  error: null,
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      set({
        user: data.user,
        isAdmin: data.user?.email?.includes('admin') || false,
        error: null,
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isAdmin: false, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  checkUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({
        user,
        isAdmin: user?.email?.includes('admin') || false,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));