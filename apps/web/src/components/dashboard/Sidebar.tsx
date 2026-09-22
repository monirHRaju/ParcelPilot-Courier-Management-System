'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PackagePlus, 
  ListOrdered, 
  ShieldAlert, 
  Wallet, 
  Truck, 
  Tags, 
  Printer, 
  Users, 
  Map, 
  Inbox,
  MoreHorizontal,
  Box,
  CreditCard,
  Settings,
  Car
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Define the menus for different roles
const MENUS = {
  MERCHANT: [
    { name: 'Dashboard', href: '/merchant/dashboard', icon: LayoutDashboard },
    { name: 'Add Parcel', href: '/merchant/parcels/new', icon: PackagePlus },
    { name: 'Consignments', href: '/merchant/parcels', icon: ListOrdered },
    { name: 'Fraud Check', href: '/merchant/fraud-check', icon: ShieldAlert },
    { name: 'Add Fund', href: '/merchant/add-fund', icon: Wallet },
    { name: 'Pickup Requests', href: '/merchant/pickup-requests', icon: Truck },
    { name: 'Pricing', href: '/merchant/pricing', icon: Tags },
    { name: 'Bulk Print', href: '/merchant/bulk-print', icon: Printer },
    { name: 'Moderators', href: '/merchant/moderators', icon: Users },
    { name: 'Tracking Parcel', href: '/merchant/tracking', icon: Map },
    { name: 'My Incoming', href: '/merchant/incoming', icon: Inbox },
    { name: 'Settings', href: '/merchant/settings', icon: Settings },
  ],
  SUPER_ADMIN: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Hubs', href: '/admin/hubs', icon: Box },
    { name: 'Payouts', href: '/admin/payouts', icon: CreditCard },
    { name: 'Riders', href: '/admin/riders', icon: Users },
  ],
  RIDER: [
    { name: 'Dashboard', href: '/rider/dashboard', icon: LayoutDashboard },
    { name: 'Deliveries', href: '/rider/deliveries', icon: Car },
    { name: 'Earnings', href: '/rider/earnings', icon: Wallet },
  ],
  HUB_MANAGER: [
    { name: 'Dashboard', href: '/hub/dashboard', icon: LayoutDashboard },
    { name: 'Hub Parcels', href: '/hub/parcels', icon: Box },
    { name: 'Dispatch', href: '/hub/dispatch', icon: Truck },
  ]
};

export function Sidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const [role, setRole] = useState<keyof typeof MENUS>('MERCHANT');
  const [userName, setUserName] = useState('Merchant Partner');

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as keyof typeof MENUS | null;
    if (storedRole && MENUS[storedRole]) {
      setRole(storedRole);
    } else {
      if (pathname.startsWith('/admin')) setRole('SUPER_ADMIN');
      else if (pathname.startsWith('/rider')) setRole('RIDER');
      else if (pathname.startsWith('/hub')) setRole('HUB_MANAGER');
      else setRole('MERCHANT');
    }

    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, [pathname]);

  const menuItems = MENUS[role] || MENUS.MERCHANT;

  return (
    <aside className={`w-64 flex-none bg-card border-r border-border flex flex-col h-full sticky top-0 z-40 ${className}`}>
      {/* Profile Section */}
      <div className="p-6 flex flex-col items-center border-b border-border">
        <div className="mb-3 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl overflow-hidden border border-primary/20">
           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} alt="Avatar" />
        </div>
        <h2 className="font-bold text-base text-foreground text-center truncate w-full px-2">{userName}</h2>
        <span className="text-[11px] text-muted-foreground font-mono mt-0.5">
          {role === 'SUPER_ADMIN' ? 'Admin Portal' : role === 'RIDER' ? 'Delivery Rider' : role === 'HUB_MANAGER' ? 'Hub Manager' : 'ID: PP-MERCHANT'}
        </span>
      </div>

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[11px] font-semibold text-muted-foreground mb-2 px-3 uppercase tracking-wider">Navigation</p>
        <ul className="space-y-1 w-full p-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/merchant/dashboard' && pathname.startsWith(item.href) && !item.href.endsWith('dashboard'));
            
            return (
              <li key={item.name}>
                <Link 
                  href={item.href} 
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  <item.icon size={17} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
