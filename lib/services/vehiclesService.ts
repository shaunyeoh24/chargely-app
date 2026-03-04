import { supabase } from '../supabase/client';
import { Vehicle, CreateVehicleInput } from '../types/vehicle';

export const vehiclesService = {
  async listVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error('Failed to fetch vehicles');
    }

    return data || [];
  },

  async createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      throw new Error('Failed to create vehicle');
    }

    return data;
  },

  async deleteVehicle(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle');
    }
  }
};
