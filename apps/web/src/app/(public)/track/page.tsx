'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TrackParcelPage() {
  const [trackingId, setTrackingId] = useState('');
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track/${trackingId.trim()}`);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-base-300">
      <div className="w-full max-w-2xl text-center space-y-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-base-content tracking-tight">Track Your Parcel</h1>
        <p className="text-base-content/70 text-lg">
          Enter your tracking ID or phone number to get live updates on your consignment.
        </p>
        
        <form onSubmit={handleTrack} className="mt-8 relative max-w-xl mx-auto flex items-center">
          <Search className="absolute left-4 text-base-content/40" size={20} />
          <Input 
            type="text" 
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="e.g., SFR260918ST1D95AC2BD or 01712345678" 
            className="w-full pl-12 pr-32 py-6 text-lg rounded-full bg-base-100 border-2 border-base-200 focus:border-primary shadow-sm"
          />
          <Button 
            type="submit" 
            size="lg"
            className="absolute right-2 rounded-full font-bold px-6 h-10"
            disabled={!trackingId.trim()}
          >
            Track <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>

        <div className="pt-8 text-sm text-base-content/50">
          <p>Don&apos;t have a tracking ID? <a href="/login" className="text-primary hover:underline">Login to your dashboard</a></p>
        </div>
      </div>
    </div>
  );
}
