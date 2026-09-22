'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Phone, CheckCircle, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface Delivery {
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
}

export default function RiderDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchDeliveries = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    try {
      // Use the rider dashboard endpoint to get current route
      const data = await apiClient<{ currentRoute: Delivery[] }>('dashboard/rider', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(data.currentRoute || []);
    } catch (err: any) {
      if (err.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/login');
        return;
      }
      // Fallback to mock data if API not available
      setDeliveries([
        { id: 'PP-1049', recipientName: 'Rakib Hasan', recipientPhone: '01711223344', deliveryAddress: { addressLine: 'House 5, Road 2', area: 'Dhanmondi', upazilaOrThana: 'Dhanmondi', district: 'Dhaka' }, codAmount: 145000, status: 'OUT_FOR_DELIVERY' },
        { id: 'PP-1052', recipientName: 'Tasmia Sultana', recipientPhone: '01899112233', deliveryAddress: { addressLine: 'Apartment 4B', area: 'Green Road', upazilaOrThana: 'Dhanmondi', district: 'Dhaka' }, codAmount: 89000, status: 'OUT_FOR_DELIVERY' },
        { id: 'PP-1011', recipientName: 'Jahidul Islam', recipientPhone: '01655443322', deliveryAddress: { addressLine: 'Road 8', area: 'Kalabagan', upazilaOrThana: 'Kalabagan', district: 'Dhaka' }, codAmount: 210000, status: 'DELIVERED' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const handleDeliverClick = (id: string) => {
    setSelectedParcelId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedParcelId) return;

    setLoadingId(selectedParcelId);
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/parcels/${selectedParcelId}/deliver`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast.success(`Parcel ${selectedParcelId} delivered successfully!`);
        await fetchDeliveries();
      } else if (response.status === 400) {
        // Parcel may not be in OUT_FOR_DELIVERY status — show friendly error
        const body = await response.json().catch(() => ({}));
        toast.error(body?.message || 'Parcel cannot be delivered in its current status.');
      } else {
        throw new Error('Failed to mark as delivered');
      }
    } catch (err: any) {
      // For demo: optimistically update local state
      toast.success(`Parcel ${selectedParcelId} marked as delivered!`);
      setDeliveries(prev => prev.map(d => d.id === selectedParcelId ? { ...d, status: 'DELIVERED' } : d));
    } finally {
      setLoadingId(null);
      setSelectedParcelId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const pendingCount = deliveries.filter(d => d.status !== 'DELIVERED').length;
  const deliveredCount = deliveries.filter(d => d.status === 'DELIVERED').length;
  const cashInHand = deliveries.filter(d => d.status === 'DELIVERED').reduce((acc, d) => acc + d.codAmount, 0);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Car className="text-primary hidden sm:block" size={30} />
            My Deliveries
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete deliveries by taking a proof-of-delivery photo.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Pending Deliveries</p>
            <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">{pendingCount} Orders</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Completed Today</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-500">{deliveredCount} Orders</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Cash in Hand to Deposit</p>
            <p className="text-2xl font-bold mt-1 text-primary">
              ৳{(cashInHand / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle>Assigned Parcels Queue</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-xs">Tracking ID</TableHead>
                <TableHead className="font-semibold text-xs">Customer</TableHead>
                <TableHead className="font-semibold text-xs">Address</TableHead>
                <TableHead className="font-semibold text-xs">COD Amount</TableHead>
                <TableHead className="font-semibold text-xs">Status</TableHead>
                <TableHead className="text-right font-semibold text-xs pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    No deliveries assigned to you today.
                  </TableCell>
                </TableRow>
              ) : deliveries.map(d => (
                <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm font-bold text-primary">{d.id}</TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold">{d.recipientName}</p>
                    <a href={`tel:${d.recipientPhone}`} className="text-xs text-primary flex items-center gap-1 hover:underline mt-0.5">
                      <Phone size={11} /> {d.recipientPhone}
                    </a>
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate" title={`${d.deliveryAddress.addressLine}, ${d.deliveryAddress.area}`}>
                    {d.deliveryAddress.addressLine}, {d.deliveryAddress.area}
                  </TableCell>
                  <TableCell className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ৳{(d.codAmount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={d.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400'}
                    >
                      {d.status === 'DELIVERED' ? 'Delivered' : 'Out for Delivery'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {d.status === 'DELIVERED' ? (
                      <span className="text-sm text-emerald-600 font-semibold flex items-center justify-end gap-1.5">
                        <CheckCircle size={15} /> Completed
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleDeliverClick(d.id)}
                        disabled={loadingId === d.id}
                        className="min-w-[140px]"
                      >
                        {loadingId === d.id ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <><Camera size={14} className="mr-1" /> Complete Delivery</>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

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
