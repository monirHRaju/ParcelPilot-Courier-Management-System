'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { 
  BarChart, Bar, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  PackagePlus, Truck, MapPin, Wallet, List, HeadphonesIcon,
  Archive, CreditCard, FileUp, FileDown, BarChart2, Edit3, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MerchantStats {
  walletBalance: number;
  pendingPayouts: number;
  totalParcels: number;
  deliveredParcels: number;
  returnRate: number;
  recentParcels: Array<{ id: string; status: string; recipientName: string; codAmount: number; }>;
  statusDistribution: Array<{ status: string; count: number; }>;
}

const dummyPerformanceData = Array.from({ length: 12 }, (_, i) => ({
  name: `Day ${i + 1}`,
  uv: Math.floor(Math.random() * 4000) + 1000,
}));

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const data = await apiClient<MerchantStats>('dashboard/merchant', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
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
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
          <span>Delivery Processing:</span>
          <Badge variant="outline" className="bg-amber-500 text-white border-none px-2 py-0.5 text-xs font-bold">0</Badge>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <span>COD Processing:</span>
          <Badge variant="outline" className="bg-emerald-500 text-white border-none px-2 py-0.5 text-xs font-bold">0</Badge>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400">
          <span>Return Requests:</span>
          <Badge variant="outline" className="bg-rose-500 text-white border-none px-2 py-0.5 text-xs font-bold">0</Badge>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { name: 'Add Parcel', icon: PackagePlus, color: 'text-emerald-500 bg-emerald-500/10', href: '/merchant/parcels/new' },
          { name: 'Pickup Request', icon: Truck, color: 'text-amber-500 bg-amber-500/10', href: '/merchant/pickup-requests' },
          { name: 'Pick n Drop', icon: MapPin, color: 'text-rose-500 bg-rose-500/10', href: '/merchant/tracking' },
          { name: 'Payment Request', icon: Wallet, color: 'text-blue-500 bg-blue-500/10', href: '/merchant/wallet' },
          { name: 'Latest Entries', icon: List, color: 'text-emerald-500 bg-emerald-500/10', href: '/merchant/parcels' },
          { name: 'Support', icon: HeadphonesIcon, color: 'text-cyan-500 bg-cyan-500/10', href: '/merchant/support' },
        ].map((item) => (
          <Link href={item.href} key={item.name}>
            <Card className="h-full hover:shadow-md transition-all hover:border-primary/40 cursor-pointer border-border/80">
              <CardContent className="p-6 flex flex-col items-center justify-center gap-3 text-center">
                <div className={`p-3.5 rounded-2xl ${item.color}`}>
                  <item.icon size={26} />
                </div>
                <span className="font-semibold text-sm tracking-tight text-foreground">{item.name}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { name: 'Consignments', href: '/merchant/parcels' },
          { name: 'Payments', href: '/merchant/wallet' },
          { name: 'Bulk Import', href: '/merchant/bulk-print' },
          { name: 'Export', href: '/merchant/parcels' },
          { name: 'Stats', href: '/merchant/dashboard' },
          { name: 'Amount Change', href: '/merchant/parcels' },
        ].map((action) => (
          <Link href={action.href} key={action.name}>
            <Button 
              variant="outline" 
              className="w-full h-11 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 font-medium rounded-xl text-xs sm:text-sm"
            >
              {action.name}
            </Button>
          </Link>
        ))}
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Parcel', count: 0, href: '/merchant/parcels' },
          { label: "Today's Cancelled", count: 0, href: '/merchant/parcels' },
          { label: 'Latest Return', count: 0, href: '/merchant/parcels' },
          { label: 'Cancellation Requests', count: 0, href: '/merchant/parcels' },
        ].map((item) => (
          <Link href={item.href} key={item.label}>
            <Card className="hover:border-primary/40 transition-colors border-border/80 cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">{item.label}</span>
                <Badge variant="secondary" className="font-mono text-xs">{item.count}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-primary/15 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary text-primary-foreground font-bold tracking-wider uppercase text-xs">
            ParcelPilot AI
          </Badge>
          <span className="font-medium text-foreground">
            Smart routing & instant parcel address validation is now active on your merchant portal.
          </span>
        </div>
        <Link href="/merchant/parcels/new">
          <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-1 text-xs">
            Try Now <ArrowUpRight size={14} />
          </Button>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Delivery Performance</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Last 12 days success trajectory</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs text-primary border-primary/30 hover:bg-primary/10">
              View Graph
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dummyPerformanceData}>
                  <Bar dataKey="uv" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Parcel Summary</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Volume & dispatch trend</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs text-primary border-primary/30 hover:bg-primary/10">
              View Summary
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyPerformanceData}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="uv" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground py-4 border-t border-border">
        © 2026 ParcelPilot. All rights reserved
      </div>
    </div>
  );
}
