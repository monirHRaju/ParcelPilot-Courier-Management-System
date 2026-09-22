'use client';

import { useState } from 'react';
import { Box, ScanLine, ArrowRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function HubParcelsPage() {
  const [barcode, setBarcode] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const [parcels, setParcels] = useState([
    { id: 'PP-1049', destination: 'Dhanmondi Zone', type: 'INBOUND', status: 'RECEIVED_AT_HUB', scannedAt: '10 mins ago' },
    { id: 'PP-1052', destination: 'Green Road Zone', type: 'INBOUND', status: 'RECEIVED_AT_HUB', scannedAt: '25 mins ago' },
    { id: 'PP-0982', destination: 'Gulshan Branch Hub', type: 'OUTBOUND', status: 'BAGGED', scannedAt: '1 hour ago' },
  ]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) return;
    const newParcel = {
      id: barcode.toUpperCase(),
      destination: 'Central Sorting',
      type: 'INBOUND',
      status: 'RECEIVED_AT_HUB',
      scannedAt: 'Just now'
    };
    setParcels([newParcel, ...parcels]);
    setLastScanned(barcode.toUpperCase());
    setBarcode('');
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Box className="text-primary" size={26} />
            Hub Parcels & Sorting Inventory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Scan arriving linehaul bags and sort shipments for local rider distribution.
          </p>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScanLine className="text-primary" size={18} /> Rapid Barcode Scanner
          </CardTitle>
          <CardDescription className="text-xs">Scan or enter tracking ID to log inbound arrival</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="flex gap-3 max-w-md">
            <Input
              type="text"
              placeholder="Scan tracking code..."
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              className="font-mono text-sm focus-visible:ring-primary uppercase"
              autoFocus
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Scan In
            </Button>
          </form>

          {lastScanned && (
            <p className="text-xs text-emerald-600 font-semibold mt-3 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Parcel {lastScanned} verified and recorded into hub stock.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Hub Warehouse Stock</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold">Tracking ID</TableHead>
              <TableHead className="font-bold">Direction</TableHead>
              <TableHead className="font-bold">Destination Zone</TableHead>
              <TableHead className="font-bold">Scanned Time</TableHead>
              <TableHead className="font-bold">Hub Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcels.map((p, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-mono text-xs font-bold text-primary">{p.id}</TableCell>
                <TableCell className="text-xs font-medium">{p.type}</TableCell>
                <TableCell className="text-xs">{p.destination}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.scannedAt}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {p.status.replace(/_/g, ' ')}
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
