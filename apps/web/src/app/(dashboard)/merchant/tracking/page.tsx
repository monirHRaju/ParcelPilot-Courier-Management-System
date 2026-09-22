'use client';

import { useState } from 'react';
import { MapPin, Search, CheckCircle2, Truck, Clock, ArrowRight, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MerchantTrackingPage() {
  const [trackingId, setTrackingId] = useState('');
  const [searchedData, setSearchedData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    setLoading(true);

    setTimeout(() => {
      setSearchedData({
        id: trackingId.toUpperCase(),
        status: 'OUT_FOR_DELIVERY',
        recipientName: 'Mominul Haque',
        phone: '01719998877',
        address: 'House 4B, Road 11, Uttara Sector 3, Dhaka',
        codAmount: 1850,
        riderName: 'Kamrul Islam',
        riderPhone: '01822334455',
        timeline: [
          { status: 'Order Booked', time: 'Yesterday 3:15 PM', done: true },
          { status: 'Picked Up from Merchant', time: 'Yesterday 6:40 PM', done: true },
          { status: 'Processed at Central Hub', time: 'Today 4:30 AM', done: true },
          { status: 'Out for Delivery (Rider Kamrul)', time: 'Today 9:15 AM', done: true, current: true },
          { status: 'Delivered & Cash Collected', time: 'Estimated 2:00 PM', done: false },
        ]
      });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <MapPin className="text-primary" size={26} />
          Live Parcel Tracking
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time GPS dispatch status, rider updates, and delivery milestone history.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Track Consignment ID</CardTitle>
          <CardDescription className="text-xs">Enter your 8 or 12 character tracking number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrack} className="flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="e.g. PP-892410 or UUID"
                className="pl-9 font-mono text-sm focus-visible:ring-primary uppercase"
                value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {loading ? 'Tracking...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchedData && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                  Out for Delivery
                </Badge>
                <CardTitle className="text-xl font-bold font-mono mt-2">{searchedData.id}</CardTitle>
                <CardDescription className="text-xs">COD Amount: ৳{searchedData.codAmount}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p><span className="text-muted-foreground">Recipient:</span> <strong className="text-foreground">{searchedData.recipientName}</strong> ({searchedData.phone})</p>
                <p><span className="text-muted-foreground">Address:</span> {searchedData.address}</p>
                <div className="pt-2 border-t border-border mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Assigned Rider:</p>
                    <p className="font-semibold text-foreground">{searchedData.riderName}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs text-primary border-primary/30 gap-1.5 h-8">
                    <Phone size={13} /> Call Rider
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Milestone Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {searchedData.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center ${
                        step.done ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
                      }`}>
                        {step.done && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${step.current ? 'text-primary' : 'text-foreground'}`}>
                          {step.status}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
