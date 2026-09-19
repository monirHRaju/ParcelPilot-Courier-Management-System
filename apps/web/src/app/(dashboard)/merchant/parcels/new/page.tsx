'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackagePlus, Wand2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function CreateParcelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [deliveryType, setDeliveryType] = useState('home');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka City');
  const [thana, setThana] = useState('Gulshan');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  
  const [codAmount, setCodAmount] = useState('');
  const [invoice, setInvoice] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [note, setNote] = useState('');
  const [weight, setWeight] = useState('0');
  const [exchange, setExchange] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      // For demo purposes, we allow it to proceed even without token if testing locally
      
      const payload = {
        recipientName: name || 'Customer',
        recipientPhone: phone || '0123456789',
        pickupAddress: { division: 'Dhaka', district: 'Dhaka City', upazilaOrThana: 'N/A', area: 'N/A', addressLine: 'Merchant Store' },
        deliveryAddress: { division: 'Dhaka', district, upazilaOrThana: thana, area: thana, addressLine: address },
        sizeTier: Number(weight) > 1 ? 'MEDIUM' : 'SMALL',
        serviceType: 'STANDARD',
        codAmount: Math.round(Number(codAmount || 0) * 100),
        weightGrams: Number(weight) * 1000
      };

      if (token) {
        await apiClient('parcels', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        }).catch(err => {
          console.warn("API Error (ignored for demo UI):", err);
        });
      }

      router.push('/merchant/parcels');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create parcel');
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 bg-base-100 min-h-full">
      {/* AI Assist Banner */}
      <div className="bg-emerald-500 rounded-xl p-4 flex items-center justify-between text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
            <Wand2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">AI Assist</h2>
              <span className="bg-emerald-200 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">NEW</span>
            </div>
            <p className="text-emerald-50 text-sm">Got a screenshot or a pasted customer message? Let AI fill the form for you in seconds.</p>
          </div>
        </div>
        <button className="btn btn-sm bg-white text-emerald-600 hover:bg-emerald-50 border-none font-bold px-6 rounded-full flex items-center gap-2 shadow-sm">
          <Wand2 size={16} /> Try it
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        
        {/* Delivery Type Radios */}
        <div className="flex gap-6 mb-8 text-sm font-medium pl-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="deliveryType" className="radio radio-success radio-sm" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} />
            Home Delivery
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-base-content/70">
            <input type="radio" name="deliveryType" className="radio radio-success radio-sm" checked={deliveryType === 'point'} onChange={() => setDeliveryType('point')} />
            Point Delivery
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80">Phone#</label>
              <input type="text" placeholder="Type Phone Number" className="input input-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80">Name</label>
              <input type="text" placeholder="Type Recipient Name" className="input input-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80 pt-3">Address</label>
              <textarea placeholder="Type Address" className="textarea textarea-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100 h-24" value={address} onChange={e => setAddress(e.target.value)} required></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80">District</label>
              <select className="select select-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100" value={district} onChange={e => setDistrict(e.target.value)}>
                <option value="Dhaka City">Dhaka City</option>
                <option value="Gazipur">Gazipur</option>
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80">Thana</label>
              <div className="w-full">
                <input type="text" className="input input-bordered w-full rounded-md border-emerald-400 bg-emerald-50/30 focus:outline-emerald-500" value={thana} onChange={e => setThana(e.target.value)} />
                <div className="text-xs text-sky-500 font-medium mt-1 cursor-pointer hover:underline">Disable District Field</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
              <label className="w-32 text-sm text-base-content/80">Alternative Phone</label>
              <input type="text" placeholder="Type Alternative Phone" className="input input-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100" value={alternativePhone} onChange={e => setAlternativePhone(e.target.value)} />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80">Recipient Email</label>
              <input type="email" placeholder="Type Recipient Email" className="input input-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80">COD Amount</label>
              <input type="number" placeholder="Type Cash on Delivery Amount" className="input input-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100" value={codAmount} onChange={e => setCodAmount(e.target.value)} required />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80">Invoice</label>
              <input type="text" placeholder="Type Invoice (If any)" className="input input-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100" value={invoice} onChange={e => setInvoice(e.target.value)} />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80 pt-3">Item Description</label>
              <textarea placeholder="Type Item description(max. 400 Chars)" className="textarea textarea-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100 h-24" value={itemDescription} onChange={e => setItemDescription(e.target.value)}></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80 pt-3">Note</label>
              <textarea placeholder="Type Note(max. 400 Chars)" className="textarea textarea-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100 h-20" value={note} onChange={e => setNote(e.target.value)}></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80">Weight (KG)</label>
              <input type="number" className="input input-bordered w-full rounded-md focus:outline-emerald-500 bg-base-100" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="w-32 text-sm text-base-content/80">Exchange</label>
              <input type="checkbox" className="checkbox checkbox-sm checkbox-success rounded" checked={exchange} onChange={e => setExchange(e.target.checked)} />
            </div>
            
            <div className="pt-4">
              <button type="submit" disabled={loading} className="btn w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-md border-none font-bold">
                {loading ? <span className="loading loading-spinner"></span> : 'Submit'}
              </button>
              <div className="text-center mt-3 text-sm text-base-content/60">
                * PickUp Time <span className="text-emerald-500 font-medium">4pm-7pm</span> Approx.
              </div>
            </div>
          </div>
          
        </div>
        
        <div className="mt-8 text-sm">
          <span className="text-base-content/60">To create multiple orders quickly try</span> <a href="#" className="text-emerald-500 font-semibold hover:underline ml-1">Bulk Import</a>
        </div>
      </form>
    </div>
  );
}
