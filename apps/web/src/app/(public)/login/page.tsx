'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Phone, Eye, EyeOff, Package, Truck, BarChart2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

const PERKS = [
  { icon: Package, text: 'Next-day COD payout to your account' },
  { icon: Truck, text: 'Nationwide delivery across all 64 districts' },
  { icon: BarChart2, text: 'Real-time analytics & tracking dashboard' },
];

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient<{ accessToken: string; refreshToken: string; role: string }>('auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
      const role = payload.role;
      const name = payload.phone || phone;
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', name);

      toast.success('Welcome back!');

      if (role === 'SUPER_ADMIN') router.push('/admin/dashboard');
      else if (role === 'MERCHANT') router.push('/merchant/dashboard');
      else if (role === 'HUB_MANAGER') router.push('/hub/dashboard');
      else if (role === 'RIDER') router.push('/rider/dashboard');
      else router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid phone number or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary-content/20 flex items-center justify-center">
            <span className="text-primary-content font-black">PP</span>
          </div>
          <span className="font-bold text-xl text-primary-content">ParcelPilot</span>
        </Link>

        <div>
          <h2 className="text-4xl font-black text-primary-content leading-tight mb-4">
            Grow your business<br />with faster deliveries
          </h2>
          <p className="text-primary-content/70 mb-10 text-lg">
            Trusted by 15,000+ merchants across Bangladesh.
          </p>
          <div className="space-y-5">
            {PERKS.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary-content/20 flex items-center justify-center shrink-0">
                  <p.icon size={18} className="text-primary-content" />
                </div>
                <span className="text-primary-content/80 font-medium">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-content/40 text-sm">© 2026 ParcelPilot. All rights reserved.</p>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-base-100">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-content font-black text-sm">PP</span>
            </div>
            <span className="font-bold text-lg">ParcelPilot</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-base-content">Welcome back</h1>
            <p className="text-base-content/60 mt-2">Sign in to your merchant account</p>
          </div>

          {error && (
            <div className="alert alert-error mb-6 text-sm rounded-xl">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-base-content mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="input input-bordered w-full pl-10 focus:input-primary"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-semibold text-base-content">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="input input-bordered w-full pl-10 pr-10 focus:input-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
