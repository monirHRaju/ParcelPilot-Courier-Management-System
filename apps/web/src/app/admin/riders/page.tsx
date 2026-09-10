'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { format } from 'date-fns';

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [hubs, setHubs] = useState<any[]>([]);

  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const [ridersRes, hubsRes] = await Promise.all([
        apiClient<{ riders: any[] }>('riders', { headers: { Authorization: `Bearer ${token}` } }),
        apiClient<{ hubs: any[] }>('hubs', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRiders(ridersRes.riders);
      setHubs(hubsRes.hubs);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleApprove = async (riderId: string, hubId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await apiClient(`riders/${riderId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ hubId: hubId || undefined })
      });
      // Refresh list
      fetchData();
    } catch (err: any) {
      console.error('Failed to approve rider', err);
      alert(err.message || 'Failed to approve rider');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-base-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-primary" size={32} />
            Rider Approvals
          </h1>
          <p className="text-base-content/70 mt-1">Review and approve newly registered riders.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : error ? (
        <div className="alert alert-error"><span>{error}</span></div>
      ) : (
        <div className="card bg-base-100 shadow border border-base-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200/50">
                <tr>
                  <th>Rider Details</th>
                  <th>Vehicle & Zone</th>
                  <th>NID / Joined</th>
                  <th>Status</th>
                  <th>Assign Hub (Optional)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-base-content/50">
                      No riders found.
                    </td>
                  </tr>
                ) : (
                  riders.map((rider) => (
                    <RiderRow key={rider.id} rider={rider} hubs={hubs} onApprove={handleApprove} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function RiderRow({ rider, hubs, onApprove }: { rider: any, hubs: any[], onApprove: (id: string, hubId: string) => void }) {
  const [selectedHub, setSelectedHub] = useState(rider.hubId || '');
  
  return (
    <tr className="hover">
      <td>
        <div className="font-semibold">{rider.user?.phone}</div>
        <div className="text-xs text-base-content/60 font-mono">ID: {rider.id.split('-')[0]}</div>
      </td>
      <td>
        <div className="badge badge-sm">{rider.vehicleType}</div>
        <div className="text-xs mt-1">{rider.coverageZone}</div>
      </td>
      <td>
        <div className="text-sm font-mono">{rider.nidNumber}</div>
        <div className="text-xs text-base-content/60">{format(new Date(rider.createdAt), 'MMM d, yyyy')}</div>
      </td>
      <td>
        {rider.isApproved ? (
          <span className="badge badge-success badge-sm gap-1"><CheckCircle size={12} /> Approved</span>
        ) : (
          <span className="badge badge-warning badge-sm gap-1"><XCircle size={12} /> Pending</span>
        )}
      </td>
      <td>
        {rider.isApproved ? (
          <span className="text-sm">{rider.hub?.name || 'No Hub'}</span>
        ) : (
          <select 
            className="select select-bordered select-sm w-full max-w-[150px]"
            value={selectedHub}
            onChange={e => setSelectedHub(e.target.value)}
          >
            <option value="">No Hub</option>
            {hubs.map(hub => (
              <option key={hub.id} value={hub.id}>{hub.name}</option>
            ))}
          </select>
        )}
      </td>
      <td>
        {!rider.isApproved && (
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => onApprove(rider.id, selectedHub)}
          >
            Approve
          </button>
        )}
      </td>
    </tr>
  );
}
