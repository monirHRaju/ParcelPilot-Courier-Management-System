'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/api-client';
import { io, Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // 1. Fetch initial unread count
    apiClient<{ data: { count: number } }>('notifications/mine/unread-count', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUnreadCount(res.data.count))
      .catch(console.error);

    // 2. Connect socket to listen for real-time notifications
    const socket: Socket = io(API_BASE, {
      auth: { token }
    });

    socket.on('notification:new', () => {
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Don't render anything on the server to avoid hydration mismatch with localStorage
  if (!mounted) return null;
  
  // If no token, user isn't logged in, don't show the bell
  if (!localStorage.getItem('accessToken')) return null;

  return (
    <Link href="/notifications" className="btn btn-ghost btn-circle relative group">
      <div className="indicator">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="badge badge-sm indicator-item badge-primary group-hover:scale-110 transition-transform">
            {unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
}
