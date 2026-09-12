import { supabase } from '@/lib/supabase';
import { VehicleType } from './maintenanceItems';

export interface FuelRecord {
  id: string;
  data: string;
  kmInicial: number;
  kmFinal: number;
  litros: number;
  rendimento: number;
}

export const FUEL_STORAGE_KEYS: Record<VehicleType, string> = {
  moto: 'entregasItajai_fuel_moto',
  carro: 'entregasItajai_fuel_carro',
};

const FUEL_MIGRACAO_KEYS: Record<VehicleType, string> = {
  moto: 'entregasItajai_fuelMigradoDB_moto',
  carro: 'entregasItajai_fuelMigradoDB_carro',
};

interface FuelRow {
  id: string;
  data: string;
  km_inicial: number | null;
  km_final: number | null;
  litros: number | null;
  rendimento: number | null;
}

const toRecord = (r: FuelRow): FuelRecord => ({
  id: r.id,
  data: r.data,
  kmInicial: Number(r.km_inicial ?? 0),
  kmFinal: Number(r.km_final ?? 0),
  litros: Number(r.litros ?? 0),
  rendimento: Number(r.rendimento ?? 0),
});

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

export async function loadFuelRecordsDB(
  userId: string,
  vehicle: VehicleType
): Promise<FuelRecord[]> {
  const { data, error } = await supabase
    .from('fuel_records_km')
    .select('id, data, km_inicial, km_final, litros, rendimento')
    .eq('user_id', userId)
    .eq('vehicle_type', vehicle)
    .order('data', { ascending: false });

  if (error || !data) return [];
  return (data as FuelRow[]).map(toRecord);
}

export async function saveFuelRecordDB(
  userId: string,
  vehicle: VehicleType,
  rec: Omit<FuelRecord, 'id'>
): Promise<FuelRecord> {
  const { data, error } = await supabase
    .from('fuel_records_km')
    .insert({
      user_id: userId,
      vehicle_type: vehicle,
      data: rec.data,
      km_inicial: rec.kmInicial,
      km_final: rec.kmFinal,
      litros: rec.litros,
      rendimento: rec.rendimento,
    })
    .select('id, data, km_inicial, km_final, litros, rendimento')
    .single();

  if (error) throw error;
  return toRecord(data as FuelRow);
}

export async function deleteFuelRecordDB(id: string) {
  const { error } = await supabase.from('fuel_records_km').delete().eq('id', id);
  if (error) throw error;
}

// Abastecimentos lançados antes de o app usar o banco ficaram só no aparelho.
// Sobe o que existe localmente uma única vez, sem apagar a cópia local.
export async function migrarFuelLocaisParaDB(
  userId: string,
  vehicle: VehicleType
): Promise<number> {
  if (localStorage.getItem(FUEL_MIGRACAO_KEYS[vehicle])) return 0;

  const concluir = () =>
    localStorage.setItem(FUEL_MIGRACAO_KEYS[vehicle], new Date().toISOString());

  let locais: FuelRecord[] = [];
  try {
    const bruto = JSON.parse(localStorage.getItem(FUEL_STORAGE_KEYS[vehicle]) || '[]');
    if (Array.isArray(bruto)) locais = bruto;
  } catch {
    locais = [];
  }

  const validos = locais.filter(
    (r) => r && Number.isFinite(r.kmFinal) && r.kmFinal > 0 && typeof r.data === 'string'
  );
  if (validos.length === 0) {
    concluir();
    return 0;
  }

  const existentes = await loadFuelRecordsDB(userId, vehicle);
  const jaTem = new Set(existentes.map((r) => `${r.data}|${r.kmFinal}`));
  const novos = validos.filter((r) => !jaTem.has(`${r.data}|${r.kmFinal}`));

  if (novos.length > 0) {
    const { error } = await supabase.from('fuel_records_km').insert(
      novos.map((r) => ({
        user_id: userId,
        vehicle_type: vehicle,
        data: r.data,
        km_inicial: Number.isFinite(r.kmInicial) ? r.kmInicial : null,
        km_final: r.kmFinal,
        litros: Number.isFinite(r.litros) ? r.litros : null,
        rendimento: Number.isFinite(r.rendimento) ? r.rendimento : null,
      }))
    );
    if (error) throw error;
  }

  concluir();
  return novos.length;
}
