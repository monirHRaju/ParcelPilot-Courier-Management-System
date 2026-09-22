'use client';

import { useState } from 'react';
import { Car, MapPin, Phone, CheckCircle, Clock, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import toast from 'react-hot-toast';

export default function RiderDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([
    { id: 'PP-1049', customer: 'Rakib Hasan', phone: '01711223344', address: 'House 5, Road 2, Dhanmondi', cod: 1450, status: 'OUT_FOR_DELIVERY' },
    { id: 'PP-1052', customer: 'Tasmia Sultana', phone: '01899112233', address: 'Apartment 4B, Green Road', cod: 890, status: 'OUT_FOR_DELIVERY' },
    { id: 'PP-1011', customer: 'Jahidul Islam', phone: '01655443322', address: 'Road 8, Kalabagan', cod: 2100, status: 'DELIVERED' },
  ]);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleMarkDelivered = (id: string) => {
    setLoadingId(id);
    
    // Simulate network request
    setTimeout(() => {
      setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'DELIVERED' } : d));
      setLoadingId(null);
      toast.success(`Parcel ${id} successfully delivered!`);
    }, 800);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-foreground">
            <Car className="text-primary hidden sm:block" size={32} />
            My Active Deliveries
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deliver assigned consignments, navigate routes, and collect cash on delivery.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80 shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Pending Handover</p>
            <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">
              {deliveries.filter(d => d.status === 'OUT_FOR_DELIVERY').length} Orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Completed Today</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-500">
              {deliveries.filter(d => d.status === 'DELIVERED').length} Orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm border-l-4 border-l-primary bg-primary/5">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Cash in Hand to Deposit</p>
            <p className="text-2xl font-bold mt-1 text-primary">
              ৳{deliveries.filter(d => d.status === 'DELIVERED').reduce((acc, curr) => acc + curr.cod, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Assigned Parcels Queue</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Tracking ID</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Customer Details</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Address</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">COD Amount</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Status</TableHead>
                <TableHead className="text-right font-semibold text-xs whitespace-nowrap pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map(d => (
                <TableRow key={d.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm font-bold text-primary">{d.id}</TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold">{d.customer}</p>
                    <a href={`tel:${d.phone}`} className="text-xs text-primary flex items-center gap-1 hover:underline mt-0.5">
                      <Phone size={12} /> {d.phone}
                    </a>
                  </TableCell>
                  <TableCell className="text-sm max-w-[250px] truncate" title={d.address}>{d.address}</TableCell>
                  <TableCell className="text-sm font-bold text-emerald-600 dark:text-emerald-400">৳{d.cod}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={d.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'}
                    >
                      {d.status === 'DELIVERED' ? 'Delivered' : 'Out for Delivery'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {d.status === 'DELIVERED' ? (
                      <span className="text-sm text-emerald-600 font-semibold flex items-center justify-end gap-1.5">
                        <CheckCircle size={16} /> Completed
                      </span>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkDelivered(d.id)} 
                        disabled={loadingId === d.id}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold min-w-[130px]"
                      >
                        {loadingId === d.id ? 'Processing...' : 'Complete Delivery'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
