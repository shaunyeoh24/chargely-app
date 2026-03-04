export interface Vehicle {
  id: string;
  name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  battery_capacity_kwh: number | null;
  created_at: string;
}

export interface CreateVehicleInput {
  name: string;
  make?: string;
  model?: string;
  year?: number;
  battery_capacity_kwh?: number;
}

export interface UpdateVehicleInput {
  name: string;
  make?: string;
  model?: string;
  year?: number;
  battery_capacity_kwh?: number;
}
