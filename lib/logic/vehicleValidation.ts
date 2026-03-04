import { CreateVehicleInput } from '../types/vehicle';

export const vehicleValidation = {
  validateCreate(input: Partial<CreateVehicleInput>): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!input.name || input.name.trim() === '') {
      errors.name = 'Vehicle name is required';
    }

    if (input.year && (input.year < 1900 || input.year > new Date().getFullYear() + 1)) {
      errors.year = 'Please enter a valid year';
    }

    if (input.battery_capacity_kwh && input.battery_capacity_kwh <= 0) {
      errors.battery_capacity_kwh = 'Battery capacity must be positive';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  sanitizeCreate(input: CreateVehicleInput): CreateVehicleInput {
    return {
      name: input.name.trim(),
      make: input.make?.trim() || undefined,
      model: input.model?.trim() || undefined,
      year: input.year ? Number(input.year) : undefined,
      battery_capacity_kwh: input.battery_capacity_kwh ? Number(input.battery_capacity_kwh) : undefined,
    };
  }
};
