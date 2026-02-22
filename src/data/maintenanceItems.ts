export type VehicleType = 'moto' | 'carro';

export interface ItemManutencao {
  nome: string;
  valorItem: number;
  kmTroca: number;
}

export const ITENS_DEFAULTS_MOTO: ItemManutencao[] = [
  { nome: "Óleo motor sintético (1L)", valorItem: 115.00, kmTroca: 4000 },
  { nome: "Filtro óleo", valorItem: 40.00, kmTroca: 4000 },
  { nome: "Filtro ar", valorItem: 80.00, kmTroca: 15000 },
  { nome: "Filtro combustível", valorItem: 70.00, kmTroca: 20000 },
  { nome: "Vela ignição", valorItem: 60.00, kmTroca: 15000 },
  { nome: "Kit relação (Yamaha)", valorItem: 400.00, kmTroca: 20000 },
  { nome: "Pneu dianteiro 80/100-18", valorItem: 260.00, kmTroca: 18000 },
  { nome: "Pneu traseiro 100/90-18", valorItem: 320.00, kmTroca: 18000 },
  { nome: "Pastilha freio dianteira", valorItem: 120.00, kmTroca: 15000 },
  { nome: "Lona freio traseira", valorItem: 140.00, kmTroca: 20000 },
  { nome: "Fluido freio", valorItem: 80.00, kmTroca: 24000 },
  { nome: "Buchas balança + MO", valorItem: 200.00, kmTroca: 30000 },
  { nome: "Rolamentos roda (par)", valorItem: 220.00, kmTroca: 40000 },
  { nome: "Revisão preventiva", valorItem: 400.00, kmTroca: 5000 },
];

export const ITENS_DEFAULTS_CARRO: ItemManutencao[] = [
  { nome: "Óleo motor sintético (4L)", valorItem: 200.00, kmTroca: 10000 },
  { nome: "Filtro óleo", valorItem: 50.00, kmTroca: 10000 },
  { nome: "Filtro ar", valorItem: 70.00, kmTroca: 20000 },
  { nome: "Filtro combustível", valorItem: 90.00, kmTroca: 30000 },
  { nome: "Velas ignição (jogo 4)", valorItem: 140.00, kmTroca: 30000 },
  { nome: "Correia dentada + tensor", valorItem: 550.00, kmTroca: 60000 },
  { nome: "Pneu dianteiro 185/65R15", valorItem: 380.00, kmTroca: 35000 },
  { nome: "Pneu traseiro 185/65R15", valorItem: 380.00, kmTroca: 35000 },
  { nome: "Pastilha freio dianteira", valorItem: 200.00, kmTroca: 25000 },
  { nome: "Pastilha freio traseira", valorItem: 180.00, kmTroca: 30000 },
  { nome: "Fluido freio", valorItem: 70.00, kmTroca: 30000 },
  { nome: "Amortecedores dianteiros (par)", valorItem: 650.00, kmTroca: 50000 },
  { nome: "Amortecedores traseiros (par)", valorItem: 480.00, kmTroca: 45000 },
  { nome: "Alinhamento + balanceamento", valorItem: 140.00, kmTroca: 10000 },
  { nome: "Revisão preventiva completa", valorItem: 650.00, kmTroca: 10000 },
];

export const ITENS_DEFAULTS: Record<VehicleType, ItemManutencao[]> = {
  moto: ITENS_DEFAULTS_MOTO,
  carro: ITENS_DEFAULTS_CARRO,
};

const STORAGE_KEYS: Record<VehicleType, string> = {
  moto: 'entregasItajai_itensManutencao_moto',
  carro: 'entregasItajai_itensManutencao_carro',
};

const VEHICLE_KEY = 'entregasItajai_veiculoAtivo';

export function loadVehicleType(): VehicleType {
  const stored = localStorage.getItem(VEHICLE_KEY);
  if (stored === 'carro') return 'carro';
  return 'moto';
}

export function saveVehicleType(type: VehicleType) {
  localStorage.setItem(VEHICLE_KEY, type);
}

export function loadMaintenanceItems(vehicle: VehicleType): ItemManutencao[] {
  const stored = localStorage.getItem(STORAGE_KEYS[vehicle]);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...ITENS_DEFAULTS[vehicle]];
    }
  }
  return [...ITENS_DEFAULTS[vehicle]];
}

export function saveMaintenanceItems(itens: ItemManutencao[], vehicle: VehicleType) {
  localStorage.setItem(STORAGE_KEYS[vehicle], JSON.stringify(itens));
}

export function resetMaintenanceItems(vehicle: VehicleType) {
  localStorage.removeItem(STORAGE_KEYS[vehicle]);
}

export function calcularCustoKm(item: ItemManutencao): number {
  if (item.kmTroca <= 0) return 0;
  return item.valorItem / item.kmTroca;
}

export function calcularManutencaoTotalKm(itens: ItemManutencao[]): number {
  return itens.reduce((total, item) => total + calcularCustoKm(item), 0);
}

// Migrate old localStorage keys to new format
(function migrateOldKeys() {
  const oldMaintenance = localStorage.getItem('entregasItajai_itensManutencao');
  if (oldMaintenance) {
    if (!localStorage.getItem(STORAGE_KEYS.moto)) {
      localStorage.setItem(STORAGE_KEYS.moto, oldMaintenance);
    }
    localStorage.removeItem('entregasItajai_itensManutencao');
  }
  const oldSettings = localStorage.getItem('freightSettings');
  if (oldSettings) {
    if (!localStorage.getItem('freightSettings_moto')) {
      localStorage.setItem('freightSettings_moto', oldSettings);
    }
    localStorage.removeItem('freightSettings');
  }
})();
