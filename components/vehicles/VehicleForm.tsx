'use client';

import { useState } from 'react';
import { CreateVehicleInput } from '@/lib/types/vehicle';
import { vehicleValidation } from '@/lib/logic/vehicleValidation';
import { vehiclesService } from '@/lib/services/vehiclesService';
import { PlusCircle, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VehicleFormProps {
  onVehicleCreated: () => void;
}

export default function VehicleForm({ onVehicleCreated }: VehicleFormProps) {
  const [formData, setFormData] = useState<Partial<CreateVehicleInput>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await vehiclesService.createVehicle(sanitized);
      setFormData({});
      onVehicleCreated();
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      setErrors({ form: 'Failed to create vehicle. Please try again.' });
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

  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium";
  const labelClasses = "text-[11px] font-black text-slate-700 ml-1 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shadow-inner">
          <PlusCircle className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Add Vehicle</h3>
      </div>
      
      {errors.form && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
          {errors.form}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className={labelClasses}>Vehicle Name *</label>
          <input
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="e.g. My Model 3"
            className={cn(inputClasses, errors.name && "border-red-300 focus:ring-red-500/10 focus:border-red-500")}
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
              className={cn(inputClasses, errors.year && "border-red-300 focus:ring-red-500/10 focus:border-red-500")}
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
              className={cn(inputClasses, errors.battery_capacity_kwh && "border-red-300 focus:ring-red-500/10 focus:border-red-500")}
            />
            {errors.battery_capacity_kwh && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.battery_capacity_kwh}</p>}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black text-base hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Vehicle'
        )}
      </button>
    </form>
  );
}
