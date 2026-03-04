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
      await sessionsService.createSession(formData as CreateSessionInput);
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
    <form onSubmit={handleSubmit} className="chargely-session-form bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8">
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shadow-inner">
          <Zap className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Log Session</h3>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Date</label>
          <input
            name="date"
            type="date"
            value={formData.date || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Energy (kWh)</label>
            <div className="relative group">
              <input
                name="kwh"
                type="number"
                step="0.01"
                value={formData.kwh || ''}
                onChange={handleChange}
                placeholder="0.0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-500 transition-colors">kWh</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Cost (RM)</label>
            <div className="relative group">
              <input
                name="cost_rm"
                type="number"
                step="0.01"
                value={formData.cost_rm || ''}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors">RM</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Odometer (km)</label>
            <div className="relative group">
              <input
                name="odometer_km"
                type="number"
                step="1"
                value={formData.odometer_km || ''}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-500 transition-colors">km</div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="chargely-session-submit w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Logging...' : 'Log Session'}
      </button>
    </form>
  );
}
