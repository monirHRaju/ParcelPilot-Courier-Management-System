'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus, FileUp, Truck, HeadphonesIcon, Search, ArrowUpRight, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const TABS = [
  'All', 'List by Date', 'Pending', 'Approval Pending', 'Delivered', 
  'Partly Delivered', 'Cancelled', 'In Review', 'Exceptional', 'Pick-n-Drop'
];

export default function MerchantParcelsPage() {
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchParcels = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setParcels([]);
        setLoading(false);
        return;
      }
      try {
        const response = await apiClient<{ parcels: any[] }>('parcels/mine', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ parcels: [] }));
        setParcels(response.parcels || []);
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
    const matchesTab = 
      activeTab === 'All' || 
      (activeTab === 'Pending' && p.status === 'PENDING') ||
      (activeTab === 'Delivered' && p.status === 'DELIVERED') ||
      (activeTab === 'Cancelled' && (p.status === 'CANCELLED' || p.status === 'RETURNED')) ||
      p.status?.toLowerCase().includes(activeTab.toLowerCase().replace(/-/g, '_'));

    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      !searchQuery ||
      p.id?.toLowerCase().includes(query) ||
      p.recipientName?.toLowerCase().includes(query) ||
      p.recipientPhone?.toLowerCase().includes(query);

    return matchesTab && matchesQuery;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Delivered</Badge>;
      case 'CANCELLED':
      case 'RETURNED':
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30">{status}</Badge>;
      case 'IN_TRANSIT':
      case 'PICKED_UP':
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">{status.replace(/_/g, ' ')}</Badge>;
      default:
        return <Badge variant="secondary">{status?.replace(/_/g, ' ') || 'Pending'}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Quick Links */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 py-1">
        <Link href="/merchant/parcels">
          <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-medium gap-1.5 border-border">
            <span>🔖</span> Consignments
          </Button>
        </Link>
        <Link href="/merchant/parcels/new">
          <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-medium gap-1.5 border-border text-primary hover:bg-primary/10">
            <span>➕</span> Add Parcel
          </Button>
        </Link>
        <Link href="/merchant/bulk-print">
          <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-medium gap-1.5 border-border text-amber-600">
            <span>⬆️</span> Bulk Import
          </Button>
        </Link>
        <Link href="/merchant/pickup-requests">
          <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-medium gap-1.5 border-border text-blue-600">
            <span>🚚</span> Pickup Request
          </Button>
        </Link>
        <Link href="/merchant/support">
          <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-medium gap-1.5 border-border text-cyan-600">
            <span>🎧</span> Support
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Consignments & Parcels</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Filter, track and inspect real-time deliveries</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                type="text" 
                placeholder="Search ID, Name, Phone..." 
                className="pl-8 h-9 text-xs focus-visible:ring-primary rounded-full"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/merchant/parcels/new">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 rounded-full gap-1.5 text-xs shadow-sm">
                <Plus size={15} /> Book Parcel
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Shadcn Data Table */}
        <Card className="border-border/80 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border">
                <TableHead className="w-12 font-bold text-foreground">SL#</TableHead>
                <TableHead className="font-bold text-foreground">Date</TableHead>
                <TableHead className="font-bold text-foreground">Tracking ID</TableHead>
                <TableHead className="font-bold text-foreground">Customer Name</TableHead>
                <TableHead className="font-bold text-foreground">Payment (COD)</TableHead>
                <TableHead className="font-bold text-foreground">Delivery Charge</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="text-right font-bold text-foreground pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <span className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></span>
                    <p className="text-xs text-muted-foreground mt-2">Loading consignments...</p>
                  </TableCell>
                </TableRow>
              ) : filteredParcels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Package size={24} />
                      </div>
                      <p className="font-semibold text-sm text-foreground">No parcels found</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        There are no consignments matching your selected status filter or search criteria.
                      </p>
                      <Link href="/merchant/parcels/new" className="pt-2">
                        <Button size="sm" variant="outline" className="text-xs text-primary border-primary/30 hover:bg-primary/10">
                          Create First Parcel
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredParcels.map((parcel, idx) => (
                  <TableRow key={parcel.id} className="hover:bg-muted/30 border-border">
                    <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {parcel.createdAt ? format(new Date(parcel.createdAt), 'dd-MM-yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {parcel.id?.slice(0, 8).toUpperCase() || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs text-foreground">{parcel.recipientName}</div>
                      <div className="text-[11px] text-muted-foreground">{parcel.recipientPhone}</div>
                    </TableCell>
                    <TableCell className="font-bold text-xs">
                      ৳{((parcel.codAmount || 0) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      ৳{((parcel.totalFee || 0) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(parcel.status)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Link href={`/merchant/parcels/${parcel.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1 px-2.5">
                          View Details <ArrowUpRight size={12} />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
      
      <div className="text-center text-xs text-muted-foreground py-4 border-t border-border">
        © 2026 ParcelPilot. All rights reserved
      </div>
    </div>
  );
}
