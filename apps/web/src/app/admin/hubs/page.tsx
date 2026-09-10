'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, MapPin } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { format } from 'date-fns';

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
          <p className="text-base-content/70 mt-1">Manage regional sorting hubs and branches.</p>
        </div>
        
        <button className="btn btn-primary shadow-sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add New Hub
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : error ? (
        <div className="alert alert-error"><span>{error}</span></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map((hub) => (
            <div key={hub.id} className="card bg-base-100 shadow border border-base-200">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center justify-between">
                  {hub.name}
                  <span className="badge badge-primary badge-outline text-xs">Active</span>
                </h2>
                
                <div className="mt-4 space-y-2 text-sm text-base-content/80">
                  <div className="flex gap-2 items-start">
                    <MapPin size={16} className="text-base-content/50 mt-0.5 shrink-0" />
                    <span>
                      {hub.addressLine}, {hub.upazilaOrThana}<br/>
                      {hub.district}, {hub.division}
                    </span>
                  </div>
                </div>
                
                <div className="divider my-2"></div>
                
                <div className="flex justify-between items-center text-xs text-base-content/50">
                  <span>ID: <span className="font-mono text-base-content/70">{hub.id.split('-')[0]}</span></span>
                  <span>Created: {format(new Date(hub.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
          
          {hubs.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-base-300 rounded-xl">
              <Building2 size={48} className="mx-auto text-base-content/30 mb-4" />
              <h3 className="text-lg font-bold">No Hubs Found</h3>
              <p className="text-base-content/60">Create your first sorting hub to get started.</p>
              <button className="btn btn-outline btn-sm mt-4" onClick={() => setIsModalOpen(true)}>Add Hub</button>
            </div>
          )}
        </div>
      )}

      {/* Create Hub Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg border-b border-base-200 pb-3 mb-4">Create New Hub</h3>
            
            <form onSubmit={handleCreateHub} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Hub Name</span></label>
                <input type="text" className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Uttara Main Hub" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Division</span></label>
                  <select className="select select-bordered" value={division} onChange={e => setDivision(e.target.value)}>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">District</span></label>
                  <input type="text" className="input input-bordered" value={district} onChange={e => setDistrict(e.target.value)} required />
                </div>
              </div>
              
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Upazila / Thana</span></label>
                <input type="text" className="input input-bordered w-full" value={upazilaOrThana} onChange={e => setUpazilaOrThana(e.target.value)} required />
              </div>
              
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Detailed Address</span></label>
                <input type="text" className="input input-bordered w-full" value={addressLine} onChange={e => setAddressLine(e.target.value)} required />
              </div>
              
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <span className="loading loading-spinner"></span> : 'Create Hub'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}
    </div>
  );
}
