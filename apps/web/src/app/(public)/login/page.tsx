'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Phone } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient<{ accessToken: string; refreshToken: string; role: string; message: string }>('auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });

      // Save tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Determine dashboard route based on role
      // Note: we can decode JWT to get role, but let's parse from token manually or assume backend sends it.
      // Wait, the backend currently sends 'message', 'accessToken', 'refreshToken'. It doesn't send role directly in the body!
      // We need to decode the token payload.
      const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
      const role = payload.role;
      localStorage.setItem('userRole', role);

      // Redirect to appropriate dashboard
      if (role === 'SUPER_ADMIN') router.push('/admin/dashboard');
      else if (role === 'MERCHANT') router.push('/merchant/dashboard');
      else if (role === 'HUB_MANAGER') router.push('/hub/dashboard');
      else if (role === 'RIDER') router.push('/rider/dashboard');
      else router.push('/');

    } catch (err: any) {
      console.error('Login error', err);
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center mb-6 text-primary">Login to ParcelPilot</h2>
          
          {error && (
            <div className="alert alert-error text-sm mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
              />
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary w-full shadow-md"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="divider text-sm text-base-content/60">OR</div>

          <div className="text-center">
            <p className="text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="link link-primary font-bold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
