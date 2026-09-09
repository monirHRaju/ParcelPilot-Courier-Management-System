'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../../lib/api-client';

interface Notification {
  id: string;
  type: string;
  message: string;
  parcelId: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UnreadCountResponse {
  success: boolean;
  data: { count: number };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function typeIcon(type: string): string {
  if (type === 'PARCEL_STATUS_CHANGE') return '📦';
  if (type === 'COD_DISPUTE') return '⚠️';
  return '🔔';
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const fetchNotifications = useCallback(async (pageNum: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiClient<NotificationsResponse['data']>(
        `notifications/mine?page=${pageNum}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (pageNum === 1) {
        setNotifications(data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications]);
      }
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiClient<UnreadCountResponse['data']>(
        'notifications/mine/unread-count',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(data.count);
    } catch {
      // non-fatal
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications(1);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const markSingleRead = async (id: string) => {
    if (!token) return;
    try {
      await apiClient(`notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // non-fatal
    }
  };

  const markAllRead = async () => {
    if (!token || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await apiClient<{ updated: number }>('notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-warning max-w-md">
          <span>Please log in to view your notifications.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="badge badge-primary badge-lg font-bold">{unreadCount}</span>
          )}
          <span className="text-base-content/50 text-sm">({total} total)</span>
        </div>
        <button
          className="btn btn-sm btn-outline"
          onClick={markAllRead}
          disabled={unreadCount === 0 || markingAll}
        >
          {markingAll ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            '✓ Mark all read'
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Notification list */}
      <div className="flex flex-col gap-2">
        {loading && notifications.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-full rounded-xl" />
          ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-base-content/40">
            <div className="text-5xl mb-3">🔕</div>
            <p className="font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`card bg-base-100 border transition-colors cursor-pointer hover:border-primary/40 ${
                n.isRead ? 'border-base-200 opacity-70' : 'border-primary/20 bg-primary/5'
              }`}
              onClick={() => {
                if (!n.isRead) markSingleRead(n.id);
                if (n.parcelId) window.location.href = `/track/${n.parcelId}`;
              }}
            >
              <div className="card-body p-4 flex-row items-start gap-3">
                {/* Unread indicator */}
                <div className="flex-none pt-1">
                  {!n.isRead ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary block mt-0.5" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-transparent block" />
                  )}
                </div>
                {/* Icon */}
                <span className="text-xl flex-none">{typeIcon(n.type)}</span>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? 'font-normal' : 'font-medium'}`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-base-content/40">{timeAgo(n.createdAt)}</span>
                    {n.parcelId && (
                      <span className="badge badge-ghost badge-xs">Track parcel →</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load more */}
      {page < totalPages && (
        <div className="mt-6 text-center">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => fetchNotifications(page + 1)}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-xs" /> : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
