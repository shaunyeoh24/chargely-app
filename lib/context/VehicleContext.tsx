'use client';

import { createContext, useContext, useState, useEffect } from 'react';

import { Vehicle } from '../types/vehicle';

interface VehicleContextType {
  activeVehicleId: string | null;
  setActiveVehicleId: (id: string | null) => void;
  vehicles: Vehicle[];
  isLoading: boolean;
  refreshVehicles: () => Promise<void>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVehicles = async () => {
    const { vehiclesService } = await import('@/lib/services/vehiclesService');
    try {
      const data = await vehiclesService.listVehicles();
      setVehicles(data);
      
      const saved = localStorage.getItem('activeVehicleId');
      if (saved && data.some(v => v.id === saved)) {
        setActiveVehicleId(saved);
      } else if (data.length > 0) {
        setActiveVehicleId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSetActiveVehicleId = (id: string | null) => {
    setActiveVehicleId(id);
    if (id) {
      localStorage.setItem('activeVehicleId', id);
    } else {
      localStorage.removeItem('activeVehicleId');
    }
  };

  return (
    <VehicleContext.Provider value={{ 
      activeVehicleId, 
      setActiveVehicleId: handleSetActiveVehicleId,
      vehicles,
      isLoading,
      refreshVehicles: fetchVehicles
    }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
}
