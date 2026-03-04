'use client';

import { useEffect, useState } from 'react';
import { CreateSessionInput } from '@/lib/types/session';
import { sessionsService } from '@/lib/services/sessionsService';
import { Zap } from 'lucide-react';

interface SessionFormProps {
  vehicleId: string;
  onSessionCreated: () => void;
}

export default function SessionForm({ vehicleId, onSessionCreated }: SessionFormProps) {
  const [formData, setFormData] = useState<Partial<CreateSessionInput>>({
    vehicle_id: vehicleId,
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      vehicle_id: vehicleId,
    }));
  }, [vehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.kwh || !formData.cost_rm || !formData.odometer_km || !formData.date) {
      setError('All fields are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: CreateSessionInput = {
        ...formData,
        vehicle_id: vehicleId,
      } as CreateSessionInput;

      await sessionsService.createSession(payload);
      setFormData({
        vehicle_id: vehicleId,
        date: new Date().toISOString().split('T')[0],
      });
      onSessionCreated();
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to log session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="chargely-session-form bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shadow-inner">
          <Zap className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Insert Charging and Odometer Details</h3>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-700 ml-1 uppercase tracking-wider">Date</label>
          <input
            name="date"
            type="date"
            value={formData.date || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-700 ml-1 uppercase tracking-wider">Energy (kWh)</label>
          <input
            name="kwh"
            type="number"
            step="0.01"
            value={formData.kwh || ''}
            onChange={handleChange}
            placeholder="0.0"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-700 ml-1 uppercase tracking-wider">Cost (RM)</label>
          <input
            name="cost_rm"
            type="number"
            step="0.01"
            value={formData.cost_rm || ''}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-700 ml-1 uppercase tracking-wider">Odometer (km)</label>
          <input
            name="odometer_km"
            type="number"
            step="1"
            value={formData.odometer_km || ''}
            onChange={handleChange}
            placeholder="0"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="chargely-session-submit w-full bg-blue-600 text-white py-2.5 rounded-xl font-black text-sm hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-200"
        >
          {isSubmitting ? 'Logging...' : 'Log Session'}
        </button>
      </div>
    </form>
  );
}
