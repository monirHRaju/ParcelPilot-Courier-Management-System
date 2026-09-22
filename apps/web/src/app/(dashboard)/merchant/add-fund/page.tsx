'use client';

import { useState } from 'react';
import { Wallet, CreditCard, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AddFundPage() {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bkash');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSuccessMessage(`Payment request of ৳${amount} via ${selectedMethod.toUpperCase()} initiated successfully.`);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Wallet className="text-primary" size={26} />
          Add Funds to Wallet
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Top up your ParcelPilot merchant credit balance for seamless automatic fee settlement and shipping label creation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/80 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground">Current Available Balance</p>
            <p className="text-3xl font-bold text-primary mt-1">৳15,000.00</p>
            <p className="text-[11px] text-muted-foreground mt-1">Updated 5 minutes ago</p>
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground">Pending Payouts</p>
            <p className="text-3xl font-bold text-foreground mt-1">৳2,500.00</p>
            <p className="text-[11px] text-muted-foreground mt-1">Settles Wednesday 12:00 PM</p>
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground">Security Deposit</p>
            <p className="text-3xl font-bold text-foreground mt-1">৳5,000.00</p>
            <p className="text-[11px] text-muted-foreground mt-1">Refundable anytime</p>
          </CardContent>
        </Card>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 text-sm">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Select Top-up Method</CardTitle>
          <CardDescription className="text-xs">Instant recharge through trusted payment gateways</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDeposit} className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'bkash', name: 'bKash Online', icon: '📱' },
                { id: 'nagad', name: 'Nagad Direct', icon: '💳' },
                { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
              ].map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedMethod === method.id 
                      ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                      : 'border-border hover:bg-muted text-foreground'
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="text-xs font-semibold">{method.name}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Amount to Add (৳)</label>
              <Input
                type="number"
                placeholder="Minimum ৳500"
                min="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus-visible:ring-primary font-bold text-lg"
                required
              />
            </div>

            <div className="flex gap-2">
              {[1000, 2000, 5000, 10000].map((quick) => (
                <Button
                  key={quick}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(String(quick))}
                  className="rounded-full text-xs font-medium"
                >
                  +৳{quick}
                </Button>
              ))}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 rounded-xl shadow">
              Proceed to Gateway <ArrowRight size={16} className="ml-1" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
