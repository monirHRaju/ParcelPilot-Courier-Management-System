'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { Package, Truck, Box, Users } from 'lucide-react';

interface HubStats {
  parcelsAtHub: number;
  inboundParcels: number;
  outboundParcels: number;
  activeRiders: number;
  hubActivity: Array<{
    id: string;
    recipientName: string;
    status: string;
    updatedAt: string;
    rider: { user: { phone: string } } | null;
  }>;
}

export default function HubManagerDashboardPage() {
  const [stats, setStats] = useState<HubStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'AT_HUB' | 'INBOUND' | 'OUTBOUND'>('AT_HUB');
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const data = await apiClient<HubStats>('dashboard/hub', {
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

  const filteredActivity = stats.hubActivity.filter((parcel) => {
    if (activeTab === 'AT_HUB') return parcel.status === 'AT_HUB';
    if (activeTab === 'INBOUND') return parcel.status === 'IN_TRANSIT';
    if (activeTab === 'OUTBOUND') return parcel.status === 'OUT_FOR_DELIVERY';
    return true;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Hub Manager Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-primary">
            <Box size={32} />
          </div>
          <div className="stat-title">At Hub</div>
          <div className="stat-value text-primary">{stats.parcelsAtHub}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-secondary">
            <Truck size={32} />
          </div>
          <div className="stat-title">Inbound</div>
          <div className="stat-value text-secondary">{stats.inboundParcels}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-accent">
            <Package size={32} />
          </div>
          <div className="stat-title">Outbound</div>
          <div className="stat-value text-accent">{stats.outboundParcels}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-info">
            <Users size={32} />
          </div>
          <div className="stat-title">Active Riders</div>
          <div className="stat-value text-info">{stats.activeRiders}</div>
        </div>
      </div>

      <div className="bg-base-100 rounded-box shadow flex flex-col overflow-hidden">
        <div className="tabs tabs-boxed bg-base-200 p-2 m-4 inline-flex w-fit">
          <button 
            className={`tab ${activeTab === 'AT_HUB' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('AT_HUB')}
          >
            At Hub
          </button>
          <button 
            className={`tab ${activeTab === 'INBOUND' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('INBOUND')}
          >
            Inbound
          </button>
          <button 
            className={`tab ${activeTab === 'OUTBOUND' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('OUTBOUND')}
          >
            Outbound
          </button>
        </div>

        <div className="overflow-x-auto p-4 pt-0 flex-1">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Rider Phone</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivity.map((parcel) => (
                <tr key={parcel.id}>
                  <td className="font-mono text-xs">{parcel.id.slice(0, 8)}...</td>
                  <td>{parcel.recipientName}</td>
                  <td>
                    <span className="badge badge-sm badge-outline">
                      {parcel.status}
                    </span>
                  </td>
                  <td>{parcel.rider?.user?.phone || '-'}</td>
                  <td className="text-xs">
                    {new Date(parcel.updatedAt).toLocaleString()}
                  </td>
                  <td>
                    {parcel.status === 'AT_HUB' && (
                      <button className="btn btn-xs btn-primary btn-outline">
                        Assign Rider
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredActivity.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-sm opacity-50 py-8">
                    No parcels found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
