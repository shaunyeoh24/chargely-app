import { supabase } from '../supabase/client';
import { ChargingSession, CreateSessionInput, UpdateSessionInput } from '../types/session';

export const sessionsService = {
  async listSessions(vehicleId: string): Promise<ChargingSession[]> {
    const { data, error } = await supabase
      .from('charging_sessions')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch charging sessions');
    }

    return data || [];
  },

  async createSession(input: CreateSessionInput): Promise<ChargingSession> {
    const { data, error } = await supabase
      .from('charging_sessions')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create charging session');
    }

    return data;
  },

  async updateSession(id: string, input: UpdateSessionInput): Promise<ChargingSession> {
    const { data, error } = await supabase
      .from('charging_sessions')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update charging session');
    }

    return data;
  },

  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('charging_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete charging session');
    }
  },

  async deleteSessionsByVehicle(vehicleId: string): Promise<void> {
    const { error } = await supabase
      .from('charging_sessions')
      .delete()
      .eq('vehicle_id', vehicleId);

    if (error) {
      console.error('Error deleting sessions for vehicle:', error);
      throw new Error('Failed to delete charging sessions');
    }
  }
};
