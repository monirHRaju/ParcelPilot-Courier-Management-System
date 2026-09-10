'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Search, Filter, Plus, ArrowRight } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { format } from 'date-fns';

export default function MerchantParcelsPage() {
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchParcels = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await apiClient<{ parcels: any[] }>('parcels/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParcels(response.parcels);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load parcels');
      } finally {
        setLoading(false);
      }
    };
    fetchParcels();
  }, [router]);

  const filteredParcels = parcels.filter(p => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      p.id.toLowerCase().includes(searchLower) ||
      p.recipientName.toLowerCase().includes(searchLower) ||
      p.recipientPhone.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="alert alert-error"><span>{error}</span></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-base-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="text-primary" size={32} />
            My Parcels
          </h1>
          <p className="text-base-content/70 mt-1">Manage and track your delivery orders.</p>
        </div>
        
        <Link href="/merchant/parcels/new" className="btn btn-primary shadow-sm">
          <Plus size={18} /> Create Parcel
        </Link>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4 flex flex-col md:flex-row gap-4">
          <div className="form-control flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-base-content/50" />
            </div>
            <input 
              type="text" 
              placeholder="Search by ID, Name, or Phone..." 
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="form-control w-full md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-base-content/50" />
            </div>
            <select 
              className="select select-bordered w-full pl-10"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="AT_HUB">At Hub</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="RETURNED">Returned</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200/50">
              <tr>
                <th>Tracking ID / Date</th>
                <th>Recipient</th>
                <th>Destination</th>
                <th>Status</th>
                <th>COD Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-base-content/50">
                    No parcels found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredParcels.map(parcel => (
                  <tr key={parcel.id} className="hover">
                    <td>
                      <div className="font-mono text-xs font-semibold text-primary">{parcel.id}</div>
                      <div className="text-xs text-base-content/60 mt-1">
                        {format(new Date(parcel.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold">{parcel.recipientName}</div>
                      <div className="text-xs text-base-content/60">{parcel.recipientPhone}</div>
                    </td>
                    <td>
                      <div className="text-sm">{parcel.deliveryAddress?.district}</div>
                      <div className="text-xs text-base-content/60 truncate max-w-[150px]">
                        {parcel.deliveryAddress?.area}
                      </div>
                    </td>
                    <td>
                      <div className={`badge badge-sm font-bold ${
                        parcel.status === 'DELIVERED' ? 'badge-success' :
                        parcel.status === 'RETURNED' || parcel.status === 'CANCELLED' ? 'badge-error' :
                        'badge-info'
                      }`}>
                        {parcel.status.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold">৳{(parcel.codAmount / 100).toFixed(2)}</div>
                      <div className="text-xs text-base-content/60">
                        Fee: ৳{(parcel.totalFee / 100).toFixed(2)}
                      </div>
                    </td>
                    <td>
                      <Link 
                        href={`/track/${parcel.id}`} 
                        className="btn btn-ghost btn-sm btn-circle"
                        title="Track Parcel"
                        target="_blank"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
