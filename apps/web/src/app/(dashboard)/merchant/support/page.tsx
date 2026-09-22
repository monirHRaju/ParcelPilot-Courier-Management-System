'use client';

import { useState } from 'react';
import { HeadphonesIcon, MessageSquare, PhoneCall, Mail, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MerchantSupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('DELIVERY_DELAY');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSent(true);
    setTimeout(() => {
      setSubject('');
      setMessage('');
      setSent(false);
    }, 4000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <HeadphonesIcon className="text-primary" size={26} />
          Merchant Support & Helpdesk
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Get direct help with deliveries, customer disputes, pickup issues, or COD reconciliation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <PhoneCall size={24} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Merchant Hotline</p>
              <p className="text-lg font-bold text-foreground mt-0.5">09612-000000</p>
              <p className="text-[11px] text-muted-foreground">9:00 AM – 10:00 PM Daily</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Support Email</p>
              <p className="text-base font-bold text-foreground mt-0.5">support@parcelpilot.com</p>
              <p className="text-[11px] text-muted-foreground">Responses within 2 hours</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Key Account Manager</p>
              <p className="text-base font-bold text-foreground mt-0.5">Naimur Hasan</p>
              <p className="text-[11px] text-muted-foreground">kam@parcelpilot.com</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {sent && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 text-sm">
          <CheckCircle2 size={18} />
          <span>Ticket #TK-7892 created! Our merchant relations team will contact you shortly.</span>
        </div>
      )}

      {/* Ticket form */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Open a Priority Support Ticket</CardTitle>
          <CardDescription className="text-xs">Describe your query or provide the parcel tracking number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Query Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="DELIVERY_DELAY">Delivery Delay / Rider Not Reaching</option>
                  <option value="PAYMENT_DISPUTE">COD Payment / Settlement Query</option>
                  <option value="PICKUP_DELAY">Pickup Request Delay</option>
                  <option value="RETURN_ISSUE">Return Parcel Verification</option>
                  <option value="OTHER">General Feedback or Inquiries</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Subject / Order ID</label>
                <Input 
                  type="text" 
                  placeholder="e.g. Consignment PP-9014 delivery status query" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  required 
                  className="focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Detailed Message</label>
              <textarea 
                placeholder="Explain the issue with relevant details..." 
                className="flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                required 
              />
            </div>

            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-10 px-6 gap-2">
              <Send size={15} /> Submit Support Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
