'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Phone, UserCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function RegisterPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MERCHANT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Register the user
      await apiClient('auth/register', {
        method: 'POST',
        body: JSON.stringify({ phone, password, role }),
      });

      // Auto-login after successful registration
      const loginResponse = await apiClient<{ accessToken: string; refreshToken: string }>('auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });

      // Save tokens
      localStorage.setItem('accessToken', loginResponse.accessToken);
      localStorage.setItem('refreshToken', loginResponse.refreshToken);
      
      const payload = JSON.parse(atob(loginResponse.accessToken.split('.')[1]));
      const userRole = payload.role;
      localStorage.setItem('userRole', userRole);

      // Redirect to appropriate dashboard
      if (userRole === 'MERCHANT') router.push('/merchant/dashboard');
      else if (userRole === 'RIDER') router.push('/rider/dashboard');
      else router.push('/');

    } catch (err: any) {
      console.error('Registration error', err);
      setError(err.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center mb-2 text-primary">Join ParcelPilot</h2>
          <p className="text-center text-base-content/60 text-sm mb-6">Create an account to start shipping</p>
          
          {error && (
            <div className="alert alert-error text-sm mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2 font-medium">
                  <UserCircle size={16} /> Account Type
                </span>
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 cursor-pointer border rounded-lg p-3 text-center transition-colors ${
                  role === 'MERCHANT' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-base-300'
                }`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="MERCHANT"
                    checked={role === 'MERCHANT'}
                    onChange={() => setRole('MERCHANT')}
                    className="hidden"
                  />
                  <span>Merchant</span>
                </label>
                <label className={`flex-1 cursor-pointer border rounded-lg p-3 text-center transition-colors ${
                  role === 'RIDER' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-base-300'
                }`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="RIDER"
                    checked={role === 'RIDER'}
                    onChange={() => setRole('RIDER')}
                    className="hidden"
                  />
                  <span>Rider</span>
                </label>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2 font-medium">
                  <Phone size={16} /> Phone Number
                </span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. 01700000000" 
                className="input input-bordered w-full" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2 font-medium">
                  <Lock size={16} /> Password
                </span>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input input-bordered w-full" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary w-full shadow-md"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="divider text-sm text-base-content/60">OR</div>

          <div className="text-center">
            <p className="text-sm">
              Already have an account?{' '}
              <Link href="/login" className="link link-primary font-bold">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
