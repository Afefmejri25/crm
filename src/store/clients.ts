import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Client } from '../types/crm';

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  selectedClient: Client | null;
  fetchClients: () => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  setSelectedClient: (client: Client | null) => void;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  loading: false,
  error: null,
  selectedClient: null,
  fetchClients: async () => {
    set({ loading: true });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('created_by', userData.user.id) // Restrict to own clients
        .order('company_name');

      if (error) throw error;
      set({ clients: data, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  addClient: async (client) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...client, created_by: userData.user.id }])
        .select()
        .single();
      
      if (error) throw error;
      set((state) => ({
        clients: [...state.clients, data].sort((a, b) => 
          a.company_name.localeCompare(b.company_name)
        ),
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
  updateClient: async (id, client) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...client, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? data : c))
          .sort((a, b) => a.company_name.localeCompare(b.company_name)),
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
  setSelectedClient: (client) => set({ selectedClient: client }),
}));