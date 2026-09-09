'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, Truck, DollarSign, ArrowRight } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export default function PricingCalculatorPage() {
  const [district, setDistrict] = useState('Dhaka');
  const [sizeTier, setSizeTier] = useState('SMALL');
  const [codAmount, setCodAmount] = useState<number>(0);
  const [serviceType, setServiceType] = useState('STANDARD');
  
  const [result, setResult] = useState<{
    baseFee: number;
    codHandlingFee: number;
    totalFee: number;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        pickupAddress: {
          division: 'Dhaka',
          district: 'Dhaka',
          upazilaOrThana: 'N/A',
          area: 'N/A',
          addressLine: 'N/A'
        },
        deliveryAddress: {
          division: 'N/A',
          district: district, // Pricing service logic depends on this
          upazilaOrThana: 'N/A',
          area: 'N/A',
          addressLine: 'N/A'
        },
        sizeTier,
        serviceType,
        codAmount: Math.round(codAmount * 100), // Convert to paisa
        weightGrams: sizeTier === 'SMALL' ? 1000 : 3000
      };

      const response = await apiClient<{ pricing: any }>('pricing/estimate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setResult(response.pricing);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to calculate price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-base-content tracking-tight mb-4 flex items-center justify-center gap-3">
            <Calculator className="text-primary" size={40} />
            Rate Calculator
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. Estimate your delivery costs instantly.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Calculator Form */}
          <div className="w-full lg:w-1/2">
            <div className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body">
                <form onSubmit={handleCalculate} className="space-y-6">
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Delivery Destination</span>
                    </label>
                    <select 
                      className="select select-bordered w-full"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      <option value="Dhaka">Inside Dhaka</option>
                      <option value="Gazipur">Suburbs (Gazipur, Savar, etc.)</option>
                      <option value="Chittagong">Outside Dhaka (Any District)</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Parcel Size</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['SMALL', 'MEDIUM', 'LARGE'].map((tier) => (
                        <label 
                          key={tier}
                          className={`cursor-pointer border rounded-lg p-3 text-center transition-colors ${
                            sizeTier === tier 
                              ? 'border-primary bg-primary/10 text-primary font-bold' 
                              : 'border-base-300 hover:border-base-content/30'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="sizeTier" 
                            value={tier}
                            checked={sizeTier === tier}
                            onChange={(e) => setSizeTier(e.target.value)}
                            className="hidden"
                          />
                          <span className="text-sm capitalize">{tier.toLowerCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Service Type</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['STANDARD', 'EXPRESS'].map((type) => (
                        <label 
                          key={type}
                          className={`cursor-pointer border rounded-lg p-3 text-center transition-colors ${
                            serviceType === type 
                              ? 'border-primary bg-primary/10 text-primary font-bold' 
                              : 'border-base-300 hover:border-base-content/30'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="serviceType" 
                            value={type}
                            checked={serviceType === type}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="hidden"
                          />
                          <span className="text-sm capitalize">{type.toLowerCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Cash on Delivery (COD) Amount (৳)</span>
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      className="input input-bordered w-full" 
                      value={codAmount || ''}
                      onChange={(e) => setCodAmount(Number(e.target.value) || 0)}
                      placeholder="e.g. 1500"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-full shadow-lg"
                    disabled={loading}
                  >
                    {loading ? <span className="loading loading-spinner"></span> : 'Calculate Rate'}
                  </button>
                  
                  {error && (
                    <div className="alert alert-error text-sm mt-4">
                      {error}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="w-full lg:w-1/2">
            <div className={`h-full card bg-base-100 shadow-xl border ${result ? 'border-primary/50' : 'border-base-200'} transition-all duration-300`}>
              <div className="card-body justify-center relative">
                
                {!result && !loading && (
                  <div className="text-center opacity-50 space-y-4 py-12">
                    <Truck size={48} className="mx-auto text-base-content/30" />
                    <p className="text-lg">Fill out the details to see your rate estimate.</p>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-12">
                    <span className="loading loading-bars loading-lg text-primary"></span>
                  </div>
                )}

                {result && !loading && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8">
                      <p className="text-base-content/70 uppercase tracking-widest text-sm font-bold mb-2">Total Delivery Fee</p>
                      <h2 className="text-5xl font-black text-primary">৳{(result.totalFee / 100).toFixed(2)}</h2>
                    </div>

                    <div className="space-y-4 bg-base-200/50 p-6 rounded-box text-sm">
                      <div className="flex justify-between items-center pb-4 border-b border-base-300">
                        <span className="text-base-content/80 font-medium">Base Delivery Charge</span>
                        <span className="font-bold">৳{(result.baseFee / 100).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pb-4 border-b border-base-300">
                        <span className="text-base-content/80 font-medium flex items-center gap-2">
                          COD Handling Fee (1%)
                        </span>
                        <span className="font-bold">৳{(result.codHandlingFee / 100).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-8 bg-success/10 border border-success/20 p-6 rounded-box text-center">
                      <h3 className="font-bold text-success text-lg flex items-center justify-center gap-2 mb-2">
                        <DollarSign size={20} />
                        Next-Day Payout
                      </h3>
                      <p className="text-sm text-base-content/80 mb-4">
                        We collect ৳{codAmount} and deposit ৳{(codAmount - (result.totalFee / 100)).toFixed(2)} to your account within 24 hours.
                      </p>
                      <Link href="/login" className="btn btn-success w-full text-white shadow-md">
                        Start Shipping Now <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
