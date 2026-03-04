'use client';

import { useState } from 'react';
import { Vehicle } from '@/lib/types/vehicle';
import { Car, Battery, Calendar, CheckCircle2, Trash2, Loader2, Pencil, Route, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility: merge tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Props for main VehicleList component
interface VehicleListProps {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onDeleteVehicle: (id: string) => Promise<void>;
  onEditVehicle: (vehicle: Vehicle) => void;
  statsByVehicleId: Record<
    string,
    {
      loggedMileageKm: number | null;
      avgWhPerKm: number | null;
    }
  >;
}

// Main list of vehicles
export default function VehicleList({
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onDeleteVehicle,
  onEditVehicle,
  statsByVehicleId,
}: VehicleListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Empty state component
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <Car className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">No vehicles yet</h3>
        <p className="text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
          Add your first electric vehicle to start tracking your charging sessions and efficiency.
        </p>
      </div>
    );
  }

  // Handle delete button in vehicle card
  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${name}"? This will also delete all its charging history. This action cannot be undone.`)) {
      setDeletingId(id);
      try {
        await onDeleteVehicle(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    // Vehicle cards grid
    <div className="grid grid-cols-1 gap-6">
      {vehicles.map((vehicle) => {
        const isActive = activeVehicleId === vehicle.id;
        const isDeleting = deletingId === vehicle.id;
        const stats = statsByVehicleId[vehicle.id];
        return (
          // Single Vehicle Card
          <div
            key={vehicle.id}
            onClick={() => !isDeleting && onSelectVehicle(vehicle.id)}
            className={cn(
              "group relative p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer overflow-hidden",
              isActive
                ? "bg-teal-600 border-teal-600 shadow-md shadow-teal-100"
                : "bg-white border-slate-100 hover:border-teal-200 hover:shadow-md hover:shadow-slate-100",
              isDeleting && "opacity-50 pointer-events-none"
            )}
          >
            {/* Top row: Icon + Title/Meta + Actions */}
            <div className="flex flex-col h-full relative z-10">
              <div className="flex justify-between items-start gap-4 mb-6">
                {/* Vehicle Icon & Main Info */}
                <div className="flex items-start gap-4 overflow-hidden">
                  {/* Vehicle avatar/icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm",
                    isActive ? "bg-white/20 text-white" : "bg-teal-50 text-teal-600 group-hover:scale-110"
                  )}>
                    <Car className="w-7 h-7" />
                  </div>
                  {/* Vehicle name and model */}
                  <div className="overflow-hidden">
                    <h4 className={cn(
                      "font-black text-xl leading-tight tracking-tight truncate",
                      isActive ? "text-white" : "text-slate-900"
                    )} title={vehicle.name}>{vehicle.name}</h4>
                    <p className={cn(
                      "text-sm font-bold opacity-70 truncate",
                      isActive ? "text-teal-50" : "text-slate-500"
                    )}>
                      {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                </div>

                {/* Actions: Delete, Active Check */}
                <div className="flex gap-2 shrink-0 relative z-20">
                  {/* Edit button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditVehicle(vehicle);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl transition-all active:scale-90 shadow-sm",
                      isActive
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-600"
                    )}
                    title="Edit vehicle"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, vehicle.id, vehicle.name)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all active:scale-90 shadow-sm",
                      isActive 
                        ? "bg-white/10 text-white hover:bg-red-600 hover:text-white" 
                        : "bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    )}
                    title="Remove vehicle"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                  {/* Active vehicle check icon */}
                  {isActive && (
                    <div className="p-2.5 bg-white/20 rounded-xl text-white shadow-sm">
                      <CheckCircle2 className="w-6 h-6 opacity-90" />
                    </div>
                  )}
                </div>
              </div>

              {/* Stats: Year/Battery/Mileage/Efficiency */}
              <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Year card */}
                <div className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors",
                  isActive ? "bg-white/10 text-white" : "bg-slate-50 text-slate-600"
                )}>
                  <Calendar className={cn("w-4 h-4", isActive ? "text-teal-100" : "text-slate-400")} />
                  <span className="text-sm font-black uppercase tracking-tighter">{vehicle.year || 'N/A'}</span>
                </div>
                {/* Battery card */}
                <div className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors",
                  isActive ? "bg-white/10 text-white" : "bg-slate-50 text-slate-600"
                )}>
                  <Battery className={cn("w-4 h-4", isActive ? "text-teal-100" : "text-slate-400")} />
                  <span className="text-sm font-black uppercase tracking-tighter">
                    {vehicle.battery_capacity_kwh ? `${vehicle.battery_capacity_kwh} kWh` : 'N/A'}
                  </span>
                </div>
                {/* Logged mileage card */}
                <div className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors",
                  isActive ? "bg-white/10 text-white" : "bg-slate-50 text-slate-600"
                )}>
                  <Route className={cn("w-4 h-4", isActive ? "text-teal-100" : "text-slate-400")} />
                  <span className="text-sm font-black uppercase tracking-tighter">
                    {stats?.loggedMileageKm !== null && stats?.loggedMileageKm !== undefined
                      ? `${Math.round(stats.loggedMileageKm)} km`
                      : 'N/A'}
                  </span>
                </div>
                {/* Average efficiency card */}
                <div className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors",
                  isActive ? "bg-white/10 text-white" : "bg-slate-50 text-slate-600"
                )}>
                  <Zap className={cn("w-4 h-4", isActive ? "text-teal-100" : "text-slate-400")} />
                  <span className="text-sm font-black uppercase tracking-tighter">
                    {stats?.avgWhPerKm !== null && stats?.avgWhPerKm !== undefined
                      ? `${Math.round(stats.avgWhPerKm)} Wh/km`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative background for active card */}
            {isActive && (
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            )}
          </div>
        );
      })}
    </div>
  );
}
