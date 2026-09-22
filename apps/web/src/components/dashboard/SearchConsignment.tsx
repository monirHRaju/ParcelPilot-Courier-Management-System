'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Mock suggestion type
type Suggestion = {
  id: string;
  trackingId: string;
  name: string;
  phone: string;
  cod: number;
};

// Mock data for search
const MOCK_DATA: Suggestion[] = [
  { id: '1', trackingId: 'SFR260918ST', name: 'Arfan Hossain', phone: '01711891930', cod: 1500 },
  { id: '2', trackingId: 'SFR260919AB', name: 'Rakib Hasan', phone: '01898392384', cod: 0 },
  { id: '3', trackingId: 'SFR260920XY', name: 'John Doe', phone: '01671234567', cod: 250 },
];

export function SearchConsignment() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Handle click outside to close dropdown
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) {
      // Filter mock data (In real app, this would be an API call)
      const filtered = MOCK_DATA.filter(item => 
        item.trackingId.toLowerCase().includes(query.toLowerCase()) || 
        item.phone.includes(query)
      );
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (trackingId: string) => {
    setQuery('');
    setIsOpen(false);
    // Redirect to a specific tracking or details page
    // Using the public tracking route for now, but inside dashboard it might be a modal or details page.
    router.push(`/track/${trackingId}`);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
      <Input 
        type="text" 
        placeholder="Search Consignment by Tracking ID or Phone..." 
        className="w-full pl-9 rounded-full bg-muted/50 focus:bg-background border-transparent focus:border-primary"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
            {suggestions.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleSelect(item.trackingId)}
                className="flex items-center justify-between p-3 hover:bg-muted rounded-md cursor-pointer transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm flex items-center gap-1">
                    <Package size={14} className="text-primary" />
                    {item.trackingId}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {item.name} • {item.phone}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    COD: ৳{item.cod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.length > 1 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-4 text-center z-50">
          <p className="text-sm text-muted-foreground">No consignments found.</p>
        </div>
      )}
    </div>
  );
}
