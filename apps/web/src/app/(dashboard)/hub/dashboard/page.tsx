'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Package, Truck, Box, Users, ArrowRight, Activity, Clock, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HubStats {
  parcelsAtHub: number;
  inboundParcels: number;
  outboundParcels: number;
  activeRiders: number;
  hubActivity: Array<{
    id: string;
    recipientName: string;
    status: string;
    updatedAt: string;
    rider: { user: { phone: string } } | null;
  }>;
}

export default function HubManagerDashboardPage() {
  const [stats, setStats] = useState<HubStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'AT_HUB' | 'INBOUND' | 'OUTBOUND'>('AT_HUB');
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const data = await apiClient<HubStats>('dashboard/hub', {
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

  const filteredActivity = stats.hubActivity.filter((parcel) => {
    if (activeTab === 'AT_HUB') return parcel.status === 'AT_HUB';
    if (activeTab === 'INBOUND') return parcel.status === 'IN_TRANSIT';
    if (activeTab === 'OUTBOUND') return parcel.status === 'OUT_FOR_DELIVERY';
    return true;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hub Overview</h1>
          <p className="text-muted-foreground mt-1">Manage operations, inbound parcels, and dispatch riders.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/hub/parcels')}>
            View All Parcels
          </Button>
          <Button onClick={() => router.push('/hub/dispatch')}>
            Dispatch Rider <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parcels at Hub</CardTitle>
            <Box className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.parcelsAtHub}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for dispatch or transit</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inbound (In Transit)</CardTitle>
            <Truck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inboundParcels}</div>
            <p className="text-xs text-muted-foreground mt-1">Incoming to this hub</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outbound (Delivery)</CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.outboundParcels}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently out for delivery</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-info">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Riders</CardTitle>
            <Users className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeRiders}</div>
            <p className="text-xs text-muted-foreground mt-1">Riders assigned to this hub</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest parcel movements in your hub</CardDescription>
              </div>
              <div className="flex bg-muted rounded-md p-1">
                <button 
                  className={`px-3 py-1 text-sm rounded-sm transition-all ${activeTab === 'AT_HUB' ? 'bg-background shadow font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('AT_HUB')}
                >
                  At Hub
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-sm transition-all ${activeTab === 'INBOUND' ? 'bg-background shadow font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('INBOUND')}
                >
                  Inbound
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-sm transition-all ${activeTab === 'OUTBOUND' ? 'bg-background shadow font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('OUTBOUND')}
                >
                  Outbound
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-md">
                    <tr>
                      <th className="px-4 py-3 font-medium rounded-tl-md rounded-bl-md">ID</th>
                      <th className="px-4 py-3 font-medium">Recipient</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Rider Phone</th>
                      <th className="px-4 py-3 font-medium">Last Updated</th>
                      <th className="px-4 py-3 font-medium rounded-tr-md rounded-br-md text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivity.map((parcel) => (
                      <tr key={parcel.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{parcel.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 font-medium">{parcel.recipientName}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={parcel.status === 'AT_HUB' ? 'border-primary text-primary' : 'border-secondary text-secondary'}>
                            {parcel.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{parcel.rider?.user?.phone || <span className="text-muted-foreground italic">Unassigned</span>}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(parcel.updatedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {parcel.status === 'AT_HUB' && (
                            <Button size="sm" variant="secondary">
                              Assign
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredActivity.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No parcels found for this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/hub/parcels/receive')}>
                <Box className="mr-2 h-4 w-4" /> Receive Incoming Parcels
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/hub/dispatch')}>
                <Truck className="mr-2 h-4 w-4" /> Dispatch to Next Hub
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/hub/assign-rider')}>
                <Users className="mr-2 h-4 w-4" /> Assign Deliveries to Rider
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/hub/reports')}>
                <Activity className="mr-2 h-4 w-4" /> View Daily Report
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">System Status</h3>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Synced:</span>
                  <span className="font-medium">Just now</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Issues:</span>
                  <span className="font-medium text-success">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
