'use client';

import { useEffect, useState, useCallback } from 'react';
import { useVehicle } from '@/lib/context/VehicleContext';
import { sessionsService } from '@/lib/services/sessionsService';
import { calculations } from '@/lib/logic/calculations';
import { SessionWithCalculations } from '@/lib/types/session';
import SessionForm from '@/components/sessions/SessionForm';
import SessionTable from '@/components/sessions/SessionTable';
import EditSessionModal from '@/components/sessions/EditSessionModal';
import VehicleStats from '@/components/vehicles/VehicleStats';
import Link from 'next/link';
import { ChevronDown, Car } from 'lucide-react';
import { vehicleSelection } from '@/lib/logic/vehicleSelection';

export default function SessionsPage() {
  const { activeVehicleId, setActiveVehicleId, vehicles } = useVehicle();
  const [sessions, setSessions] = useState<SessionWithCalculations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<SessionWithCalculations | null>(null);
  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || null;

  useEffect(() => {
    const resolvedId = vehicleSelection.resolveActiveVehicleId(activeVehicleId, vehicles);
    if (resolvedId !== activeVehicleId) {
      setActiveVehicleId(resolvedId);
    }
  }, [activeVehicleId, vehicles, setActiveVehicleId]);

  const fetchSessions = useCallback(async () => {
    const resolvedId = vehicleSelection.resolveActiveVehicleId(activeVehicleId, vehicles);
    if (resolvedId !== activeVehicleId) {
      setActiveVehicleId(resolvedId);
      return;
    }
    if (!resolvedId) {
      setSessions([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const rawSessions = await sessionsService.listSessions(resolvedId);
      const enriched = calculations.enrichSessions(rawSessions);
      setSessions(enriched);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError('Failed to load charging sessions.');
    } finally {
      setIsLoading(false);
    }
  }, [activeVehicleId, vehicles, setActiveVehicleId]);

  const handleDeleteSession = async (id: string) => {
    try {
      await sessionsService.deleteSession(id);
      await fetchSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
      alert('Failed to delete session. Please try again.');
    }
  };

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
            className="inline-block bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-sm shadow-teal-100"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-start lg:items-end">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {activeVehicle ? `${activeVehicle.name}` : 'Charging Sessions'}
            </h2>
          </div>

          {activeVehicle && (
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-black uppercase tracking-widest border border-teal-100">
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </span>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 w-full lg:justify-self-stretch">
          <div className="relative">
            <select
              value={activeVehicleId || ''}
              onChange={(e) => setActiveVehicleId(e.target.value)}
              className="appearance-none w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-slate-700 font-semibold text-sm sm:text-base hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10 outline-none transition-colors"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <Car className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight px-1">Lifetime Overview</h3>
        <VehicleStats stats={stats} />
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight px-1">New Charge Log</h3>
        <SessionForm key={activeVehicleId} vehicleId={activeVehicleId} onSessionCreated={fetchSessions} />

        <div className="space-y-8">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Charging History</h3>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
            </span>
          </div>
          
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-100 border-t-teal-600"></div>
              </div>
              <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading history...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-3xl text-sm font-bold border border-red-100 animate-in fade-in zoom-in-95">
              {error}
            </div>
          ) : (
            <SessionTable
              sessions={sessions}
              onEditSession={setEditingSession}
              onDeleteSession={handleDeleteSession}
            />
          )}
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
