import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Phone } from 'lucide-react';
import { useClientsStore } from '../../store/clients';
import { useCallsStore } from '../../store/calls';
import { Client } from '../../types/crm';
import { formatDistanceToNow } from 'date-fns';

interface ClientFormData {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  region: string;
  annual_revenue: string;
}

export default function ClientsTab() {
  const { clients, loading, fetchClients, addClient, updateClient } = useClientsStore();
  const { addCall } = useCallsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    region: '',
    annual_revenue: '',
  });

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientData = {
      ...formData,
      annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
    };

    if (editingClient) {
      await updateClient(editingClient.id, clientData);
    } else {
      await addClient(clientData);
    }

    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      mobile: '',
      address: '',
      region: '',
      annual_revenue: '',
    });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      company_name: client.company_name,
      contact_name: client.contact_name,
      email: client.email || '',
      phone: client.phone || '',
      mobile: client.mobile || '',
      address: client.address || '',
      region: client.region || '',
      annual_revenue: client.annual_revenue?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleQuickCall = async (clientId: string) => {
    await addCall({
      client_id: clientId,
      agent_id: '', // Will be set by RLS
      status: 'no_answer',
      notes: 'Quick call attempt',
      scheduled_callback: null,
    });
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
        <h2 className="text-2xl font-bold text-gray-800">Clients</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-md p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{client.company_name}</h3>
                <p className="text-sm text-gray-600">{client.contact_name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickCall(client.id)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            {client.email && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {client.email}
              </p>
            )}
            {client.phone && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span> {client.phone}
              </p>
            )}
            {client.region && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Region:</span> {client.region}
              </p>
            )}
            {client.annual_revenue && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Revenue:</span> €{client.annual_revenue.toLocaleString()}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Added {formatDistanceToNow(new Date(client.created_at))} ago
            </p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Revenue</label>
                <input
                  type="number"
                  value={formData.annual_revenue}
                  onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}