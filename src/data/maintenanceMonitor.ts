import { VehicleType } from './maintenanceItems';

export interface ItemPadrao {
  nome: string;
  kmIntervalo: number;
}

export const ITENS_PADRAO: Record<VehicleType, ItemPadrao[]> = {
  moto: [
    { nome: 'Óleo motor', kmIntervalo: 4000 },
    { nome: 'Filtro óleo', kmIntervalo: 4000 },
    { nome: 'Filtro ar', kmIntervalo: 15000 },
    { nome: 'Filtro combustível', kmIntervalo: 20000 },
    { nome: 'Vela', kmIntervalo: 15000 },
    { nome: 'Kit relação', kmIntervalo: 20000 },
    { nome: 'Pneu dianteiro', kmIntervalo: 18000 },
    { nome: 'Pneu traseiro', kmIntervalo: 18000 },
    { nome: 'Pastilha dianteira', kmIntervalo: 15000 },
    { nome: 'Lona traseira', kmIntervalo: 20000 },
    { nome: 'Fluido freio', kmIntervalo: 24000 },
    { nome: 'Buchas balança', kmIntervalo: 30000 },
    { nome: 'Rolamentos', kmIntervalo: 40000 },
    { nome: 'Revisão', kmIntervalo: 5000 },
  ],
  carro: [
    { nome: 'Óleo motor (4L)', kmIntervalo: 10000 },
    { nome: 'Filtro óleo', kmIntervalo: 10000 },
    { nome: 'Filtro ar', kmIntervalo: 20000 },
    { nome: 'Filtro combustível', kmIntervalo: 30000 },
    { nome: 'Velas (4)', kmIntervalo: 30000 },
    { nome: 'Correia dentada', kmIntervalo: 60000 },
    { nome: 'Pneu dianteiro', kmIntervalo: 35000 },
    { nome: 'Pneu traseiro', kmIntervalo: 35000 },
    { nome: 'Pastilha dianteira', kmIntervalo: 25000 },
    { nome: 'Pastilha traseira', kmIntervalo: 30000 },
    { nome: 'Fluido freio', kmIntervalo: 30000 },
    { nome: 'Amortecedores dianteiros', kmIntervalo: 50000 },
    { nome: 'Alinhamento', kmIntervalo: 10000 },
    { nome: 'Revisão', kmIntervalo: 10000 },
  ],
};

export interface Troca {
  id: string;
  data: string; // yyyy-MM-dd
  kmTroca: number;
  item: string;
  kmIntervalo: number; // 0 = livre
  kmProxima: number | null; // kmTroca + kmIntervalo or null if livre
  marca?: string;
  valor?: number;
  obs?: string;
}

export type StatusTroca = 'vencido' | 'proximo' | 'ok' | 'livre';

export interface ItemStatus {
  item: string;
  status: StatusTroca;
  ultimaTroca?: Troca;
  kmProxima: number | null;
  kmFaltam?: number;
}

const STORAGE_KEYS: Record<VehicleType, string> = {
  moto: 'entregasItajai_trocas_moto',
  carro: 'entregasItajai_trocas_carro',
};

const KM_ATUAL_KEY = 'entregasItajai_kmAtual_ativo';

export function loadKmAtual(): number {
  const stored = localStorage.getItem(KM_ATUAL_KEY);
  if (stored) {
    const n = parseInt(stored, 10);
    if (!isNaN(n)) return n;
  }
  return 0;
}

export function saveKmAtual(km: number) {
  localStorage.setItem(KM_ATUAL_KEY, km.toString());
}

export function loadTrocas(vehicle: VehicleType): Troca[] {
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

export function saveTrocas(trocas: Troca[], vehicle: VehicleType) {
  localStorage.setItem(STORAGE_KEYS[vehicle], JSON.stringify(trocas));
}

export function registrarTroca(troca: Omit<Troca, 'id' | 'kmProxima'>, vehicle: VehicleType): Troca {
  const newTroca: Troca = {
    ...troca,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    kmProxima: troca.kmIntervalo > 0 ? troca.kmTroca + troca.kmIntervalo : null,
  };
  const trocas = loadTrocas(vehicle);
  trocas.unshift(newTroca);
  saveTrocas(trocas, vehicle);
  return newTroca;
}

export function deleteTroca(id: string, vehicle: VehicleType) {
  const trocas = loadTrocas(vehicle).filter(t => t.id !== id);
  saveTrocas(trocas, vehicle);
}

export function calcularStatusItem(itemNome: string, kmIntervalo: number, trocas: Troca[], kmAtual: number): ItemStatus {
  // Find latest swap for this item
  const trocasItem = trocas
    .filter(t => t.item === itemNome)
    .sort((a, b) => b.kmTroca - a.kmTroca);

  const ultima = trocasItem[0];

  if (!ultima) {
    // Never replaced - consider overdue if has interval
    if (kmIntervalo === 0) {
      return { item: itemNome, status: 'livre', kmProxima: null };
    }
    return { item: itemNome, status: 'vencido', kmProxima: null, kmFaltam: 0 };
  }

  if (kmIntervalo === 0 || ultima.kmProxima == null) {
    return { item: itemNome, status: 'livre', ultimaTroca: ultima, kmProxima: null };
  }

  const kmFaltam = ultima.kmProxima - kmAtual;

  let status: StatusTroca;
  if (kmAtual >= ultima.kmProxima) {
    status = 'vencido';
  } else if (kmFaltam <= 1000) {
    status = 'proximo';
  } else {
    status = 'ok';
  }

  return { item: itemNome, status, ultimaTroca: ultima, kmProxima: ultima.kmProxima, kmFaltam };
}

export function calcularStatusTodos(vehicle: VehicleType, kmAtual: number): {
  todos: ItemStatus[];
  vencidos: ItemStatus[];
  proximos: ItemStatus[];
  ok: ItemStatus[];
  livres: ItemStatus[];
} {
  const trocas = loadTrocas(vehicle);
  const itensPadrao = ITENS_PADRAO[vehicle];

  // Get standard items status
  const todos: ItemStatus[] = itensPadrao.map(ip =>
    calcularStatusItem(ip.nome, ip.kmIntervalo, trocas, kmAtual)
  );

  // Add free items that are not in standard list
  const nomesStd = new Set(itensPadrao.map(i => i.nome));
  const livresExtras = trocas
    .filter(t => !nomesStd.has(t.item))
    .reduce((acc, t) => {
      if (!acc.has(t.item)) {
        acc.set(t.item, calcularStatusItem(t.item, 0, trocas, kmAtual));
      }
      return acc;
    }, new Map<string, ItemStatus>());

  todos.push(...livresExtras.values());

  return {
    todos,
    vencidos: todos.filter(i => i.status === 'vencido'),
    proximos: todos.filter(i => i.status === 'proximo'),
    ok: todos.filter(i => i.status === 'ok'),
    livres: todos.filter(i => i.status === 'livre'),
  };
}
