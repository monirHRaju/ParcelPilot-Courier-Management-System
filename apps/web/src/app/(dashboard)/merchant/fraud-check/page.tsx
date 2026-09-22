'use client';

import { useState } from 'react';
import { ShieldAlert, Search, AlertTriangle, CheckCircle2, UserX, PhoneCall } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FraudCheckPage() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);

    setTimeout(() => {
      // Demo risk assessment logic
      const isHighRisk = phone.endsWith('0') || phone.endsWith('9');
      setResult({
        phone,
        totalOrders: isHighRisk ? 14 : 28,
        delivered: isHighRisk ? 5 : 26,
        returned: isHighRisk ? 9 : 2,
        successRate: isHighRisk ? '35.7%' : '92.8%',
        riskScore: isHighRisk ? 'HIGH' : 'LOW',
        reportsCount: isHighRisk ? 4 : 0,
        lastReportNote: isHighRisk ? 'Customer refused to receive parcel after multiple delivery attempts.' : null
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <ShieldAlert className="text-primary" size={26} />
          Customer Fraud & Risk Check
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Verify recipient delivery history, return propensity, and fake order reports before shipping.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Check Recipient Phone</CardTitle>
          <CardDescription className="text-xs">
            Enter 11-digit mobile number to inspect community delivery success records across ParcelPilot network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="e.g. 01712345678"
                className="pl-9 focus-visible:ring-primary"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {loading ? 'Analyzing...' : 'Inspect Risk'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="border-border/80">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground font-medium">Risk Level</p>
                <div className="mt-2 flex items-center gap-2">
                  {result.riskScore === 'HIGH' ? (
                    <>
                      <Badge className="bg-rose-500 text-white font-bold">High Risk</Badge>
                      <AlertTriangle className="text-rose-500" size={18} />
                    </>
                  ) : (
                    <>
                      <Badge className="bg-emerald-500 text-white font-bold">Safe Recipient</Badge>
                      <CheckCircle2 className="text-emerald-500" size={18} />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground font-medium">Delivery Success Rate</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{result.successRate}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{result.delivered} of {result.totalOrders} parcels</p>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground font-medium">Returned Orders</p>
                <p className="text-2xl font-bold mt-1 text-rose-600">{result.returned}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Cancelled or rejected</p>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground font-medium">Merchant Reports</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{result.reportsCount}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Flagged for suspicious behaviour</p>
              </CardContent>
            </Card>
          </div>

          {result.lastReportNote && (
            <Card className="border-rose-500/30 bg-rose-500/5">
              <CardContent className="p-4 flex items-start gap-3 text-sm text-rose-800 dark:text-rose-300">
                <UserX className="shrink-0 mt-0.5 text-rose-600" size={18} />
                <div>
                  <span className="font-bold">Latest Community Alert: </span>
                  {result.lastReportNote}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
