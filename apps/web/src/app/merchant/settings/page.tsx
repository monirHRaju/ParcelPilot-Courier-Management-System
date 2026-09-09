'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { Save, User, Building, MapPin, CreditCard } from 'lucide-react';

interface MerchantProfile {
  businessName: string;
  contactPersonName: string;
  businessAddress: string;
  payoutMethod: string;
  user?: {
    phone: string;
    email: string | null;
  };
}

export default function MerchantSettingsPage() {
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await apiClient<{ merchant: MerchantProfile }>('merchants/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.merchant);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    
    const token = localStorage.getItem('accessToken');
    try {
      await apiClient('merchants/me', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          businessName: profile.businessName,
          contactPersonName: profile.contactPersonName,
          businessAddress: profile.businessAddress,
          payoutMethod: profile.payoutMethod
        })
      });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Merchant Settings</h1>
      
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4 border-b border-base-200 pb-2">Business Profile</h2>
          
          {error && (
            <div className="alert alert-error text-sm mb-4">
              <span>{error}</span>
            </div>
          )}
          
          {successMsg && (
            <div className="alert alert-success text-sm mb-4">
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Building size={16} /> Business Name
                </span>
              </label>
              <input 
                type="text" 
                name="businessName"
                value={profile?.businessName || ''}
                onChange={handleChange}
                className="input input-bordered w-full" 
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <User size={16} /> Contact Person
                </span>
              </label>
              <input 
                type="text" 
                name="contactPersonName"
                value={profile?.contactPersonName || ''}
                onChange={handleChange}
                className="input input-bordered w-full" 
                required
              />
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <MapPin size={16} /> Business Address
                </span>
              </label>
              <textarea 
                name="businessAddress"
                value={profile?.businessAddress || ''}
                onChange={handleChange}
                className="textarea textarea-bordered h-24 w-full" 
                required
              ></textarea>
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <CreditCard size={16} /> Payout Method
                </span>
              </label>
              <input 
                type="text" 
                name="payoutMethod"
                value={profile?.payoutMethod || ''}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="e.g. bKash: 017XXXXXXX, Bank: IBBL A/C 12345"
              />
              <label className="label">
                <span className="label-text-alt opacity-70">
                  Where should we send your COD collections?
                </span>
              </label>
            </div>

            <div className="card-actions justify-end mt-6">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
