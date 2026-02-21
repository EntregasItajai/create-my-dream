import { VehicleType } from './maintenanceItems';
import { Settings } from '@/pages/Index';

export interface KmRecord {
  id: string;
  data: string; // ISO date string YYYY-MM-DD
  kmInicial?: number;
  kmFinal?: number;
  kmRodado: number;
  custoEstimado: number;
}

const STORAGE_KEYS: Record<VehicleType, string> = {
  moto: 'entregasItajai_controleKm_moto',
  carro: 'entregasItajai_controleKm_carro',
};

export function loadKmRecords(vehicle: VehicleType): KmRecord[] {
  const stored = localStorage.getItem(STORAGE_KEYS[vehicle]);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

function saveAllRecords(records: KmRecord[], vehicle: VehicleType) {
  localStorage.setItem(STORAGE_KEYS[vehicle], JSON.stringify(records));
}

export function saveKmRecord(record: KmRecord, vehicle: VehicleType) {
  const records = loadKmRecords(vehicle);
  records.push(record);
  saveAllRecords(records, vehicle);
}

export function deleteKmRecord(id: string, vehicle: VehicleType) {
  const records = loadKmRecords(vehicle).filter(r => r.id !== id);
  saveAllRecords(records, vehicle);
}

export function calcularCustoEstimado(km: number, settings: Settings): number {
  const consumo = settings.consumoMoto > 0 ? settings.consumoMoto : 1;
  const custoCombustivel = (km / consumo) * (settings.precoGasolina || 0);
  const custoManutencao = km * (settings.manutencao || 0);
  const custoDepreciacao = km * (settings.depreciacao || 0);
  return custoCombustivel + custoManutencao + custoDepreciacao;
}

export function getRecordsForMonth(records: KmRecord[], year: number, month: number): KmRecord[] {
  return records
    .filter(r => {
      const d = new Date(r.data + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => a.data.localeCompare(b.data));
}
