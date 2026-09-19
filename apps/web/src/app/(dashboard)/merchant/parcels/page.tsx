'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus, FileUp, Truck, HeadphonesIcon } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';

export default function MerchantParcelsPage() {
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Pending');

  const router = useRouter();

  useEffect(() => {
    const fetchParcels = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // Fallback for demo
        setParcels([]);
        setLoading(false);
        return;
      }
      try {
        const response = await apiClient<{ parcels: any[] }>('parcels/mine', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ parcels: [] }));
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

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 bg-base-100 min-h-full">
      
      {/* Top Quick Links */}
      <div className="flex flex-wrap items-center justify-center gap-3 py-2">
        <Link href="/merchant/parcels" className="btn btn-xs rounded-full bg-base-200 border-none font-medium gap-1 text-base-content/80 hover:bg-base-300">
          <span className="text-red-500">🔖</span> Consignments
        </Link>
        <Link href="/merchant/parcels/new" className="btn btn-xs rounded-full bg-base-200 border-none font-medium gap-1 text-base-content/80 hover:bg-base-300">
          <span className="text-emerald-500">➕</span> Add Parcel
        </Link>
        <Link href="#" className="btn btn-xs rounded-full bg-base-200 border-none font-medium gap-1 text-base-content/80 hover:bg-base-300">
          <span className="text-orange-500">⬆️</span> Bulk Import
        </Link>
        <Link href="#" className="btn btn-xs rounded-full bg-base-200 border-none font-medium gap-1 text-base-content/80 hover:bg-base-300">
          <span className="text-yellow-500">🚚</span> Pickup request
        </Link>
        <Link href="#" className="btn btn-xs rounded-full bg-base-200 border-none font-medium gap-1 text-base-content/80 hover:bg-base-300">
          <span className="text-cyan-500">🎧</span> Support
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold mb-4">All Parcel</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-base-200 pb-2">
          {[
            'All', 'List by Date', 'Pending', 'Approval Pending', 'Delivered', 
            'Partly Delivered', 'Cancelled', 'In Review', 'Exceptional', 'Pick-n-Drop'
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                activeTab === tab 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-base-content/70 hover:bg-base-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-base-100 min-h-[400px]">
          <table className="table w-full text-sm">
            <thead className="bg-base-100 text-base-content/70 border-b-2 border-base-200">
              <tr>
                <th className="font-semibold pb-4">SL#</th>
                <th className="font-semibold pb-4">Date</th>
                <th className="font-semibold pb-4">Id</th>
                <th className="font-semibold pb-4">Customer Name</th>
                <th className="font-semibold pb-4">Payment</th>
                <th className="font-semibold pb-4">Charge</th>
                <th className="font-semibold pb-4">Status</th>
                <th className="font-semibold pb-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <span className="loading loading-spinner text-emerald-500"></span>
                  </td>
                </tr>
              ) : parcels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-24 text-base-content/40 font-medium text-lg">
                    No parcels found
                  </td>
                </tr>
              ) : (
                parcels.map((parcel, idx) => (
                  <tr key={parcel.id} className="hover border-b border-base-100">
                    <td>{idx + 1}</td>
                    <td>{format(new Date(parcel.createdAt), 'dd-MM-yyyy')}</td>
                    <td className="font-mono text-xs">{parcel.id.slice(0, 8).toUpperCase()}</td>
                    <td>{parcel.recipientName}</td>
                    <td>৳{(parcel.codAmount / 100).toFixed(2)}</td>
                    <td>৳{(parcel.totalFee / 100).toFixed(2)}</td>
                    <td>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-base-200 text-base-content/70">
                        {parcel.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/track/${parcel.id}`} className="text-emerald-500 hover:underline">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-center text-xs text-base-content/50 py-4 mt-8 border-t border-base-200">
        © 2026 SteadFast. All rights reserved
      </div>
    </div>
  );
}
