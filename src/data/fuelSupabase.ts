import { supabase } from '@/lib/supabase';
import { VehicleType } from './maintenanceItems';

export async function saveFuelKmDB(userId: string, vehicle: VehicleType, km: number, data: string) {
  await supabase.from('fuel_records_km').upsert({
    user_id: userId,
    vehicle_type: vehicle,
    km_final: km,
    data: data,
  });
}

export async function getLatestFuelKmDB(userId: string, vehicle: VehicleType): Promise<number> {
  const { data, error } = await supabase
    .from('fuel_records_km')
    .select('km_final')
    .eq('user_id', userId)
    .eq('vehicle_type', vehicle)
    .order('data', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return 0;
  return data.km_final ?? 0;
}

export async function getAllFuelRecordsDB(userId: string, vehicle: VehicleType) {
  const { data } = await supabase
    .from('fuel_records_km')
    .select('*')
    .eq('user_id', userId)
    .eq('vehicle_type', vehicle)
    .order('data', { ascending: false });

  return data || [];
}
