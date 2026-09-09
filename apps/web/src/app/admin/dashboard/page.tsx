'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Package, CheckCircle, DollarSign, Wallet } from 'lucide-react';

interface DashboardStats {
  totalParcels: number;
  deliveredParcels: number;
  totalRevenue: number;
  totalCodCollected: number;
  recentActivity: Array<{
    id: string;
    status: string;
    createdAt: string;
    merchant: { businessName: string };
  }>;
  volumeTrends: Array<{
    date: string;
    count: number;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const data = await apiClient<DashboardStats>('dashboard/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load dashboard data');
      }
    };
    fetchStats();
  }, [router]);

  if (error) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 flex justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-primary">
            <Package size={32} />
          </div>
          <div className="stat-title">Total Parcels</div>
          <div className="stat-value">{stats.totalParcels}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-success">
            <CheckCircle size={32} />
          </div>
          <div className="stat-title">Delivered</div>
          <div className="stat-value text-success">{stats.deliveredParcels}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-info">
            <DollarSign size={32} />
          </div>
          <div className="stat-title">Revenue (Fees)</div>
          <div className="stat-value text-info">৳{(stats.totalRevenue / 100).toFixed(2)}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-warning">
            <Wallet size={32} />
          </div>
          <div className="stat-title">COD Held by Riders</div>
          <div className="stat-value text-warning">৳{(stats.totalCodCollected / 100).toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-base-100 p-6 rounded-box shadow">
          <h2 className="text-xl font-bold mb-4">Parcel Volume (Last 30 Days)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.volumeTrends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" stroke="currentColor" opacity={0.5} fontSize={12} />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--b1))', borderColor: 'hsl(var(--b3))' }} 
                  itemStyle={{ color: 'hsl(var(--p))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--p))" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-base-100 p-6 rounded-box shadow flex flex-col h-full">
          <h2 className="text-xl font-bold mb-4">Recent Parcels</h2>
          <div className="overflow-x-auto flex-1">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((parcel) => (
                  <tr key={parcel.id}>
                    <td>{parcel.merchant.businessName}</td>
                    <td>
                      <span className="badge badge-sm badge-outline">
                        {parcel.status}
                      </span>
                    </td>
                    <td className="text-xs">
                      {new Date(parcel.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {stats.recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-sm opacity-50 py-4">
                      No recent activity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
