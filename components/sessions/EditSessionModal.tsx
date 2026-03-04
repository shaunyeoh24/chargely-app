'use client';

import { useState, useEffect } from 'react';
import { ChargingSession, UpdateSessionInput } from '@/lib/types/session';
import { sessionsService } from '@/lib/services/sessionsService';
import { Zap, X, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EditSessionModalProps {
  session: ChargingSession;
  onClose: () => void;
  onSessionUpdated: () => void;
}

export default function EditSessionModal({ session, onClose, onSessionUpdated }: EditSessionModalProps) {
  const [formData, setFormData] = useState<UpdateSessionInput>({
    date: session.date,
    kwh: session.kwh,
    cost_rm: session.cost_rm,
    odometer_km: session.odometer_km,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
      await sessionsService.updateSession(session.id, formData);
      onSessionUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update session:', err);
      setError('Failed to update session. Please try again.');
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

  const labelClasses = "text-sm font-black text-slate-700 ml-1 uppercase tracking-wider";
  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Edit Session</h3>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1.5">Update history record</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className={labelClasses}>Date</label>
              <input
                name="date"
                type="date"
                value={formData.date || ''}
                onChange={handleChange}
                className={cn(inputClasses, "font-medium")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>Energy (kWh)</label>
                <div className="relative group">
                  <input
                    name="kwh"
                    type="number"
                    step="0.01"
                    value={formData.kwh || ''}
                    onChange={handleChange}
                    placeholder="0.0"
                    className={inputClasses}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-500 transition-colors">kWh</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClasses}>Cost (RM)</label>
                <div className="relative group">
                  <input
                    name="cost_rm"
                    type="number"
                    step="0.01"
                    value={formData.cost_rm || ''}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={cn(inputClasses, "pl-12")}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors">RM</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Odometer (km)</label>
              <div className="relative group">
                <input
                  name="odometer_km"
                  type="number"
                  step="1"
                  value={formData.odometer_km || ''}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputClasses}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-500 transition-colors">km</div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-lg text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Session'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
