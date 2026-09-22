'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, ArrowRight, Clock, MapPin, Truck } from 'lucide-react';

const RECENT_EXAMPLES = ['PP-1001', 'PP-1029', 'PP-1052'];

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
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      {/* Navbar */}
      <nav className="bg-base-100/80 backdrop-blur-sm border-b border-base-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-content font-black text-xs">PP</span>
            </div>
            <span className="font-bold text-base">ParcelPilot</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Search */}
      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-base-content mb-4 tracking-tight">
          Track Your Parcel
        </h1>
        <p className="text-base-content/60 text-lg mb-10 max-w-lg">
          Enter your tracking ID or phone number to get live status updates on your delivery.
        </p>

        <form onSubmit={handleTrack} className="w-full max-w-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-base-content/40 shrink-0" size={20} />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g., PP-1001 or 01712345678"
              className="input input-bordered w-full pl-12 pr-32 py-4 text-base h-14 rounded-2xl focus:input-primary shadow-lg bg-base-100"
              autoFocus
            />
            <button
              type="submit"
              disabled={!trackingId.trim()}
              className="btn btn-primary absolute right-2 h-10 rounded-xl font-bold px-5 disabled:opacity-40"
            >
              Track <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* Example tracking IDs */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-base-content/40">Try:</span>
          {RECENT_EXAMPLES.map((id) => (
            <button
              key={id}
              onClick={() => router.push(`/track/${id}`)}
              className="btn btn-xs btn-ghost border border-base-300 font-mono text-primary hover:bg-primary/10"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-4xl mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Clock, title: 'Real-Time Updates', desc: 'Status refreshes instantly via live notifications' },
          { icon: MapPin, title: 'Location Tracking', desc: 'See where your parcel is on the map' },
          { icon: Truck, title: 'Delivery ETA', desc: 'Estimated arrival based on current route' },
        ].map((card) => (
          <div key={card.title} className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body items-center text-center gap-3 p-5">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <card.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-bold text-sm">{card.title}</h3>
              <p className="text-xs text-base-content/50">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pb-8 text-sm text-base-content/40">
        <p>Don&apos;t have a tracking ID? <Link href="/login" className="text-primary hover:underline">Log into your dashboard</Link></p>
      </div>
    </div>
  );
}
