'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Phone, Eye, EyeOff, Building2, Bike, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  {
    value: 'MERCHANT',
    icon: Building2,
    label: 'Merchant',
    desc: 'Ship parcels & receive COD',
  },
  {
    value: 'RIDER',
    icon: Bike,
    label: 'Delivery Rider',
    desc: 'Deliver parcels & earn money',
  },
];

export default function RegisterPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('MERCHANT');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await apiClient('auth/register', {
        method: 'POST',
        body: JSON.stringify({ phone, password, role }),
      });

      const loginResponse = await apiClient<{ accessToken: string; refreshToken: string }>('auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });

      localStorage.setItem('accessToken', loginResponse.accessToken);
      localStorage.setItem('refreshToken', loginResponse.refreshToken);

      const payload = JSON.parse(atob(loginResponse.accessToken.split('.')[1]));
      const userRole = payload.role;
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userName', phone);

      toast.success('Account created successfully!');

      if (userRole === 'MERCHANT') router.push('/merchant/dashboard');
      else if (userRole === 'RIDER') router.push('/rider/dashboard');
      else router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary-content/20 flex items-center justify-center">
            <span className="text-primary-content font-black">PP</span>
          </div>
          <span className="font-bold text-xl text-primary-content">ParcelPilot</span>
        </Link>

        <div>
          <h2 className="text-4xl font-black text-primary-content leading-tight mb-4">
            Join 15,000+<br />merchants today
          </h2>
          <p className="text-primary-content/70 text-lg mb-10">
            Start shipping in under 15 minutes. No paperwork, no setup fees.
          </p>
          <div className="space-y-4">
            {['Free to create, no credit card needed', 'Next-day COD payout guarantee', '24/7 dedicated merchant support', 'Coverage in all 64 districts'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-primary-content shrink-0" />
                <span className="text-primary-content/80 font-medium text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-content/40 text-sm">© 2026 ParcelPilot. All rights reserved.</p>
      </div>

      {/* Right: Register Form */}
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
            <h1 className="text-3xl font-black text-base-content">Create your account</h1>
            <p className="text-base-content/60 mt-2">Start shipping in minutes — it&apos;s free</p>
          </div>

          {error && (
            <div className="alert alert-error mb-6 text-sm rounded-xl">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Role selection */}
            <div>
              <label className="block text-sm font-semibold text-base-content mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                      role === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-base-300 hover:border-base-content/30 text-base-content/60'
                    }`}
                  >
                    <opt.icon size={24} />
                    <div>
                      <div className="font-bold text-sm">{opt.label}</div>
                      <div className="text-xs opacity-70">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-base-content mb-1.5">Phone Number</label>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-base-content mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="input input-bordered w-full pl-10 pr-10 focus:input-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-base-content mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className="input input-bordered w-full pl-10 focus:input-primary"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Create Free Account'}
            </button>

            <p className="text-xs text-center text-base-content/40">
              By signing up you agree to our{' '}
              <a href="#" className="underline hover:text-primary">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
            </p>
          </form>

          <p className="text-center text-sm text-base-content/60 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
