'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackagePlus, Truck, DollarSign, MapPin, User, Calculator } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

export default function CreateParcelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pricing estimate result
  const [estimate, setEstimate] = useState<{ baseFee: number; codHandlingFee: number; totalFee: number } | null>(null);

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [codAmount, setCodAmount] = useState<number>(0);
  const [sizeTier, setSizeTier] = useState('SMALL');
  const [serviceType, setServiceType] = useState('STANDARD');

  // Address states
  const [deliveryDistrict, setDeliveryDistrict] = useState('Dhaka');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [deliveryAddressLine, setDeliveryAddressLine] = useState('');
  
  const [pickupDistrict, setPickupDistrict] = useState('Dhaka');
  const [pickupArea, setPickupArea] = useState('');
  const [pickupAddressLine, setPickupAddressLine] = useState('');

  const handleCalculate = async () => {
    setCalculating(true);
    setEstimate(null);
    try {
      const payload = {
        pickupAddress: {
          division: 'Dhaka',
          district: pickupDistrict,
          upazilaOrThana: pickupArea || 'N/A',
          area: pickupArea || 'N/A',
          addressLine: pickupAddressLine || 'N/A'
        },
        deliveryAddress: {
          division: 'N/A',
          district: deliveryDistrict,
          upazilaOrThana: deliveryArea || 'N/A',
          area: deliveryArea || 'N/A',
          addressLine: deliveryAddressLine || 'N/A'
        },
        sizeTier,
        serviceType,
        codAmount: Math.round(codAmount * 100),
        weightGrams: sizeTier === 'SMALL' ? 1000 : 3000
      };

      const response = await apiClient<{ pricing: any }>('pricing/estimate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setEstimate(response.pricing);
    } catch (err: any) {
      console.error(err);
      // Don't show blocking error for estimate
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Not authenticated');

      const payload = {
        recipientName,
        recipientPhone,
        pickupAddress: {
          division: 'Dhaka',
          district: pickupDistrict,
          upazilaOrThana: pickupArea,
          area: pickupArea,
          addressLine: pickupAddressLine
        },
        deliveryAddress: {
          division: 'Dhaka',
          district: deliveryDistrict,
          upazilaOrThana: deliveryArea,
          area: deliveryArea,
          addressLine: deliveryAddressLine
        },
        sizeTier,
        serviceType,
        codAmount: Math.round(codAmount * 100),
        weightGrams: sizeTier === 'SMALL' ? 1000 : sizeTier === 'MEDIUM' ? 3000 : 5000
      };

      await apiClient('parcels', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      router.push('/merchant/parcels');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create parcel');
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end border-b border-base-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PackagePlus className="text-primary" size={32} />
            Create New Parcel
          </h1>
          <p className="text-base-content/70 mt-2">Fill out the details to generate a new delivery order.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error shadow-sm">
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <form id="create-parcel-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Details */}
            <div className="card bg-base-100 shadow border border-base-200">
              <div className="card-body">
                <h2 className="card-title text-lg border-b border-base-200 pb-2 mb-4">
                  <User size={18} /> Recipient Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text">Name</span></label>
                    <input type="text" className="input input-bordered w-full" value={recipientName} onChange={e => setRecipientName(e.target.value)} required />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">Phone Number</span></label>
                    <input type="text" className="input input-bordered w-full" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="card bg-base-100 shadow border border-base-200">
              <div className="card-body">
                <h2 className="card-title text-lg border-b border-base-200 pb-2 mb-4">
                  <MapPin size={18} /> Delivery Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text">District</span></label>
                    <select className="select select-bordered" value={deliveryDistrict} onChange={e => { setDeliveryDistrict(e.target.value); handleCalculate(); }}>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Gazipur">Gazipur</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Sylhet">Sylhet</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">Area / Thana</span></label>
                    <input type="text" className="input input-bordered w-full" value={deliveryArea} onChange={e => setDeliveryArea(e.target.value)} required />
                  </div>
                  <div className="form-control md:col-span-2">
                    <label className="label"><span className="label-text">Detailed Address</span></label>
                    <input type="text" className="input input-bordered w-full" value={deliveryAddressLine} onChange={e => setDeliveryAddressLine(e.target.value)} placeholder="House, Road, Block, etc." required />
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Address */}
            <div className="card bg-base-100 shadow border border-base-200">
              <div className="card-body">
                <h2 className="card-title text-lg border-b border-base-200 pb-2 mb-4">
                  <Truck size={18} /> Pickup Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text">District</span></label>
                    <select className="select select-bordered" value={pickupDistrict} onChange={e => { setPickupDistrict(e.target.value); handleCalculate(); }}>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Gazipur">Gazipur</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">Area / Thana</span></label>
                    <input type="text" className="input input-bordered w-full" value={pickupArea} onChange={e => setPickupArea(e.target.value)} required />
                  </div>
                  <div className="form-control md:col-span-2">
                    <label className="label"><span className="label-text">Detailed Address</span></label>
                    <input type="text" className="input input-bordered w-full" value={pickupAddressLine} onChange={e => setPickupAddressLine(e.target.value)} placeholder="Where should the rider pick this up?" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="card bg-base-100 shadow border border-base-200">
              <div className="card-body">
                <h2 className="card-title text-lg border-b border-base-200 pb-2 mb-4">
                  <DollarSign size={18} /> Package Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Cash on Delivery Amount (৳)</span></label>
                    <input 
                      type="number" 
                      min="0"
                      className="input input-bordered w-full text-lg" 
                      value={codAmount || ''} 
                      onChange={e => { setCodAmount(Number(e.target.value)); handleCalculate(); }} 
                      placeholder="e.g. 1500" 
                      required 
                    />
                  </div>

                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Size Tier</span></label>
                    <select className="select select-bordered" value={sizeTier} onChange={e => { setSizeTier(e.target.value); handleCalculate(); }}>
                      <option value="SMALL">Small (up to 1kg)</option>
                      <option value="MEDIUM">Medium (up to 3kg)</option>
                      <option value="LARGE">Large (up to 5kg)</option>
                    </select>
                  </div>

                  <div className="form-control md:col-span-2">
                    <label className="label"><span className="label-text font-medium">Service Type</span></label>
                    <div className="flex gap-4">
                      <label className={`flex-1 cursor-pointer border rounded-lg p-4 text-center transition-all ${
                        serviceType === 'STANDARD' ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-base-300'
                      }`}>
                        <input type="radio" name="service" className="hidden" checked={serviceType === 'STANDARD'} onChange={() => { setServiceType('STANDARD'); handleCalculate(); }} />
                        <span className="block font-bold">Standard Delivery</span>
                        <span className="block text-xs text-base-content/60 mt-1">2-3 days</span>
                      </label>
                      <label className={`flex-1 cursor-pointer border rounded-lg p-4 text-center transition-all ${
                        serviceType === 'EXPRESS' ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-base-300'
                      }`}>
                        <input type="radio" name="service" className="hidden" checked={serviceType === 'EXPRESS'} onChange={() => { setServiceType('EXPRESS'); handleCalculate(); }} />
                        <span className="block font-bold">Express Delivery</span>
                        <span className="block text-xs text-base-content/60 mt-1">Next day</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="card bg-base-100 shadow border border-base-200 sticky top-6">
            <div className="card-body">
              <h2 className="card-title text-lg border-b border-base-200 pb-2 mb-2 flex justify-between">
                <span>Summary</span>
                <button type="button" onClick={handleCalculate} className="btn btn-ghost btn-xs text-primary">
                  <Calculator size={14} /> Estimate
                </button>
              </h2>
              
              {calculating ? (
                <div className="py-8 flex justify-center"><span className="loading loading-spinner text-primary"></span></div>
              ) : estimate ? (
                <div className="space-y-4 my-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/70">Base Charge</span>
                    <span className="font-semibold">৳{(estimate.baseFee / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/70">COD Handling (1%)</span>
                    <span className="font-semibold">৳{(estimate.codHandlingFee / 100).toFixed(2)}</span>
                  </div>
                  <div className="divider my-1"></div>
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Total Fee</span>
                    <span>৳{(estimate.totalFee / 100).toFixed(2)}</span>
                  </div>
                  
                  <div className="bg-base-200 p-3 rounded-lg mt-4 text-sm text-center">
                    <span className="block text-base-content/60">Estimated Payout</span>
                    <span className="block font-bold text-success text-lg mt-1">
                      ৳{Math.max(0, codAmount - (estimate.totalFee / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-base-content/50">
                  Click 'Estimate' or change parameters to see delivery charges.
                </div>
              )}

              <div className="card-actions mt-4">
                <button 
                  type="submit" 
                  form="create-parcel-form"
                  className="btn btn-primary w-full shadow-lg"
                  disabled={loading}
                >
                  {loading ? <span className="loading loading-spinner"></span> : 'Submit Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
