'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Package, CheckCircle, DollarSign, Wallet, Users, Truck, Building2, ArrowRight, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalParcels: number;
  deliveredParcels: number;
  totalRevenue: number;
  totalCodCollected: number;
  recentActivity: Array<{
    id: string;
    status: string;
    createdAt: string;
    merchant: { businessName: string };
  }>;
  volumeTrends: Array<{
    date: string;
    count: number;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const data = await apiClient<DashboardStats>('dashboard/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data);
      } catch (err: any) {
        console.error(err);
        if (err.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userRole');
          router.push('/login');
          return;
        }
        setError(err.message || 'Failed to load dashboard data');
      }
    };
    fetchStats();
  }, [router]);

  if (error) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor platform metrics, revenue, and system activity.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/reports')}>
            <Activity className="mr-2 h-4 w-4" /> Reports
          </Button>
          <Button onClick={() => router.push('/admin/payouts')}>
            Process Payouts <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Parcels</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalParcels.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time processed</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.deliveredParcels.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 text-success">
              {((stats.deliveredParcels / stats.totalParcels) * 100 || 0).toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-info">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (Fees)</CardTitle>
            <DollarSign className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳{(stats.totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Total delivery charges</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">COD Collected</CardTitle>
            <Wallet className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳{(stats.totalCodCollected / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending merchant payouts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parcel Volume</CardTitle>
              <CardDescription>Daily parcel entries over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.volumeTrends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} 
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/hubs')}>
                <Building2 className="mr-2 h-4 w-4 text-primary" /> Manage Hubs & Branches
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/riders')}>
                <Truck className="mr-2 h-4 w-4 text-secondary" /> Approve Riders
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/merchants')}>
                <Users className="mr-2 h-4 w-4 text-accent" /> Manage Merchants
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Parcels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.slice(0, 5).map((parcel) => (
                  <div key={parcel.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{parcel.merchant.businessName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(parcel.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {parcel.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
                {stats.recentActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
