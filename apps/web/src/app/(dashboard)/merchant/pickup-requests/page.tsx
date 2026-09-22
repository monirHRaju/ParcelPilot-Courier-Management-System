'use client';

import { useState } from 'react';
import { Truck, Plus, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PickupRequestsPage() {
  const [parcelsCount, setParcelsCount] = useState('5');
  const [pickupSlot, setPickupSlot] = useState('4pm-7pm');
  const [pickupAddress, setPickupAddress] = useState('House 14, Road 7, Block D, Banani, Dhaka');
  const [submitted, setSubmitted] = useState(false);

  const [requests, setRequests] = useState([
    { id: 'PK-9041', date: 'Today', slot: '4:00 PM - 7:00 PM', count: 12, status: 'ASSIGNED', rider: 'Tanvir Hossain (01811223344)' },
    { id: 'PK-8912', date: 'Yesterday', slot: '12:00 PM - 3:00 PM', count: 8, status: 'COMPLETED', rider: 'Mehedi Hasan' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: `PK-${Math.floor(Math.random() * 9000) + 1000}`,
      date: 'Today',
      slot: pickupSlot === '4pm-7pm' ? '4:00 PM - 7:00 PM' : '11:00 AM - 2:00 PM',
      count: Number(parcelsCount),
      status: 'PENDING',
      rider: 'Assigning nearest rider...'
    };
    setRequests([newReq, ...requests]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Truck className="text-primary" size={26} />
            Pickup Requests
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Schedule door-to-door rider pickups from your merchant warehouse or outlet.
          </p>
        </div>
      </div>

      {submitted && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 text-sm">
          <CheckCircle2 size={18} />
          <span>Your pickup request has been scheduled! A delivery partner is being assigned.</span>
        </div>
      )}

      {/* Booking Form Card */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Schedule New Pickup</CardTitle>
          <CardDescription className="text-xs">Riders will arrive within the selected pickup timeframe</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Estimated Parcels</label>
              <Input
                type="number"
                value={parcelsCount}
                onChange={e => setParcelsCount(e.target.value)}
                min="1"
                required
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Pickup Window</label>
              <select
                value={pickupSlot}
                onChange={e => setPickupSlot(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="11am-2pm">Morning Window (11:00 AM - 2:00 PM)</option>
                <option value="4pm-7pm">Evening Window (4:00 PM - 7:00 PM)</option>
              </select>
            </div>

            <div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 rounded-xl">
                <Plus size={16} className="mr-1" /> Request Rider
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Pickup Logs</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold">Request ID</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Time Window</TableHead>
              <TableHead className="font-bold">Estimated Count</TableHead>
              <TableHead className="font-bold">Assigned Rider</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map(req => (
              <TableRow key={req.id}>
                <TableCell className="font-mono text-xs font-semibold text-primary">{req.id}</TableCell>
                <TableCell className="text-xs">{req.date}</TableCell>
                <TableCell className="text-xs font-medium">{req.slot}</TableCell>
                <TableCell className="text-xs">{req.count} parcels</TableCell>
                <TableCell className="text-xs text-muted-foreground">{req.rider}</TableCell>
                <TableCell>
                  <Badge variant={req.status === 'COMPLETED' ? 'outline' : 'secondary'} className={req.status === 'COMPLETED' ? 'border-emerald-500 text-emerald-600' : ''}>
                    {req.status}
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
