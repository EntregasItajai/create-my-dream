import { supabase } from '@/lib/supabase';
import { VehicleType } from './maintenanceItems';
import {
  Troca,
  ItemPadrao,
  ITENS_PADRAO,
  ItemStatus,
  calcularStatusItem,
} from './maintenanceMonitor';

// ─── KM Atual ───────────────────────────────────────────────

export async function loadKmAtualDB(userId: string): Promise<number> {
  const { data } = await supabase
    .from('km_atual_usuario')
    .select('km_atual')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.km_atual ?? 0;
}

export async function saveKmAtualDB(userId: string, km: number) {
  await supabase
    .from('km_atual_usuario')
    .upsert({ user_id: userId, km_atual: km, updated_at: new Date().toISOString() });
}

// ─── Itens Padrão ───────────────────────────────────────────

export async function loadItensPadraoDB(userId: string, vehicle: VehicleType): Promise<ItemPadrao[]> {
  const { data } = await supabase
    .from('itens_padrao_usuario')
    .select('nome, km_intervalo')
    .eq('user_id', userId)
    .eq('vehicle_type', vehicle)
    .order('ordem', { ascending: true });

  if (data && data.length > 0) {
    return data.map(d => ({ nome: d.nome, kmIntervalo: d.km_intervalo }));
  }
  return [...ITENS_PADRAO[vehicle]];
}

export async function saveItensPadraoDB(userId: string, itens: ItemPadrao[], vehicle: VehicleType) {
  // Delete existing
  await supabase
    .from('itens_padrao_usuario')
    .delete()
    .eq('user_id', userId)
    .eq('vehicle_type', vehicle);

  // Insert new
  if (itens.length > 0) {
    const rows = itens.map((item, i) => ({
      user_id: userId,
      vehicle_type: vehicle,
      nome: item.nome,
      km_intervalo: item.kmIntervalo,
      ordem: i,
    }));
    await supabase.from('itens_padrao_usuario').insert(rows);
  }
}

export async function resetItensPadraoDB(userId: string, vehicle: VehicleType) {
  await supabase
    .from('itens_padrao_usuario')
    .delete()
    .eq('user_id', userId)
    .eq('vehicle_type', vehicle);
}

// ─── Trocas ─────────────────────────────────────────────────

export async function loadTrocasDB(userId: string, vehicle: VehicleType): Promise<Troca[]> {
  const { data } = await supabase
    .from('trocas_manutencao')
    .select('*')
    .eq('user_id', userId)
    .eq('vehicle_type', vehicle)
    .order('created_at', { ascending: false });

  if (!data) return [];

  return data.map(d => ({
    id: d.id,
    data: d.data,
    kmTroca: d.km_troca,
    item: d.item,
    kmIntervalo: d.km_intervalo,
    kmProxima: d.km_proxima,
    marca: d.marca ?? undefined,
    valor: d.valor != null ? Number(d.valor) : undefined,
    obs: d.obs ?? undefined,
  }));
}

export async function registrarTrocaDB(
  userId: string,
  troca: Omit<Troca, 'id' | 'kmProxima'>,
  vehicle: VehicleType
): Promise<Troca> {
  const kmProxima = troca.kmIntervalo > 0 ? troca.kmTroca + troca.kmIntervalo : null;

  const { data, error } = await supabase
    .from('trocas_manutencao')
    .insert({
      user_id: userId,
      vehicle_type: vehicle,
      data: troca.data,
      km_troca: troca.kmTroca,
      item: troca.item,
      km_intervalo: troca.kmIntervalo,
      km_proxima: kmProxima,
      marca: troca.marca || null,
      valor: troca.valor ?? null,
      obs: troca.obs || null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    data: data.data,
    kmTroca: data.km_troca,
    item: data.item,
    kmIntervalo: data.km_intervalo,
    kmProxima: data.km_proxima,
    marca: data.marca ?? undefined,
    valor: data.valor != null ? Number(data.valor) : undefined,
    obs: data.obs ?? undefined,
  };
}

export async function deleteTrocaDB(id: string) {
  await supabase.from('trocas_manutencao').delete().eq('id', id);
}

// ─── Status (reusa lógica pura) ─────────────────────────────

export function calcularStatusTodosFromData(
  itensPadrao: ItemPadrao[],
  trocas: Troca[],
  kmAtual: number
) {
  const todos: ItemStatus[] = itensPadrao.map(ip =>
    calcularStatusItem(ip.nome, ip.kmIntervalo, trocas, kmAtual)
  );

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
