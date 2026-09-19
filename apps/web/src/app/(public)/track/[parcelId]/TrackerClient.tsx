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

const STANDARD_STATUSES = [
  'PENDING', 
  'PICKED_UP', 
  'IN_TRANSIT', 
  'AT_HUB', 
  'OUT_FOR_DELIVERY', 
  'DELIVERED'
];

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
      <div className="w-full md:w-1/3 bg-base-100 p-6 rounded-xl shadow border border-base-200">
        <h2 className="text-xl font-bold mb-6 text-base-content">Tracking Status</h2>
        
        <ul className="steps steps-vertical w-full mt-4">
          {STANDARD_STATUSES.map((stepStatus) => {
            // Find if this status exists in history
            const historyItem = history.find(h => h.status === stepStatus);
            // Check if this step is completed or current
            const isCompleted = historyItem || status === stepStatus || 
              STANDARD_STATUSES.indexOf(stepStatus) < STANDARD_STATUSES.indexOf(status);
            
            return (
              <li 
                key={stepStatus} 
                className={`step ${isCompleted ? 'step-primary' : ''}`}
                data-content={historyItem ? "✓" : ""}
              >
                <div className="flex flex-col text-left w-full ml-2 pb-6">
                  <span className={`font-bold ${isCompleted ? 'text-base-content' : 'text-base-content/40'}`}>
                    {stepStatus.replace(/_/g, ' ')}
                  </span>
                  {historyItem && (
                    <span className="text-xs text-base-content/60 mt-1">
                      {format(new Date(historyItem.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Map */}
      <div className="w-full md:w-2/3 bg-base-100 p-6 rounded-xl shadow border border-base-200 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-base-content">Live Location</h2>
        
        <div className="flex-grow min-h-[400px] rounded-lg overflow-hidden border border-base-200 bg-base-200 flex items-center justify-center">
          {!location ? (
            <div className="text-center p-8">
              <svg className="w-12 h-12 text-base-content/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-base-content/60 font-medium">Location not available yet</p>
              <p className="text-sm text-base-content/40 mt-1">The rider&apos;s location will appear here when they are on the move.</p>
            </div>
          ) : !isLoaded ? (
            <div className="text-base-content/60">Loading Map...</div>
          ) : loadError ? (
            <div className="text-error">Error loading map</div>
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
                  url: 'https://maps.google.com/mapfiles/ms/icons/delivery.png',
                }}
              />
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}
