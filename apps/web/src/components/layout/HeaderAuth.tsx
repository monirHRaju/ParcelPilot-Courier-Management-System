'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function HeaderAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Function to check auth state
  const checkAuth = () => {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    setIsLoggedIn(!!token);
    setRole(userRole);
  };

  useEffect(() => {
    checkAuth();
    
    // Set up an interval or listen to storage events if needed, 
    // but a simple window event listener for a custom event is best 
    // for same-tab updates
    window.addEventListener('storage', checkAuth);
    
    // Polling as a fallback for same-tab changes without custom events
    const interval = setInterval(checkAuth, 2000);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setRole(null);
    router.push('/login');
  };

  if (!isLoggedIn) {
    return (
      <>
        <Link href="/login" className="btn btn-sm btn-ghost">Login</Link>
        <Link href="/register" className="btn btn-sm btn-primary">Register</Link>
      </>
    );
  }

  // Generate dashboard link based on role
  let dashboardLink = '/';
  if (role === 'SUPER_ADMIN') dashboardLink = '/admin/dashboard';
  else if (role === 'MERCHANT') dashboardLink = '/merchant/dashboard';
  else if (role === 'HUB_MANAGER') dashboardLink = '/hub/dashboard';
  else if (role === 'RIDER') dashboardLink = '/rider/dashboard';

  return (
    <div className="flex items-center gap-2">
      <Link href={dashboardLink} className="btn btn-sm btn-ghost">Dashboard</Link>
      <button onClick={handleLogout} className="btn btn-sm btn-outline btn-error gap-2">
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
}
