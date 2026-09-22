'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Menu, User, LogOut, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const handleCheckBalance = () => {
    // Simulate fetching balance
    setBalance(15240);
    setTimeout(() => {
      setBalance(null);
    }, 3000);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Sheet>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
             <div className="h-full overflow-y-auto">
                <Sidebar className="flex w-full border-r-0" />
             </div>
          </SheetContent>
        </Sheet>
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight flex items-center">
            <span className="text-primary mr-1 text-2xl font-black">/</span> 
            ParcelPilot
            <span className="text-xs font-normal opacity-70 ml-1 mt-1 italic text-muted-foreground">Courier</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 max-w-xl px-8 hidden lg:block">
        <SearchConsignment />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button 
          variant="outline" 
          onClick={handleCheckBalance}
          className="rounded-full text-primary border-primary hover:bg-primary/10 hidden sm:flex items-center gap-2 h-9 px-4 min-w-[140px] justify-center transition-all"
        >
          {balance !== null ? (
            <span className="font-bold">৳ {balance.toLocaleString()}</span>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
              Check Balance
            </>
          )}
        </Button>

        <div className="flex items-center gap-1 sm:border-l border-border sm:pl-4">
          <Button variant="ghost" size="sm" className="font-bold hidden sm:flex">EN</Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium text-sm">New Pickup Request</span>
                  <span className="text-xs text-muted-foreground">Parcel #1029 from Mirpur has been requested.</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium text-sm">Delivery Successful</span>
                  <span className="text-xs text-muted-foreground">Parcel #9923 was delivered successfully.</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hidden sm:flex"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          )}

          {/* User Profile Dropdown */}
          <div className="ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full flex items-center justify-center outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=ParcelPilot" alt="Avatar" />
                  <AvatarFallback>PP</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Prokritir Choya</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      ID: MFDE8HRM
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
