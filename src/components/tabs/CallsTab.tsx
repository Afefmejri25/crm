import React, { useEffect, useState } from 'react';
import { Plus, Phone, Calendar } from 'lucide-react';
import { useCallsStore } from '../../store/calls';
import { useClientsStore } from '../../store/clients';
import { formatDistanceToNow } from 'date-fns';

interface CallFormData {
  client_id: string;
  status: 'success' | 'callback' | 'no_answer';
  notes: string;
  scheduled_callback: string;
}

export default function CallsTab() {
  const { calls, loading, fetchCalls, addCall, updateCall } = useCallsStore();
  const { clients, fetchClients } = useClientsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CallFormData>({
    client_id: '',
    status: 'success',
    notes: '',
    scheduled_callback: '',
  });

  useEffect(() => {
    fetchCalls();
    fetchClients();
  }, [fetchCalls, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCall({
      ...formData,
      agent_id: '', // Will be set by RLS
      scheduled_callback: formData.scheduled_callback || null,
    });
    setIsModalOpen(false);
    setFormData({
      client_id: '',
      status: 'success',
      notes: '',
      scheduled_callback: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'callback':
        return 'bg-yellow-100 text-yellow-800';
      case 'no_answer':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h2 className="text-2xl font-bold text-gray-800">Calls</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Call
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calls.map((call) => (
          <div key={call.id} className="bg-white rounded-lg shadow-md p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {call.clients?.company_name}
                </h3>
                <p className="text-sm text-gray-600">{call.clients?.contact_name}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                {call.status}
              </span>
            </div>

            {call.notes && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {call.notes}
              </p>
            )}
            
            {call.scheduled_callback && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Calendar className="w-4 h-4" />
                <span>Callback scheduled for {new Date(call.scheduled_callback).toLocaleString()}</span>
              </div>
            )}

            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(call.created_at))} ago
            </p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Log New Call</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company_name} - {client.contact_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="success">Success</option>
                  <option value="callback">Callback</option>
                  <option value="no_answer">No Answer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              {formData.status === 'callback' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Callback Date</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_callback}
                    onChange={(e) => setFormData({ ...formData, scheduled_callback: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Log Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}