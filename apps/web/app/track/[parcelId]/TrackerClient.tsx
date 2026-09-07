'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { format } from 'date-fns';

type StatusHistory = {
  status: string;
  createdAt: string;
};

type RiderLocation = {
  latitude: number;
  longitude: number;
} | null;

interface TrackerClientProps {
  parcelId: string;
  initialStatus: string;
  initialHistory: StatusHistory[];
  initialLocation: RiderLocation;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

// Ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is available in apps/web/.env.local or similar
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function TrackerClient({
  parcelId,
  initialStatus,
  initialHistory,
  initialLocation,
}: TrackerClientProps) {
  const [status, setStatus] = useState(initialStatus);
  const [history, setHistory] = useState<StatusHistory[]>(initialHistory);
  const [location, setLocation] = useState<RiderLocation>(initialLocation);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
  });

  useEffect(() => {
    // API URL usually comes from env
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const socket = io(`${socketUrl}/tracking`);

    socket.on('connect', () => {
      socket.emit('join_room', `parcel:${parcelId}`);
    });

    socket.on('location:update', (data: { latitude: number; longitude: number }) => {
      setLocation({ latitude: data.latitude, longitude: data.longitude });
    });

    socket.on('status:update', (data: { status: string; timestamp: string }) => {
      setStatus(data.status);
      setHistory((prev) => [...prev, { status: data.status, createdAt: data.timestamp }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [parcelId]);

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 max-w-6xl mx-auto">
      {/* Status Timeline */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Tracking Status</h2>
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 font-semibold rounded-full text-sm">
            {status.replace(/_/g, ' ')}
          </span>
        </div>
        
        <div className="space-y-6 mt-8 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
          {history.map((item, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-gray-50 p-4 rounded border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-sm">{item.status.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="w-full md:w-2/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Live Location</h2>
        
        <div className="flex-grow min-h-[400px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
          {!location ? (
            <div className="text-center p-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-500 font-medium">Location not available yet</p>
              <p className="text-sm text-gray-400 mt-1">The rider's location will appear here when they are on the move.</p>
            </div>
          ) : !isLoaded ? (
            <div className="text-gray-500">Loading Map...</div>
          ) : loadError ? (
            <div className="text-red-500">Error loading map</div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={{ lat: location.latitude, lng: location.longitude }}
              zoom={15}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
              }}
            >
              <Marker
                position={{ lat: location.latitude, lng: location.longitude }}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/delivery.png', // Or some other icon
                }}
              />
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}
