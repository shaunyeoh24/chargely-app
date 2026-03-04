'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVehicle } from '@/lib/context/VehicleContext';
import { Car, History, LayoutDashboard, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const pathname = usePathname();
  const { activeVehicleId, vehicles } = useVehicle();
  
  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vehicles', label: 'Vehicles', icon: Car },
    { href: '/sessions', label: 'Sessions', icon: History },
  ];

  return (
    <nav className="chargely-main-nav sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 group transition-transform active:scale-95">
            <div className="chargely-logo-block w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-sm shadow-teal-100 group-hover:rotate-3 transition-transform">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600">
              Chargely
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    isActive 
                      ? "bg-teal-600 text-white shadow-md shadow-teal-100" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeVehicle && (
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-bold text-slate-700">
                {activeVehicle.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
