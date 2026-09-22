'use client';

import { useState } from 'react';
import { Box, ScanLine, Search, Filter, CheckCircle2, AlertTriangle, Eye, Truck, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import toast from 'react-hot-toast';

type ParcelType = 'INBOUND' | 'OUTBOUND';
type ParcelStatus = 'RECEIVED_AT_HUB' | 'BAGGED' | 'ASSIGNED_TO_RIDER';

interface HubParcel {
  id: string;
  destination: string;
  type: ParcelType;
  status: ParcelStatus;
  scannedAt: string;
  recipient: string;
  weight: string;
  codAmount: number;
}

export default function HubParcelsPage() {
  const [barcode, setBarcode] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ParcelType | 'ALL'>('ALL');
  const [selectedParcel, setSelectedParcel] = useState<HubParcel | null>(null);

  const [parcels, setParcels] = useState<HubParcel[]>([
    { id: 'PP-1049-DHM', destination: 'Dhanmondi Zone', type: 'INBOUND', status: 'RECEIVED_AT_HUB', scannedAt: '10 mins ago', recipient: 'John Doe', weight: '1.2 kg', codAmount: 1500 },
    { id: 'PP-1052-GRN', destination: 'Green Road Zone', type: 'INBOUND', status: 'RECEIVED_AT_HUB', scannedAt: '25 mins ago', recipient: 'Alice Smith', weight: '0.5 kg', codAmount: 0 },
    { id: 'PP-0982-GLS', destination: 'Gulshan Branch Hub', type: 'OUTBOUND', status: 'BAGGED', scannedAt: '1 hour ago', recipient: 'Bob Johnson', weight: '2.5 kg', codAmount: 3200 },
    { id: 'PP-0985-UTT', destination: 'Uttara Hub', type: 'OUTBOUND', status: 'ASSIGNED_TO_RIDER', scannedAt: '2 hours ago', recipient: 'Sarah Lee', weight: '0.8 kg', codAmount: 500 },
  ]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    
    // Validation: simple mock regex for PP-XXXX format
    const trackingCodeRegex = /^PP-\d{4}(-[A-Z]{3})?$/i;
    
    if (!trackingCodeRegex.test(barcode.trim())) {
      toast.error('Invalid tracking number format. Must start with PP-');
      return;
    }

    // Check for duplicate
    if (parcels.some(p => p.id.toUpperCase() === barcode.trim().toUpperCase())) {
      toast.error('This parcel is already in the hub inventory.');
      return;
    }

    const newParcel: HubParcel = {
      id: barcode.toUpperCase().trim(),
      destination: 'Central Sorting',
      type: 'INBOUND',
      status: 'RECEIVED_AT_HUB',
      scannedAt: 'Just now',
      recipient: 'Unknown',
      weight: '1.0 kg',
      codAmount: 0
    };
    
    setParcels([newParcel, ...parcels]);
    setLastScanned(newParcel.id);
    toast.success(`Parcel ${newParcel.id} successfully added.`);
    setBarcode('');
  };

  const filteredParcels = parcels.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Box className="text-primary" size={26} />
            Hub Parcels Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all inbound and outbound shipments at your hub.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 border-border/80 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ScanLine className="text-primary" size={18} /> Rapid Scanner
            </CardTitle>
            <CardDescription className="text-xs">Scan or enter tracking ID to log inbound arrival. Format: PP-XXXX</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScan} className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="e.g. PP-1234-XYZ"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                className="font-mono focus-visible:ring-primary uppercase h-12 text-lg text-center tracking-wider"
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10">
                Scan & Receive
              </Button>
            </form>

            {lastScanned && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-start gap-2">
                <CheckCircle2 className="text-emerald-500 mt-0.5" size={16} /> 
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-tight">
                  Parcel <span className="font-bold">{lastScanned}</span> verified and recorded into hub stock.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 border-border/80 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Current Hub Warehouse Stock</CardTitle>
              <Badge variant="secondary">{filteredParcels.length} Parcels</Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  placeholder="Search by ID or destination..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={filterType === 'ALL' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('ALL')}
                >
                  All
                </Button>
                <Button 
                  variant={filterType === 'INBOUND' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('INBOUND')}
                >
                  Inbound
                </Button>
                <Button 
                  variant={filterType === 'OUTBOUND' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('OUTBOUND')}
                >
                  Outbound
                </Button>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold text-xs whitespace-nowrap">Tracking ID</TableHead>
                  <TableHead className="font-semibold text-xs whitespace-nowrap">Type</TableHead>
                  <TableHead className="font-semibold text-xs whitespace-nowrap">Destination</TableHead>
                  <TableHead className="font-semibold text-xs whitespace-nowrap">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParcels.map((p, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30">
                    <TableCell>
                      <button 
                        onClick={() => setSelectedParcel(p)}
                        className="font-mono text-sm font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        {p.id}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${p.type === 'INBOUND' ? 'border-blue-500 text-blue-500' : 'border-orange-500 text-orange-500'}`}>
                        {p.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{p.destination}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {p.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setSelectedParcel(p)}>
                          <Eye size={16} />
                        </Button>
                        {p.status === 'RECEIVED_AT_HUB' && (
                          <Button variant="outline" size="sm" className="h-8 text-xs bg-primary/5 text-primary border-primary/20">
                            <UserPlus size={14} className="mr-1" /> Assign
                          </Button>
                        )}
                        {p.status === 'BAGGED' && (
                          <Button variant="outline" size="sm" className="h-8 text-xs bg-secondary/5 text-secondary border-secondary/20">
                            <Truck size={14} className="mr-1" /> Dispatch
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredParcels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No parcels match your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Sheet open={!!selectedParcel} onOpenChange={(open) => !open && setSelectedParcel(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Box className="text-primary" size={20} /> Parcel Details
            </SheetTitle>
            <SheetDescription>View information and manage this parcel.</SheetDescription>
          </SheetHeader>
          
          {selectedParcel && (
            <div className="py-6 space-y-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tracking ID</p>
                <p className="text-2xl font-mono font-bold tracking-tight">{selectedParcel.id}</p>
                <Badge variant="outline" className={`mt-2 ${selectedParcel.type === 'INBOUND' ? 'border-blue-500 text-blue-500' : 'border-orange-500 text-orange-500'}`}>
                  {selectedParcel.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-muted/40 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <p className="font-semibold text-sm">{selectedParcel.status.replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-1 bg-muted/40 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Scanned Time</p>
                  <p className="font-semibold text-sm">{selectedParcel.scannedAt}</p>
                </div>
                <div className="space-y-1 bg-muted/40 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="font-semibold text-sm">{selectedParcel.weight}</p>
                </div>
                <div className="space-y-1 bg-muted/40 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">COD Amount</p>
                  <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">৳{selectedParcel.codAmount}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm border-b border-border pb-2">Delivery Information</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="col-span-2 font-medium">{selectedParcel.recipient}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Destination:</span>
                  <span className="col-span-2 font-medium">{selectedParcel.destination}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                {selectedParcel.status === 'RECEIVED_AT_HUB' && (
                  <Button className="w-full">
                    <UserPlus className="mr-2" size={16} /> Assign to Rider
                  </Button>
                )}
                {selectedParcel.status === 'BAGGED' && (
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <Truck className="mr-2" size={16} /> Send to Dispatch
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => setSelectedParcel(null)}>
                  Close Panel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
