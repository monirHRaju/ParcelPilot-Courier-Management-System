'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, MapPin, Search } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Bangladesh Divisions & Districts data
const bdData: Record<string, string[]> = {
  'Dhaka': ['Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'],
  'Chattogram': ['Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla', 'Cox\'s Bazar', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati'],
  'Rajshahi': ['Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Chapainawabganj', 'Pabna', 'Rajshahi', 'Sirajganj'],
  'Khulna': ['Bagerhat', 'Chuadanga', 'Jashore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'],
  'Barishal': ['Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  'Sylhet': ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
  'Rangpur': ['Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon'],
  'Mymensingh': ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur']
};

export default function AdminHubsPage() {
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [upazilaOrThana, setUpazilaOrThana] = useState('');
  const [addressLine, setAddressLine] = useState('');

  const router = useRouter();

  const fetchHubs = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await apiClient<{ hubs: any[] }>('hubs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHubs(response.hubs);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load hubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  // Update district when division changes
  useEffect(() => {
    const districtsForDiv = bdData[division] || [];
    if (districtsForDiv.length > 0) {
      setDistrict(districtsForDiv[0]);
    }
  }, [division]);

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      await apiClient('hubs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          division,
          district,
          upazilaOrThana,
          addressLine
        })
      });
      
      setIsModalOpen(false);
      // Reset form
      setName(''); setUpazilaOrThana(''); setAddressLine('');
      setDivision('Dhaka');
      setDistrict('Dhaka');
      // Refresh list
      fetchHubs();
    } catch (err: any) {
      console.error('Failed to create hub', err);
      alert(err.message || 'Failed to create hub');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-base-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-primary" size={32} />
            Hub Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage regional sorting hubs and branches.</p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" /> Add New Hub
        </Button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : error ? (
        <div className="alert alert-error"><span>{error}</span></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map((hub) => (
            <div key={hub.id} className="card bg-card shadow-sm border border-border">
              <div className="card-body p-6">
                <h2 className="card-title text-lg flex items-center justify-between font-bold">
                  {hub.name}
                  <Badge variant="default" className="text-xs">Active</Badge>
                </h2>
                
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex gap-2 items-start">
                    <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>
                      {hub.addressLine}, {hub.upazilaOrThana}<br/>
                      {hub.district}, {hub.division}
                    </span>
                  </div>
                </div>
                
                <div className="divider my-2"></div>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>ID: <span className="font-mono font-medium">{hub.id.split('-')[0]}</span></span>
                  <span>Created: {format(new Date(hub.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
          
          {hubs.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-xl">
              <Building2 size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold">No Hubs Found</h3>
              <p className="text-muted-foreground mt-2">Create your first sorting hub to get started.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsModalOpen(true)}>Add Hub</Button>
            </div>
          )}
        </div>
      )}

      {/* Create Hub Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-border">
            <div className="p-6">
              <h3 className="font-bold text-xl border-b border-border pb-3 mb-6">Create New Hub</h3>
              
              <form onSubmit={handleCreateHub} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Hub Name</label>
                  <Input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Uttara Main Hub" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Division</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={division} 
                      onChange={e => setDivision(e.target.value)}
                    >
                      {Object.keys(bdData).map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">District</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={district} 
                      onChange={e => setDistrict(e.target.value)}
                    >
                      {(bdData[division] || []).map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Upazila / Thana</label>
                  <Input type="text" value={upazilaOrThana} onChange={e => setUpazilaOrThana(e.target.value)} required placeholder="e.g. Uttara" />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Detailed Address</label>
                  <Input type="text" value={addressLine} onChange={e => setAddressLine(e.target.value)} required placeholder="e.g. House 12, Road 5, Sector 10" />
                </div>
                
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Hub'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
