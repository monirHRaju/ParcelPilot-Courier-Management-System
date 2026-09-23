'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Phone, 
  Box, 
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Edit,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

import { use } from 'react';

export default function MerchantParcelDetailsPage({ params }: { params: Promise<{ parcelId: string }> }) {
  const unwrappedParams = use(params);
  const parcelId = unwrappedParams.parcelId;
  const [parcel, setParcel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchParcel = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await apiClient<any>(`parcels/${parcelId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParcel(response);
      } catch (err: any) {
        console.error(err);
        if (err.status === 401) {
          localStorage.removeItem('accessToken');
          router.push('/login');
          return;
        }
        setError(err.message || 'Failed to load parcel details');
      } finally {
        setLoading(false);
      }
    };
    fetchParcel();
  }, [parcelId, router]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>{error || 'Parcel not found'}</span>
        </div>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const codAmount = (parcel.codAmount || 0) / 100;
  const deliveryCharge = (parcel.totalFee || 0) / 100;
  const codCharge = codAmount * 0.01; // Mock 1% COD charge
  const amountToCollect = codAmount;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Parcel Details
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
              Tracking ID: <span className="font-mono font-bold text-primary">{parcel.id}</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border">
            <Edit size={14} /> Edit Parcel
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border">
            <Printer size={14} /> Print Label
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="border-border/80 bg-muted/20 overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Current Status</p>
              <div className="flex items-center gap-3">
                <Badge className={`text-base py-1 px-3 ${
                  parcel.status === 'DELIVERED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25' :
                  parcel.status === 'RETURNED' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25' :
                  'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                }`}>
                  {parcel.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 max-w-xl">
              {/* Stepper Mock */}
              <div className="relative flex justify-between items-center w-full mt-2">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 z-0 rounded-full"></div>
                <div className={`absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all`} 
                     style={{ width: parcel.status === 'DELIVERED' ? '100%' : parcel.status === 'IN_TRANSIT' ? '50%' : '20%' }}></div>
                
                {['Pending', 'Picked', 'In Transit', 'Delivered'].map((step, idx) => (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-background p-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      (parcel.status === 'DELIVERED') || 
                      (idx === 0) ||
                      (idx === 1 && parcel.status !== 'PENDING') ||
                      (idx === 2 && (parcel.status === 'IN_TRANSIT' || parcel.status === 'OUT_FOR_DELIVERY')) 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-border bg-background'
                    }`}>
                      <CheckCircle2 size={12} />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground hidden sm:block absolute top-7 w-max">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recipient Details */}
        <Card className="col-span-1 md:col-span-2 border-border/80 shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <User size={18} className="text-primary" /> Recipient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="font-medium text-sm text-foreground">{parcel.recipientName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
              <p className="font-medium text-sm text-foreground">{parcel.recipientPhone}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Delivery Address</p>
              <div className="flex items-start gap-2 text-sm text-foreground">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <span>
                  {parcel.deliveryAddress.addressLine}, {parcel.deliveryAddress.area}, {parcel.deliveryAddress.upazilaOrThana}, {parcel.deliveryAddress.district}
                </span>
              </div>
            </div>
            
            {parcel.merchantInvoice && (
              <div className="sm:col-span-2 mt-2 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Invoice ID / Reference</p>
                <p className="font-mono text-sm text-foreground font-medium">{parcel.merchantInvoice}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Details */}
        <Card className="col-span-1 border-border/80 shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <Box size={18} className="text-primary" /> Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Price (COD)</span>
              <span className="font-semibold text-foreground">৳{codAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Delivery Charge</span>
              <span className="font-semibold text-foreground">৳{deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">COD Charge (1%)</span>
              <span className="font-semibold text-foreground">৳{codCharge.toFixed(2)}</span>
            </div>
            
            <div className="divider my-0"></div>
            
            <div className="flex justify-between items-center bg-muted/40 p-3 rounded-lg">
              <span className="font-bold text-sm text-foreground">Receivable Amount</span>
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                ৳{(codAmount - deliveryCharge - codCharge).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking History */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock size={18} className="text-primary" /> Status History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date & Time</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Updated By / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Mock History based on creation date for now */}
                <tr className="hover:bg-muted/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(parcel.createdAt), 'MMM dd, yyyy - hh:mm a')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">PENDING</Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">Parcel Data Received from Merchant</td>
                </tr>
                {parcel.status !== 'PENDING' && (
                  <tr className="hover:bg-muted/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Fake later time */}
                      {format(new Date(new Date(parcel.createdAt).getTime() + 86400000), 'MMM dd, yyyy - hh:mm a')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        {parcel.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">System Auto Update</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
