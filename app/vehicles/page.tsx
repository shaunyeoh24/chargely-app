'use client';

import { useEffect, useState } from 'react';
import { Vehicle } from '@/lib/types/vehicle';
import { vehiclesService } from '@/lib/services/vehiclesService';
import { sessionsService } from '@/lib/services/sessionsService';
import VehicleForm from '@/components/vehicles/VehicleForm';
import VehicleList from '@/components/vehicles/VehicleList';
import EditVehicleModal from '@/components/vehicles/EditVehicleModal';
import { useVehicle } from '@/lib/context/VehicleContext';
import { calculations } from '@/lib/logic/calculations';

import { vehicleSelection } from '@/lib/logic/vehicleSelection';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statsByVehicleId, setStatsByVehicleId] = useState<Record<string, { loggedMileageKm: number | null; avgWhPerKm: number | null }>>({});
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { activeVehicleId, setActiveVehicleId } = useVehicle();
  const [isLoading, setIsLoading] = useState(true);

  const computeVehicleStats = async (vehicleList: Vehicle[]) => {
    const entries = await Promise.all(
      vehicleList.map(async (vehicle) => {
        const sessions = await sessionsService.listSessions(vehicle.id);
        const enriched = calculations.enrichSessions(sessions);
        const calculated = calculations.calculateVehicleStats(enriched);

        if (sessions.length < 2) {
          return [vehicle.id, { loggedMileageKm: null, avgWhPerKm: calculated?.avgWhPerKm ?? null }] as const;
        }

        const odometerValues = sessions.map((session) => session.odometer_km);
        const loggedMileageKm = Math.max(...odometerValues) - Math.min(...odometerValues);

        return [vehicle.id, { loggedMileageKm, avgWhPerKm: calculated?.avgWhPerKm ?? null }] as const;
      })
    );

    setStatsByVehicleId(Object.fromEntries(entries));
  };

  const fetchVehicles = async () => {
    try {
      const data = await vehiclesService.listVehicles();
      setVehicles(data);
      await computeVehicleStats(data);
      
      // Resolve active vehicle ID based on fetched list
      const resolvedId = vehicleSelection.resolveActiveVehicleId(activeVehicleId, data);
      if (resolvedId !== activeVehicleId) {
        setActiveVehicleId(resolvedId);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      // Cascade delete sessions first
      await sessionsService.deleteSessionsByVehicle(id);
      // Delete vehicle
      await vehiclesService.deleteVehicle(id);
      
      // If the deleted vehicle was active, clear it first so fetchVehicles can resolve a new one
      if (id === activeVehicleId) {
        setActiveVehicleId(null);
      }
      
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      alert('Failed to delete vehicle. Please try again.');
    }
  };

  const handleVehicleUpdated = async () => {
    await fetchVehicles();
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Vehicles</h2>
          <p className="text-slate-500 font-medium text-lg">Manage your electric fleet and active tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Your Fleet</h3>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
            </span>
          </div>
          
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
              </div>
              <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading fleet...</p>
            </div>
          ) : (
            <VehicleList 
              vehicles={vehicles} 
              activeVehicleId={activeVehicleId}
              onSelectVehicle={setActiveVehicleId}
              onDeleteVehicle={handleDeleteVehicle}
              onEditVehicle={setEditingVehicle}
              statsByVehicleId={statsByVehicleId}
            />
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <VehicleForm onVehicleCreated={fetchVehicles} />
        </div>
      </div>

      {editingVehicle && (
        <EditVehicleModal
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onVehicleUpdated={handleVehicleUpdated}
        />
      )}
    </div>
  );
}
