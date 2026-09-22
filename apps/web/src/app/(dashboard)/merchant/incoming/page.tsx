'use client';

import { useState } from 'react';
import { Inbox, Package, ArrowDownLeft, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MerchantIncomingPage() {
  const [incomings, setIncomings] = useState([
    { id: 'RET-4921', originalId: 'PP-1092', recipient: 'Naimur Rahman', reason: 'Customer unreachable after 3 calls', status: 'IN_TRANSIT_TO_MERCHANT', date: 'Today' },
    { id: 'RET-3810', originalId: 'PP-0873', recipient: 'Sadia Khan', reason: 'Customer cancelled at doorstep', status: 'READY_FOR_HANDOVER', date: 'Yesterday' },
  ]);

  const handleReceive = (id: string) => {
    setIncomings(incomings.map(item => item.id === id ? { ...item, status: 'RECEIVED' } : item));
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Inbox className="text-primary" size={26} />
          Incoming & Return Parcels
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Track packages being returned to your warehouse or exchange parcels scheduled for handback.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">In Transit to Merchant</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">1</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
              <ArrowDownLeft size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Ready at Hub for Handover</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">1</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
              <Package size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Received This Month</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600">14</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
              <RotateCcw size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Incoming Shipments List</CardTitle>
          <CardDescription className="text-xs">Confirm receipt when our rider hands back returned parcels</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold">Return ID</TableHead>
              <TableHead className="font-bold">Original Order</TableHead>
              <TableHead className="font-bold">Customer</TableHead>
              <TableHead className="font-bold">Return Reason</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomings.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs font-bold text-primary">{item.id}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.originalId}</TableCell>
                <TableCell className="text-xs font-medium">{item.recipient}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{item.reason}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      item.status === 'RECEIVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                      item.status === 'READY_FOR_HANDOVER' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30' :
                      'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    }
                  >
                    {item.status.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  {item.status === 'RECEIVED' ? (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                      <CheckCircle2 size={13} /> Confirmed
                    </span>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleReceive(item.id)} 
                      className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      Confirm Return
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
