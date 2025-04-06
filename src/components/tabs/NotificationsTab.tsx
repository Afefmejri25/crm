import React, { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Notification } from '../../types/crm';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {notifications.filter(n => !n.is_read).length} unread
        </span>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow-md p-4 ${
              !notification.is_read ? 'border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <Bell className={`w-5 h-5 ${!notification.is_read ? 'text-blue-600' : 'text-gray-400'}`} />
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{notification.title}</h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(new Date(notification.created_at))} ago
                  </p>
                </div>
              </div>
              {!notification.is_read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Check className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}