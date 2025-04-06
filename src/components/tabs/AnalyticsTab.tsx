
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { supabase } from '../../lib/supabase';

interface CallStats {
  totalCalls: number;
  callsByAgent: { agent_name: string; total_calls: number; }[];
  successRate: number;
  revenueGrowth: number;
}

export default function AnalyticsTab() {
  const [stats, setStats] = useState<CallStats>({
    totalCalls: 0,
    callsByAgent: [],
    successRate: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: calls, error: callsError } = await supabase
        .from('calls')
        .select('*');

      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('id, name');

      if (callsError || agentsError) throw callsError || agentsError;

      // Calculate stats
      const totalCalls = calls.length;
      const successfulCalls = calls.filter(call => call.status === 'success').length;
      const successRate = (successfulCalls / totalCalls) * 100;

      // Group calls by agent
      const callsByAgent = agents.map(agent => ({
        agent_name: agent.name,
        total_calls: calls.filter(call => call.agent_id === agent.id).length
      }));

      setStats({
        totalCalls,
        callsByAgent,
        successRate,
        revenueGrowth: 0 // This would need actual revenue data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Calls</h3>
          <p className="text-3xl font-bold">{stats.totalCalls}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Success Rate</h3>
          <p className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Calls by Agent</h3>
        <div className="w-full overflow-x-auto">
          <BarChart width={600} height={300} data={stats.callsByAgent}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="agent_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_calls" fill="#4F46E5" name="Total Calls" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
