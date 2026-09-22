'use client';

import { useState } from 'react';
import { Car, MapPin, Phone, CheckCircle, Clock, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function RiderDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([
    { id: 'PP-1049', customer: 'Rakib Hasan', phone: '01711223344', address: 'House 5, Road 2, Dhanmondi', cod: 1450, status: 'OUT_FOR_DELIVERY' },
    { id: 'PP-1052', customer: 'Tasmia Sultana', phone: '01899112233', address: 'Apartment 4B, Green Road', cod: 890, status: 'OUT_FOR_DELIVERY' },
    { id: 'PP-1011', customer: 'Jahidul Islam', phone: '01655443322', address: 'Road 8, Kalabagan', cod: 2100, status: 'DELIVERED' },
  ]);

  const handleMarkDelivered = (id: string) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: 'DELIVERED' } : d));
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Car className="text-primary" size={26} />
            My Active Deliveries
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deliver assigned consignments, navigate routes, and collect cash on delivery.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Pending Handover</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">
              {deliveries.filter(d => d.status === 'OUT_FOR_DELIVERY').length} Orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Completed Today</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">
              {deliveries.filter(d => d.status === 'DELIVERED').length} Orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Cash in Hand to Deposit</p>
            <p className="text-2xl font-bold mt-1 text-foreground">৳2,100</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Assigned Parcels Queue</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold">Tracking ID</TableHead>
              <TableHead className="font-bold">Customer Details</TableHead>
              <TableHead className="font-bold">Address</TableHead>
              <TableHead className="font-bold">COD Amount</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs font-bold text-primary">{d.id}</TableCell>
                <TableCell>
                  <p className="text-xs font-semibold">{d.customer}</p>
                  <a href={`tel:${d.phone}`} className="text-[11px] text-primary flex items-center gap-1 hover:underline">
                    <Phone size={11} /> {d.phone}
                  </a>
                </TableCell>
                <TableCell className="text-xs max-w-xs">{d.address}</TableCell>
                <TableCell className="text-xs font-bold">৳{d.cod}</TableCell>
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
                    <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                      <CheckCircle size={14} /> Completed
                    </span>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleMarkDelivered(d.id)} 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8 text-xs"
                    >
                      Complete Delivery
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
