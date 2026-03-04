'use client';

import { useState, useEffect } from 'react';
import { Vehicle, CreateVehicleInput } from '@/lib/types/vehicle';
import { vehicleValidation } from '@/lib/logic/vehicleValidation';
import { vehiclesService } from '@/lib/services/vehiclesService';
import { Car, X, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EditVehicleModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onVehicleUpdated: () => void;
}

export default function EditVehicleModal({ vehicle, onClose, onVehicleUpdated }: EditVehicleModalProps) {
  const [formData, setFormData] = useState<Partial<CreateVehicleInput>>({
    name: vehicle.name,
    make: vehicle.make || undefined,
    model: vehicle.model || undefined,
    year: vehicle.year || undefined,
    battery_capacity_kwh: vehicle.battery_capacity_kwh || undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const validation = vehicleValidation.validateCreate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const sanitized = vehicleValidation.sanitizeCreate(formData as CreateVehicleInput);
      await vehiclesService.updateVehicle(vehicle.id, sanitized);
      onVehicleUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      setErrors({ form: 'Failed to update vehicle. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const inputClasses =
    'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-medium';
  const labelClasses = 'text-[11px] font-black text-slate-700 ml-1 uppercase tracking-wider';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shadow-inner">
                <Car className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Edit Vehicle</h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelClasses}>Vehicle Name *</label>
              <input
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="e.g. My Model 3"
                className={cn(inputClasses, errors.name && 'border-red-300 focus:ring-red-500/10 focus:border-red-500')}
              />
              {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClasses}>Make</label>
                <input
                  name="make"
                  value={formData.make || ''}
                  onChange={handleChange}
                  placeholder="e.g. Tesla"
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>Model</label>
                <input
                  name="model"
                  value={formData.model || ''}
                  onChange={handleChange}
                  placeholder="e.g. Model 3"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClasses}>Year</label>
                <input
                  name="year"
                  type="number"
                  value={formData.year || ''}
                  onChange={handleChange}
                  placeholder="2024"
                  className={cn(inputClasses, errors.year && 'border-red-300 focus:ring-red-500/10 focus:border-red-500')}
                />
                {errors.year && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.year}</p>}
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>Battery (kWh)</label>
                <input
                  name="battery_capacity_kwh"
                  type="number"
                  step="0.1"
                  value={formData.battery_capacity_kwh || ''}
                  onChange={handleChange}
                  placeholder="75"
                  className={cn(
                    inputClasses,
                    errors.battery_capacity_kwh && 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                  )}
                />
                {errors.battery_capacity_kwh && (
                  <p className="text-[10px] font-bold text-red-500 ml-1">{errors.battery_capacity_kwh}</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-black text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-teal-600 text-white py-3 rounded-xl font-black hover:bg-teal-700 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
