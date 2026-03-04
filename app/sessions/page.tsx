'use client';

import { useEffect, useState, useCallback } from 'react';
import { useVehicle } from '@/lib/context/VehicleContext';
import { sessionsService } from '@/lib/services/sessionsService';
import { calculations } from '@/lib/logic/calculations';
import { SessionWithCalculations } from '@/lib/types/session';
import { Vehicle } from '@/lib/types/vehicle';
import { vehiclesService } from '@/lib/services/vehiclesService';
import SessionForm from '@/components/sessions/SessionForm';
import SessionTable from '@/components/sessions/SessionTable';
import EditSessionModal from '@/components/sessions/EditSessionModal';
import VehicleStats from '@/components/vehicles/VehicleStats';
import Link from 'next/link';
import { ChevronDown, Car } from 'lucide-react';

export default function SessionsPage() {
  const { activeVehicleId, setActiveVehicleId, vehicles } = useVehicle();
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [sessions, setSessions] = useState<SessionWithCalculations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<SessionWithCalculations | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!activeVehicleId) return;
    
    setIsLoading(true);
    try {
      // Fetch vehicle details to show identity
      const vehicle = vehicles.find(v => v.id === activeVehicleId);
      setActiveVehicle(vehicle || null);

      const rawSessions = await sessionsService.listSessions(activeVehicleId);
      const enriched = calculations.enrichSessions(rawSessions);
      setSessions(enriched);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError('Failed to load charging sessions.');
    } finally {
      setIsLoading(false);
    }
  }, [activeVehicleId, vehicles]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (!activeVehicleId) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No Vehicle Selected</h2>
          <p className="text-slate-600 mb-6">
            You need to select a vehicle before you can log or view charging sessions.
          </p>
          <Link 
            href="/vehicles" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Go to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  const stats = calculations.calculateVehicleStats(sessions);

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {activeVehicle ? `${activeVehicle.name}` : 'Charging Sessions'}
            </h2>
            
            <div className="relative group">
              <select
                value={activeVehicleId || ''}
                onChange={(e) => setActiveVehicleId(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer">
                <Car className="w-4 h-4" />
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          {activeVehicle && (
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </span>
            </div>
          )}
        </div>
      </div>

      <VehicleStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">History</h3>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
            </span>
          </div>
          
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
              </div>
              <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading history...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-3xl text-sm font-bold border border-red-100 animate-in fade-in zoom-in-95">
              {error}
            </div>
          ) : (
            <SessionTable sessions={sessions} onEditSession={setEditingSession} />
          )}
        </div>

        <div className="space-y-6">
          <SessionForm vehicleId={activeVehicleId} onSessionCreated={fetchSessions} />
        </div>
      </div>

      {editingSession && (
        <EditSessionModal 
          session={editingSession} 
          onClose={() => setEditingSession(null)} 
          onSessionUpdated={fetchSessions}
        />
      )}
    </div>
  );
}
