'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';

export default function AdminPayoutsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchPayouts = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await apiClient<{ success: boolean; data: any[] }>('admin/payouts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load payout requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [router]);

  const handleProcess = async (id: string, action: 'mark-processing' | 'mark-completed') => {
    try {
      const status = action === 'mark-processing' ? 'PROCESSING' : 'COMPLETED';
      const reference = action === 'mark-completed' ? prompt('Enter bank transaction reference (optional):') || undefined : undefined;
      
      const token = localStorage.getItem('accessToken');
      await apiClient(`admin/payouts/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, referenceId: reference })
      });
      
      fetchPayouts();
    } catch (err: any) {
      console.error('Failed to update payout', err);
      alert(err.message || 'Failed to update payout request');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-base-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="text-primary" size={32} />
            Payout Requests
          </h1>
          <p className="text-base-content/70 mt-1">Manage merchant withdrawal requests.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : error ? (
        <div className="alert alert-error"><span>{error}</span></div>
      ) : (
        <div className="card bg-base-100 shadow border border-base-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200/50">
                <tr>
                  <th>Request Details</th>
                  <th>Merchant</th>
                  <th>Bank Details</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-base-content/50">
                      No payout requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover">
                      <td>
                        <div className="text-sm font-mono">{req.id.split('-')[0]}</div>
                        <div className="text-xs text-base-content/60">{format(new Date(req.createdAt), 'MMM d, yyyy HH:mm')}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{req.merchant?.businessName || 'Unknown'}</div>
                        <div className="text-xs text-base-content/60">{req.merchant?.user?.phone}</div>
                      </td>
                      <td>
                        <div className="text-sm">{req.bankDetails?.bankName}</div>
                        <div className="text-xs text-base-content/60">
                          {req.bankDetails?.accountName} • {req.bankDetails?.accountNumber}
                        </div>
                      </td>
                      <td>
                        <div className="font-bold text-lg">৳{(req.amountPaisa / 100).toFixed(2)}</div>
                      </td>
                      <td>
                        <div className={`badge badge-sm font-bold ${
                          req.status === 'COMPLETED' ? 'badge-success' :
                          req.status === 'PROCESSING' ? 'badge-info' :
                          req.status === 'FAILED' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {req.status}
                        </div>
                      </td>
                      <td>
                        {req.status === 'PENDING' && (
                          <button 
                            className="btn btn-info btn-sm text-info-content" 
                            onClick={() => handleProcess(req.id, 'mark-processing')}
                          >
                            Process
                          </button>
                        )}
                        {req.status === 'PROCESSING' && (
                          <button 
                            className="btn btn-success btn-sm text-success-content" 
                            onClick={() => handleProcess(req.id, 'mark-completed')}
                          >
                            Mark Paid
                          </button>
                        )}
                        {req.status === 'COMPLETED' && (
                          <span className="text-success flex items-center gap-1 text-sm font-bold">
                            <CheckCircle size={14} /> Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
