import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { VehicleType } from '@/data/maintenanceItems';
import { getLatestFuelKmDB } from '@/data/fuelSupabase';
import {
  calcularStatusTodosFromData,
  loadItensPadraoDB,
  loadKmAtualDB,
  loadTrocasDB,
} from '@/data/maintenanceMonitorSupabase';

export type MaintenanceStatusType = 'ok' | 'proximo' | 'vencido';

export const useMaintenanceStatus = (vehicleType: VehicleType, enabled: boolean) => {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<MaintenanceStatusType>('ok');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || authLoading || !user) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const [fuelKm, maintenanceKm, itensPadrao, trocas] = await Promise.all([
          getLatestFuelKmDB(user.id, vehicleType),
          loadKmAtualDB(user.id),
          loadItensPadraoDB(user.id, vehicleType),
          loadTrocasDB(user.id, vehicleType),
        ]);
        const km = Math.max(fuelKm, maintenanceKm);
        if (km <= 0) {
          setStatus('ok');
          setLoading(false);
          return;
        }

        const statusData = calcularStatusTodosFromData(itensPadrao, trocas, km);

        if (statusData.vencidos.length > 0) {
          setStatus('vencido');
        } else if (statusData.proximos.length > 0) {
          setStatus('proximo');
        } else {
          setStatus('ok');
        }
      } catch (error) {
        console.error('Erro ao calcular status de manutenção:', error);
        setStatus('ok');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user, vehicleType, enabled, authLoading]);

  return { status, loading };
};
