import { Vehicle } from '../types/vehicle';

export const vehicleSelection = {
  /**
   * Resolves the active vehicle ID based on current selection and available vehicles.
   * 1. If currentId is valid (exists in vehicles), keep it.
   * 2. If currentId is invalid but vehicles exist, default to the first vehicle.
   * 3. If no vehicles exist, return null.
   */
  resolveActiveVehicleId(currentId: string | null, vehicles: Vehicle[]): string | null {
    if (vehicles.length === 0) return null;
    
    const isValid = vehicles.some(v => v.id === currentId);
    if (isValid && currentId) return currentId;
    
    return vehicles[0].id;
  }
};
