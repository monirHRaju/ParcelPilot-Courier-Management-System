'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api-client';
import { 
  PieChart, 
  Pie, 
  Cell,
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { Package, CheckCircle, Wallet, RefreshCw, Upload, Plus } from 'lucide-react';

interface MerchantStats {
  walletBalance: number;
  pendingPayouts: number;
  totalParcels: number;
  deliveredParcels: number;
  returnRate: number;
  recentParcels: Array<{
    id: string;
    status: string;
    recipientName: string;
    codAmount: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF8', '#F87171'];

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<MerchantStats | null>(null);
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
        const data = await apiClient<MerchantStats>('dashboard/merchant', {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/merchant/parcels/bulk" className="btn btn-outline btn-secondary">
            <Upload size={18} />
            Bulk Upload CSV
          </Link>
          <Link href="/merchant/parcels/create" className="btn btn-primary">
            <Plus size={18} />
            Create Parcel
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-success">
            <Wallet size={32} />
          </div>
          <div className="stat-title">Wallet Balance</div>
          <div className="stat-value text-success">৳{(stats.walletBalance / 100).toFixed(2)}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-warning">
            <Wallet size={32} />
          </div>
          <div className="stat-title">Pending Payouts</div>
          <div className="stat-value text-warning">৳{(stats.pendingPayouts / 100).toFixed(2)}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-primary">
            <Package size={32} />
          </div>
          <div className="stat-title">Total Parcels</div>
          <div className="stat-value">{stats.totalParcels}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-error">
            <RefreshCw size={32} />
          </div>
          <div className="stat-title">Return Rate</div>
          <div className="stat-value text-error">{stats.returnRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-base-100 p-6 rounded-box shadow flex flex-col">
          <h2 className="text-xl font-bold mb-4">Parcel Status Distribution</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {stats.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--b1))', borderColor: 'hsl(var(--b3))' }} 
                  itemStyle={{ color: 'hsl(var(--bc))' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Parcels */}
        <div className="lg:col-span-2 bg-base-100 p-6 rounded-box shadow flex flex-col">
          <h2 className="text-xl font-bold mb-4">Recent Parcels</h2>
          <div className="overflow-x-auto flex-1">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>COD Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentParcels.map((parcel) => (
                  <tr key={parcel.id}>
                    <td className="font-mono text-xs">{parcel.id.slice(0, 8)}...</td>
                    <td>{parcel.recipientName}</td>
                    <td>
                      <span className="badge badge-sm badge-outline">
                        {parcel.status}
                      </span>
                    </td>
                    <td>৳{(parcel.codAmount / 100).toFixed(2)}</td>
                  </tr>
                ))}
                {stats.recentParcels.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-sm opacity-50 py-4">
                      No recent parcels found.
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
