export interface ItemManutencao {
  nome: string;
  valorItem: number;
  kmTroca: number;
}

export const ITENS_DEFAULTS: ItemManutencao[] = [
  { nome: "Óleo do motor sintético (1 L)", valorItem: 115.00, kmTroca: 4000 },
  { nome: "Filtro de óleo", valorItem: 40.00, kmTroca: 4000 },
  { nome: "Filtro de ar", valorItem: 80.00, kmTroca: 15000 },
  { nome: "Filtro de combustível", valorItem: 70.00, kmTroca: 20000 },
  { nome: "Vela de ignição", valorItem: 60.00, kmTroca: 15000 },
  { nome: "Kit relação completo", valorItem: 280.00, kmTroca: 20000 },
  { nome: "Pneu dianteiro 80/100-18", valorItem: 260.00, kmTroca: 18000 },
  { nome: "Pneu traseiro 100/90-18", valorItem: 320.00, kmTroca: 18000 },
  { nome: "Pastilha de freio dianteira", valorItem: 120.00, kmTroca: 15000 },
  { nome: "Lona de freio traseira", valorItem: 140.00, kmTroca: 20000 },
  { nome: "Fluido de freio dianteiro", valorItem: 80.00, kmTroca: 24000 },
  { nome: "Buchas de balança + mão de obra", valorItem: 200.00, kmTroca: 30000 },
  { nome: "Rolamentos de roda (par)", valorItem: 220.00, kmTroca: 40000 },
  { nome: "Revisão preventiva completa", valorItem: 400.00, kmTroca: 5000 },
];

const STORAGE_KEY = 'entregasItajai_itensManutencao';

export function loadMaintenanceItems(): ItemManutencao[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...ITENS_DEFAULTS];
    }
  }
  return [...ITENS_DEFAULTS];
}

export function saveMaintenanceItems(itens: ItemManutencao[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
}

export function resetMaintenanceItems() {
  localStorage.removeItem(STORAGE_KEY);
}

export function calcularCustoKm(item: ItemManutencao): number {
  if (item.kmTroca <= 0) return 0;
  return item.valorItem / item.kmTroca;
}

export function calcularManutencaoTotalKm(itens: ItemManutencao[]): number {
  return itens.reduce((total, item) => total + calcularCustoKm(item), 0);
}
