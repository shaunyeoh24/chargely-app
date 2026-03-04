export interface ChargingSession {
  id: string;
  vehicle_id: string;
  date: string;
  kwh: number;
  cost_rm: number;
  odometer_km: number;
  created_at: string;
}

export interface CreateSessionInput {
  vehicle_id: string;
  date: string;
  kwh: number;
  cost_rm: number;
  odometer_km: number;
}

export interface UpdateSessionInput {
  date?: string;
  kwh?: number;
  cost_rm?: number;
  odometer_km?: number;
}

export interface SessionWithCalculations extends ChargingSession {
  rm_per_kwh: number;
  wh_per_km: number | null;
  cost_per_100km: number | null;
  efficiency_status: 'calculated' | 'first_session' | 'odometer_not_increasing';
  efficiency_note: string | null;
}
