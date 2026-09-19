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
  MoreHorizontal
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/merchant/dashboard', icon: LayoutDashboard },
  { name: 'Add Parcel', href: '/merchant/parcels/new', icon: PackagePlus },
  { name: 'Consignments', href: '/merchant/parcels', icon: ListOrdered },
  { name: 'Fraud Check', href: '#', icon: ShieldAlert },
  { name: 'Add Fund', href: '#', icon: Wallet },
  { name: 'Pickup Requests', href: '#', icon: Truck },
  { name: 'Pricing', href: '#', icon: Tags },
  { name: 'Bulk Print', href: '#', icon: Printer },
  { name: 'Moderators', href: '#', icon: Users },
  { name: 'Tracking Parcel', href: '#', icon: Map },
  { name: 'My Incoming', href: '#', icon: Inbox },
  { name: 'More', href: '#', icon: MoreHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-none bg-base-100 border-r border-base-200 flex flex-col h-full sticky top-0">
      {/* Profile Section */}
      <div className="p-6 flex flex-col items-center border-b border-base-200">
        <div className="avatar mb-3">
          <div className="w-16 rounded-full bg-base-300 flex items-center justify-center text-3xl">
            <span className="opacity-50">👤</span>
          </div>
        </div>
        <h2 className="font-bold text-lg">Prokritir Choya</h2>
        <span className="text-xs text-base-content/60 font-mono">ID: MFDE8HRM</span>
      </div>

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold text-base-content/40 mb-2 px-4 uppercase tracking-wider">Main Menu</p>
        <ul className="menu menu-sm w-full gap-1 p-0">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/merchant/dashboard' && pathname.startsWith(item.href) && item.href !== '#');
            return (
              <li key={item.name}>
                <Link 
                  href={item.href} 
                  className={`flex gap-3 px-4 py-2.5 rounded-lg ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-600 font-medium dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'hover:bg-base-200'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-base-content/60'} />
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
