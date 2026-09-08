'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api-client';

export default function MerchantWalletPage() {
  const [walletData, setWalletData] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [merchantProfile, setMerchantProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [isEditingMethod, setIsEditingMethod] = useState(false);
  const [newPayoutMethod, setNewPayoutMethod] = useState('');
  
  // Ensure token is passed
  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      const [walletRes, profileRes, payoutsRes] = await Promise.all([
        apiClient<any>('/merchants/me/wallet', { headers }),
        apiClient<any>('/merchants/me', { headers }),
        apiClient<any>('/merchants/me/payouts', { headers })
      ]);
      
      setWalletData(walletRes.data);
      setMerchantProfile(profileRes.merchant);
      setPayouts(payoutsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePayoutMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient('/merchants/me/payout-method', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ payoutMethod: newPayoutMethod }),
      });
      setIsEditingMethod(false);
      setNewPayoutMethod('');
      fetchData();
    } catch (err: any) {
      alert(`Error updating method: ${err.message}`);
    }
  };

  const handleRequestPayout = async () => {
    if (!confirm('Are you sure you want to request a payout for your entire balance?')) return;
    
    try {
      await apiClient('/merchants/me/payout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      alert('Payout requested successfully!');
      fetchData();
    } catch (err: any) {
      alert(`Error requesting payout: ${err.data?.message || err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading wallet data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const currentBalanceBDT = walletData?.balancePaisa ? (walletData.balancePaisa / 100).toFixed(2) : '0.00';
  const payoutMethod = merchantProfile?.payoutMethod || 'Not Set';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Merchant Wallet & Payouts</h1>
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-sm text-gray-500 uppercase font-medium">Available Balance</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">৳{currentBalanceBDT}</p>
          </div>
          <button 
            onClick={handleRequestPayout}
            disabled={!walletData?.balancePaisa || walletData.balancePaisa <= 0}
            className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Payout
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between md:col-span-2">
          <div>
            <p className="text-sm text-gray-500 uppercase font-medium">Payout Method</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-2xl font-mono bg-gray-50 px-3 py-1 rounded text-gray-800">
                {payoutMethod}
              </span>
              <button 
                onClick={() => setIsEditingMethod(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
            {payoutMethod === 'Not Set' && (
              <p className="text-red-500 text-sm mt-2">Please set a payout method before requesting a payout.</p>
            )}
          </div>
          <div className="mt-6 text-sm text-gray-500">
            Payouts are processed daily to your specified account.
          </div>
        </div>
      </div>

      {/* Editing Method Modal */}
      {isEditingMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Update Payout Method</h3>
            <form onSubmit={handleUpdatePayoutMethod}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Method (bkash:, nagad:, bank:)</label>
                <input 
                  type="text" 
                  value={newPayoutMethod}
                  onChange={e => setNewPayoutMethod(e.target.value)}
                  placeholder="e.g. bkash:01712345678"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditingMethod(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {walletData?.transactions?.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No transactions yet</td></tr>
                ) : (
                  walletData?.transactions?.slice(0, 10).map((tx: any) => (
                    <tr key={tx.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {tx.type}
                        </span>
                        {tx.parcelId && <div className="text-xs text-gray-400 mt-1">Parcel: {tx.parcelId.slice(0, 8)}...</div>}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${tx.type.startsWith('CREDIT') ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type.startsWith('CREDIT') ? '+' : '-'}৳{(tx.amountPaisa / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-700">
                        ৳{(tx.runningBalance / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Payout History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No payouts yet</td></tr>
                ) : (
                  payouts.map((p: any) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(p.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-700">
                        {p.payoutMethod}
                        {p.reference && <div className="text-xs text-gray-400 mt-1">Ref: {p.reference}</div>}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ৳{(p.amountPaisa / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          p.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
