'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { Package, CheckCircle, Wallet, Camera } from 'lucide-react';

interface RiderStats {
  assignedParcels: number;
  deliveredToday: number;
  codToRemit: number;
  currentRoute: Array<{
    id: string;
    recipientName: string;
    recipientPhone: string;
    deliveryAddress: {
      addressLine: string;
      area: string;
      upazilaOrThana: string;
      district: string;
    };
    codAmount: number;
    status: string;
  }>;
}

export default function RiderDashboardPage() {
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  
  const router = useRouter();

  const fetchStats = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const data = await apiClient<RiderStats>('dashboard/rider', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard data');
    }
  };

  useEffect(() => {
    fetchStats();
  }, [router]);

  const handleMarkDeliveredClick = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedParcelId) return;

    setIsSubmitting(selectedParcelId);
    
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/parcels/${selectedParcelId}/deliver`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to mark as delivered');
      }

      await fetchStats(); // Refresh stats
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error marking parcel as delivered');
    } finally {
      setIsSubmitting(null);
      setSelectedParcelId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (error) {
    return (
      <div className="p-4">
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
    <div className="p-4 max-w-md mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold">Rider Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat bg-base-100 shadow rounded-box p-4">
          <div className="stat-title text-xs">Assigned</div>
          <div className="stat-value text-2xl text-primary">{stats.assignedParcels}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box p-4">
          <div className="stat-title text-xs">Delivered Today</div>
          <div className="stat-value text-2xl text-success">{stats.deliveredToday}</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-box p-4 col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-xs">COD to Remit</div>
              <div className="stat-value text-2xl text-warning">
                ৳{(stats.codToRemit / 100).toFixed(2)}
              </div>
            </div>
            <div className="text-warning opacity-80">
              <Wallet size={32} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Current Route</h2>
        <div className="space-y-4">
          {stats.currentRoute.map((parcel) => (
            <div key={parcel.id} className="card bg-base-100 shadow-md border border-base-200">
              <div className="card-body p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{parcel.recipientName}</h3>
                  <span className="badge badge-primary badge-outline">{parcel.id.slice(0, 8)}</span>
                </div>
                
                <p className="text-sm opacity-80 mb-2">
                  {parcel.deliveryAddress.addressLine}, {parcel.deliveryAddress.area}, {parcel.deliveryAddress.upazilaOrThana}
                </p>
                
                <p className="text-sm font-semibold mb-4">
                  Phone: <a href={`tel:${parcel.recipientPhone}`} className="text-primary link">{parcel.recipientPhone}</a>
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-base-200">
                  <div>
                    <div className="text-xs opacity-70">Collect COD</div>
                    <div className="font-bold text-lg">৳{(parcel.codAmount / 100).toFixed(2)}</div>
                  </div>
                  
                  <button 
                    className="btn btn-success"
                    onClick={() => handleMarkDeliveredClick(parcel.id)}
                    disabled={isSubmitting === parcel.id}
                  >
                    {isSubmitting === parcel.id ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <Camera size={18} />
                        Deliver
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {stats.currentRoute.length === 0 && (
            <div className="text-center p-8 bg-base-200 rounded-box">
              <Package size={48} className="mx-auto opacity-20 mb-4" />
              <p className="opacity-70">No parcels currently assigned to you.</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input for Proof of Delivery */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        onChange={handleFileChange} 
      />
    </div>
  );
}
