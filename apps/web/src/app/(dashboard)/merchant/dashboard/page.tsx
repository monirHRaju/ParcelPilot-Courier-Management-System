'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  PackagePlus, Truck, MapPin, Wallet, List, HeadphonesIcon,
  Archive, CreditCard, FileUp, FileDown, BarChart2, Edit3
} from 'lucide-react';

interface MerchantStats {
  walletBalance: number;
  pendingPayouts: number;
  totalParcels: number;
  deliveredParcels: number;
  returnRate: number;
  recentParcels: Array<{ id: string; status: string; recipientName: string; codAmount: number; }>;
  statusDistribution: Array<{ status: string; count: number; }>;
}

const dummyPerformanceData = Array.from({length: 12}, (_, i) => ({
  name: `Day ${i+1}`,
  uv: Math.floor(Math.random() * 4000) + 1000,
}));

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // router.push('/login'); // commenting out for demo if backend isn't ready
        // return;
      }
      try {
        // fallback to dummy data for UI display if backend fails
        const data = await apiClient<MerchantStats>('dashboard/merchant', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({
          walletBalance: 1500000,
          pendingPayouts: 25000,
          totalParcels: 142,
          deliveredParcels: 120,
          returnRate: 2.5,
          recentParcels: [],
          statusDistribution: []
        }));
        setStats(data as MerchantStats);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load dashboard data');
      }
    };
    fetchStats();
  }, [router]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Status Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <div className="badge badge-lg py-4 px-6 border-warning text-warning bg-warning/10 font-semibold gap-2">
          Delivery Processing: <span className="bg-warning text-warning-content px-2 rounded">0</span>
        </div>
        <div className="badge badge-lg py-4 px-6 border-success text-success bg-success/10 font-semibold gap-2">
          COD Processing: <span className="bg-success text-success-content px-2 rounded">0</span>
        </div>
        <div className="badge badge-lg py-4 px-6 border-error text-error bg-error/10 font-semibold gap-2">
          Return Requests: <span className="bg-error text-error-content px-2 rounded">0</span>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { name: 'Add Parcel', icon: PackagePlus, color: 'text-emerald-500', href: '/merchant/parcels/new' },
          { name: 'Pickup Request', icon: Truck, color: 'text-orange-500', href: '#' },
          { name: 'Pick n Drop', icon: MapPin, color: 'text-red-500', href: '#' },
          { name: 'Payment Request', icon: Wallet, color: 'text-blue-500', href: '#' },
          { name: 'Latest Entries', icon: List, color: 'text-emerald-500', href: '#' },
          { name: 'Support', icon: HeadphonesIcon, color: 'text-cyan-500', href: '#' },
        ].map((item) => (
          <Link href={item.href} key={item.name} className="bg-base-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer border border-base-200">
            <div className={`p-3 rounded-xl bg-base-200/50 ${item.color}`}>
              <item.icon size={28} />
            </div>
            <span className="font-semibold text-sm">{item.name}</span>
          </Link>
        ))}
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          'Consignments', 'Payments', 'Bulk Import', 'Export', 'Stats', 'Amount Change'
        ].map((name) => (
          <Link href="/merchant/parcels" key={name} className="bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium rounded-xl py-3 text-center text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
            {name}
          </Link>
        ))}
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          'Pending Parcel', "Today's Cancelled", 'Latest Return', 'Cancellation Requests'
        ].map((name) => (
          <div key={name} className="bg-base-100 border border-base-200 rounded-xl py-4 text-center font-semibold text-sm shadow-sm cursor-pointer hover:border-emerald-200">
            {name}
          </div>
        ))}
      </div>

      {/* Promo Banner Placeholder */}
      <div className="bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 rounded-xl p-3 flex justify-between items-center text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="bg-pink-500 text-white px-2 py-1 rounded text-xs font-bold tracking-widest">PIXELAX</span>
          প্যাকেজিং পলি, কার্টুন স্কচটেপসহ যেকোনো প্যাকেজিং সাপোর্টের জন্য এখানে ক্লিক করুন
        </div>
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded bg-orange-400 border-2 border-base-100"></div>
          <div className="w-8 h-8 rounded bg-yellow-400 border-2 border-base-100"></div>
          <div className="w-8 h-8 rounded bg-blue-400 border-2 border-base-100"></div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-bold">Delivery Performance</h3>
            <button className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-none">View Graph</button>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dummyPerformanceData}>
                <Bar dataKey="uv" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-bold">Parcel Summary</h3>
            <button className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-none">View Summary</button>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyPerformanceData}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="uv" stroke="#10b981" fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-base-content/50 py-4">
        © 2026 SteadFast. All rights reserved
      </div>
    </div>
  );
}
