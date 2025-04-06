import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  role: 'admin' | 'agent' | null;
  loading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  session: Session | null; // Added session field
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  error: null,
  theme: 'light',
  session: null, // Initialize session to null
  toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Fetch user role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      set({ 
        user: data.user,
        role: profileData.role as 'admin' | 'agent',
        session: data.session // added session data
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, role: null, error: null, session: null }); // added session
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  checkUser: async () => {
    try {
      const { data: { user, session } } = await supabase.auth.getUser(); //get session here
      set({
        user,
        session, //added session
        role: null, // Initialize role to null until fetched
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));