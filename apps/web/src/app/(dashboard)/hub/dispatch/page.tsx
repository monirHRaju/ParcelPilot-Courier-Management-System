'use client';

import { useState } from 'react';
import { Truck, Send, CheckCircle2, UserCheck, PackageCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function HubDispatchPage() {
  const [selectedRider, setSelectedRider] = useState('Kamrul Islam');
  const [dispatched, setDispatched] = useState(false);

  const [batches, setBatches] = useState([
    { batchId: 'BATCH-401', rider: 'Kamrul Islam (R-102)', zone: 'Dhanmondi / Kalabagan', count: 28, status: 'DISPATCHED', time: '9:00 AM' },
    { batchId: 'BATCH-402', rider: 'Mehedi Hasan (R-105)', zone: 'Mohammadpur', count: 32, status: 'DISPATCHED', time: '9:30 AM' },
    { batchId: 'BATCH-403', rider: 'Tanvir Hossain (R-108)', zone: 'Lalmatia', count: 19, status: 'PREPARING', time: 'Pending' },
  ]);

  const handleDispatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 3000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Truck className="text-primary" size={26} />
          Hub Dispatch & Rider Assignment
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Bundle sorted parcels into delivery runs and assign runsheet batches to field riders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Ready for Dispatch</p>
            <p className="text-2xl font-bold mt-1 text-primary">64 Parcels</p>
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Active Delivery Runs</p>
            <p className="text-2xl font-bold mt-1 text-foreground">6 Riders Out</p>
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Available Standby Riders</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">4 Riders</p>
          </CardContent>
        </Card>
      </div>

      {dispatched && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 text-sm">
          <CheckCircle2 size={18} />
          <span>Batch runsheet generated and pushed to rider's delivery app!</span>
        </div>
      )}

      {/* Assignment Card */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Quick Batch Handover</CardTitle>
          <CardDescription className="text-xs">Assign scanned route parcels to available delivery partner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-xs font-medium text-foreground">Select Delivery Rider</label>
              <select
                value={selectedRider}
                onChange={e => setSelectedRider(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="Kamrul Islam">Kamrul Islam (Dhanmondi Zone - 4.9★)</option>
                <option value="Mehedi Hasan">Mehedi Hasan (Mohammadpur Zone - 4.8★)</option>
                <option value="Tanvir Hossain">Tanvir Hossain (Lalmatia Zone - 5.0★)</option>
              </select>
            </div>

            <Button onClick={handleDispatch} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 px-6 rounded-xl gap-1.5">
              <Send size={15} /> Handover & Dispatch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today's Dispatch Runsheets</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold">Batch ID</TableHead>
              <TableHead className="font-bold">Delivery Rider</TableHead>
              <TableHead className="font-bold">Assigned Area</TableHead>
              <TableHead className="font-bold">Parcels</TableHead>
              <TableHead className="font-bold">Handover Time</TableHead>
              <TableHead className="text-right font-bold pr-6">Run Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map(b => (
              <TableRow key={b.batchId}>
                <TableCell className="font-mono text-xs font-bold text-primary">{b.batchId}</TableCell>
                <TableCell className="text-xs font-semibold">{b.rider}</TableCell>
                <TableCell className="text-xs">{b.zone}</TableCell>
                <TableCell className="text-xs">{b.count} shipments</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.time}</TableCell>
                <TableCell className="text-right pr-6">
                  <Badge 
                    variant="outline" 
                    className={b.status === 'DISPATCHED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'}
                  >
                    {b.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
