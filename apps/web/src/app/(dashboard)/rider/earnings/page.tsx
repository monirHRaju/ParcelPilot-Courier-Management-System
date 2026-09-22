'use client';

import { useState } from 'react';
import { Wallet, TrendingUp, Calendar, CheckCircle2, ArrowDownToLine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function RiderEarningsPage() {
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Wallet className="text-primary" size={26} />
            Rider Earnings & Commissions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track daily delivery fees, incentive milestones, and weekly disbursement summaries.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl gap-1.5 h-9 text-xs">
          <ArrowDownToLine size={15} /> Request Payout
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border/80 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">This Week Earnings</p>
            <p className="text-2xl font-bold mt-1 text-primary">৳4,850.00</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">+14% vs last week</p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Deliveries Completed</p>
            <p className="text-2xl font-bold mt-1 text-foreground">97</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">৳50 base fee per parcel</p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Weekly Target Bonus</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">৳750.00</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Unlocked 80+ parcels tier</p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Success Rating</p>
            <p className="text-2xl font-bold mt-1 text-foreground">4.9 ★</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Customer feedback score</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Delivery Earnings Log</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Total Drops</TableHead>
              <TableHead className="font-bold">Base Pay</TableHead>
              <TableHead className="font-bold">Bonus / Tip</TableHead>
              <TableHead className="font-bold">Total Payout</TableHead>
              <TableHead className="text-right font-bold pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { date: 'Yesterday (Friday)', drops: 22, base: 1100, bonus: 200, total: 1300, status: 'PAID' },
              { date: 'Thursday', drops: 18, base: 900, bonus: 100, total: 1000, status: 'PAID' },
              { date: 'Wednesday', drops: 25, base: 1250, bonus: 250, total: 1500, status: 'PAID' },
            ].map((row, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs font-semibold">{row.date}</TableCell>
                <TableCell className="text-xs">{row.drops} deliveries</TableCell>
                <TableCell className="text-xs">৳{row.base}</TableCell>
                <TableCell className="text-xs text-emerald-600 font-medium">+৳{row.bonus}</TableCell>
                <TableCell className="text-xs font-bold">৳{row.total}</TableCell>
                <TableCell className="text-right pr-6">
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    {row.status}
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
