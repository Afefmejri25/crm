import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Notification } from '../types/crm';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userData.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({
        notifications: data,
        unreadCount: data.filter((n: Notification) => !n.is_read).length,
        error: null,
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  markAsRead: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      const notifications = get().notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      );
      
      set({
        notifications,
        unreadCount: notifications.filter(n => !n.is_read).length,
        error: null,
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
  markAllAsRead: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userData.user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      const notifications = get().notifications.map(n => ({ ...n, is_read: true }));
      
      set({
        notifications,
        unreadCount: 0,
        error: null,
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));