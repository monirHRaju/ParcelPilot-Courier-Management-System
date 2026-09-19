import { notFound } from 'next/navigation';
import TrackerClient from './TrackerClient';

// Ensure NEXT_PUBLIC_API_URL is available
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getParcelSnapshot(parcelId: string) {
  try {
    const res = await fetch(`${API_URL}/public/parcels/${parcelId}/track`, {
      // Fast first paint: we can cache if needed, but for tracking usually no-store or short revalidate is better
      cache: 'no-store',
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch tracking data');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching parcel:', error);
    return null;
  }
}

export default async function TrackParcelPage({ params }: { params: Promise<{ parcelId: string }> }) {
  const { parcelId } = await params;
  
  const snapshot = await getParcelSnapshot(parcelId);
  
  if (!snapshot) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Parcel Tracker</h1>
        <p className="text-gray-500 mt-2">Tracking ID: <span className="font-mono text-gray-700">{snapshot.id}</span></p>
      </div>
      
      <TrackerClient 
        parcelId={snapshot.id}
        initialStatus={snapshot.status}
        initialHistory={snapshot.statusHistory}
        initialLocation={snapshot.riderLocation}
      />
    </div>
  );
}
