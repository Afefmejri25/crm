import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Call } from '../types/crm';

interface CallsState {
  calls: Call[];
  loading: boolean;
  error: string | null;
  fetchCalls: () => Promise<void>;
  addCall: (call: Omit<Call, 'id' | 'created_at'>) => Promise<void>;
  updateCall: (id: string, call: Partial<Call>) => Promise<void>;
  fetchCallsByClient: (clientId: string) => Promise<void>;
}

export const useCallsStore = create<CallsState>((set) => ({
  calls: [],
  loading: false,
  error: null,
  fetchCalls: async () => {
    set({ loading: true });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          clients (
            company_name,
            contact_name
          )
        `)
        .eq('agent_id', userData.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ calls: data, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  addCall: async (call) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('calls')
        .insert([{ ...call, agent_id: userData.user.id }])
        .select(`
          *,
          clients (
            company_name,
            contact_name
          )
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        calls: [data, ...state.calls],
        error: null,
      }));

      // Create notification for callback
      if (call.status === 'callback' && call.scheduled_callback) {
        await supabase
          .from('notifications')
          .insert([{
            title: 'Callback Scheduled',
            message: `Callback scheduled for ${new Date(call.scheduled_callback).toLocaleString()} with ${data.clients?.company_name}`,
            recipient_id: userData.user.id,
            created_by: userData.user.id,
          }]);
      }
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
  updateCall: async (id, call) => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .update(call)
        .eq('id', id)
        .select(`
          *,
          clients (
            company_name,
            contact_name
          )
        `)
        .single();
      
      if (error) throw error;
      set((state) => ({
        calls: state.calls.map((c) => (c.id === id ? data : c)),
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
  fetchCallsByClient: async (clientId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          clients (
            company_name,
            contact_name
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ calls: data, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));