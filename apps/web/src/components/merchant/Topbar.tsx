'use client';

import { Search, Bell, ShoppingCart, Menu } from 'lucide-react';
import { HeaderAuth } from '../layout/HeaderAuth';
import Link from 'next/link';

export function Topbar() {
  return (
    <header className="h-16 bg-base-100 border-b border-base-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile menu button placeholder */}
        <button className="lg:hidden btn btn-square btn-ghost btn-sm">
          <Menu size={20} />
        </button>
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight flex items-center">
            <span className="text-emerald-500 mr-1 text-2xl font-black">/</span> 
            SteadFast
            <span className="text-xs font-normal opacity-70 ml-1 mt-1 italic">Courier</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 max-w-xl px-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
          <input 
            type="text" 
            placeholder="Search Consignment" 
            className="input input-sm input-bordered w-full pl-10 rounded-full bg-base-200/50 focus:bg-base-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        <button className="btn btn-sm btn-outline rounded-full text-emerald-500 border-emerald-500 hover:bg-emerald-50 hover:border-emerald-600 hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          Check Balance
        </button>

        <div className="flex items-center gap-1 border-l border-base-200 pl-4">
          <button className="btn btn-sm btn-ghost px-2 font-bold">EN</button>
          
          <button className="btn btn-sm btn-circle btn-ghost relative">
            <Bell size={20} className="text-base-content/70" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          
          <button className="btn btn-sm btn-circle btn-ghost">
            <ShoppingCart size={20} className="text-base-content/70" />
          </button>

          <div className="ml-2">
            <HeaderAuth />
          </div>
        </div>
      </div>
    </header>
  );
}
