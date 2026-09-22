'use client';

import { useState } from 'react';
import { Tags, Calculator, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MerchantPricingPage() {
  const [weight, setWeight] = useState('1');
  const [destination, setDestination] = useState('inside');
  const [codAmount, setCodAmount] = useState('1000');

  const calculateEstimate = () => {
    const w = Math.max(0.5, Number(weight) || 1);
    const cod = Number(codAmount) || 0;
    let base = destination === 'inside' ? 60 : destination === 'suburb' ? 100 : 130;
    
    // Extra weight charges: ৳20 per kg above 1kg
    const extraWeightFee = w > 1 ? Math.ceil(w - 1) * 20 : 0;
    // COD fee: 1%
    const codFee = Math.round(cod * 0.01);
    const total = base + extraWeightFee + codFee;

    return { base, extraWeightFee, codFee, total };
  };

  const est = calculateEstimate();

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Tags className="text-primary" size={26} />
          Delivery Rates & Pricing Plans
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Transparent courier rates with no hidden fuel surcharges or pickup fees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rate Cards */}
        <Card className="border-border/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <CardHeader>
            <Badge className="w-fit bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none">Inside Dhaka</Badge>
            <CardTitle className="text-3xl font-black mt-2 text-foreground">৳60 <span className="text-xs font-normal text-muted-foreground">/ up to 1kg</span></CardTitle>
            <CardDescription className="text-xs">Next-day door-to-door delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>• Delivery timeline: 24 - 48 Hours</p>
            <p>• Extra weight: +৳20 per additional KG</p>
            <p>• COD fee: 1% of collected cash</p>
            <p>• Free return on partial deliveries</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <CardHeader>
            <Badge className="w-fit bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none">Dhaka Suburbs</Badge>
            <CardTitle className="text-3xl font-black mt-2 text-foreground">৳100 <span className="text-xs font-normal text-muted-foreground">/ up to 1kg</span></CardTitle>
            <CardDescription className="text-xs">Savar, Gazipur, Keraniganj, Narayanganj</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>• Delivery timeline: 48 Hours</p>
            <p>• Extra weight: +৳25 per additional KG</p>
            <p>• COD fee: 1%</p>
            <p>• Daily hub dispatch</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <CardHeader>
            <Badge className="w-fit bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none">Outside Dhaka</Badge>
            <CardTitle className="text-3xl font-black mt-2 text-foreground">৳130 <span className="text-xs font-normal text-muted-foreground">/ up to 1kg</span></CardTitle>
            <CardDescription className="text-xs">All 64 districts nationwide</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>• Delivery timeline: 48 - 72 Hours</p>
            <p>• Extra weight: +৳25 per additional KG</p>
            <p>• Nationwide tracking via SMS & App</p>
            <p>• Cash on delivery anywhere in Bangladesh</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Pricing Estimator */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator size={18} className="text-primary" /> Delivery Charge Estimator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Destination Region</label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="inside">Inside Dhaka City</option>
                <option value="suburb">Dhaka Suburbs (Savar/Gazipur)</option>
                <option value="outside">Outside Dhaka (All BD)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Weight (KG)</label>
              <Input
                type="number"
                step="0.5"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Collection Amount (৳)</label>
              <Input
                type="number"
                value={codAmount}
                onChange={e => setCodAmount(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Estimated Fee</p>
                <p className="text-xl font-black text-primary">৳{est.total}</p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <p>Base: ৳{est.base}</p>
                <p>COD: ৳{est.codFee}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
