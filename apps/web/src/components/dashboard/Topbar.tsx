'use client';

import { useState, useEffect } from 'react';
import { Bell, Sun, Moon, Menu, User, LogOut, Lock, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { SearchConsignment } from './SearchConsignment';

export function Topbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    setMounted(true);
    const storedName = localStorage.getItem('userName') || 'User';
    const storedRole = localStorage.getItem('userRole') || '';
    setUserName(storedName);
    setUserRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  const handleCheckBalance = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${baseUrl}/merchant/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance ?? 0);
      } else {
        // Fallback simulated balance for demo
        setBalance(15240);
      }
    } catch {
      setBalance(15240);
    }
    setTimeout(() => setBalance(null), 3000);
  };

  const roleLabel =
    userRole === 'SUPER_ADMIN' ? 'Admin' :
    userRole === 'MERCHANT' ? 'Merchant' :
    userRole === 'RIDER' ? 'Rider' :
    userRole === 'HUB_MANAGER' ? 'Hub Manager' : '';

  const avatarSeed = encodeURIComponent(userName);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="h-full overflow-y-auto">
              <Sidebar className="flex w-full border-r-0" />
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-black text-sm">PP</span>
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:block">
            ParcelPilot
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl px-6 hidden lg:block">
        <SearchConsignment />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Check Balance - only for merchants */}
        {(userRole === 'MERCHANT' || !userRole) && (
          <Button
            variant="outline"
            onClick={handleCheckBalance}
            className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-full text-sm border-primary/30 text-primary hover:bg-primary/10 min-w-[140px] justify-center"
          >
            {balance !== null ? (
              <span className="font-bold flex items-center gap-1">
                <Wallet size={14} /> ৳{balance.toLocaleString()}
              </span>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Check Balance
              </>
            )}
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="font-medium text-sm">New Pickup Request</span>
                <span className="text-xs text-muted-foreground">Parcel #1029 from Mirpur has been requested.</span>
                <span className="text-xs text-muted-foreground/60">2 minutes ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="font-medium text-sm">Delivery Successful</span>
                <span className="text-xs text-muted-foreground">Parcel #9923 was delivered successfully.</span>
                <span className="text-xs text-muted-foreground/60">15 minutes ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="font-medium text-sm">COD Payment Processed</span>
                <span className="text-xs text-muted-foreground">৳4,200 has been added to your wallet.</span>
                <span className="text-xs text-muted-foreground/60">1 hour ago</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-primary text-xs font-medium py-2 cursor-pointer justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hidden sm:flex"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        )}

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`} alt={userName} />
                <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{roleLabel}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Lock className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
