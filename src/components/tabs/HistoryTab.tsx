
import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface HistoryItem {
  id: string;
  type: 'call' | 'notification' | 'document';
  description: string;
  created_at: string;
  client_name?: string;
}

export default function HistoryTab() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // Fetch calls
      const { data: calls } = await supabase
        .from('calls')
        .select(`
          id,
          status,
          notes,
          created_at,
          clients (company_name)
        `)
        .order('created_at', { ascending: false });

      // Fetch notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // Combine and format history items
      const historyItems = [
        ...(calls?.map(call => ({
          id: call.id,
          type: 'call' as const,
          description: `Call ${call.status} - ${call.notes}`,
          created_at: call.created_at,
          client_name: call.clients?.company_name
        })) || []),
        ...(notifications?.map(notif => ({
          id: notif.id,
          type: 'notification' as const,
          description: notif.message,
          created_at: notif.created_at
        })) || [])
      ].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setHistory(historyItems);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Activity History</h2>
      <div className="space-y-4">
        {history.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-gray-800">{item.description}</p>
                {item.client_name && (
                  <p className="text-sm text-gray-600">Client: {item.client_name}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(item.created_at))} ago
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
