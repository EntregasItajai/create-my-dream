import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Fuel, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VehicleType } from '@/data/maintenanceItems';
import { toast } from '@/hooks/use-toast';

export interface FuelRecord {
  id: string;
  data: string; // YYYY-MM-DD
  kmInicial: number;
  kmFinal: number;
  litros: number;
  rendimento: number; // km/L
}

const STORAGE_KEYS: Record<VehicleType, string> = {
  moto: 'entregasItajai_fuel_moto',
  carro: 'entregasItajai_fuel_carro',
};

const LAST_KM_KEYS: Record<VehicleType, string> = {
  moto: 'entregasItajai_fuelLastKm_moto',
  carro: 'entregasItajai_fuelLastKm_carro',
};

function loadRecords(vehicle: VehicleType): FuelRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS[vehicle]) || '[]');
  } catch { return []; }
}

function saveRecords(records: FuelRecord[], vehicle: VehicleType) {
  localStorage.setItem(STORAGE_KEYS[vehicle], JSON.stringify(records));
}

function loadLastKm(vehicle: VehicleType): string {
  return localStorage.getItem(LAST_KM_KEYS[vehicle]) || '';
}

function saveLastKm(km: string, vehicle: VehicleType) {
  localStorage.setItem(LAST_KM_KEYS[vehicle], km);
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface FuelConsumptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleType: VehicleType;
}

export const FuelConsumptionDialog = ({ isOpen, onClose, vehicleType }: FuelConsumptionDialogProps) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');
  const [litros, setLitros] = useState('');

  const formatKm = (v: number) => v.toLocaleString('pt-BR');
  const formatInputDisplay = (raw: string): string => {
    const num = raw.replace(/\D/g, '');
    if (!num) return '';
    return parseInt(num, 10).toLocaleString('pt-BR');
  };
  const handleKmInput = (value: string, setter: (v: string) => void, persist?: boolean) => {
    const clean = value.replace(/\D/g, '');
    setter(clean);
    if (persist) saveLastKm(clean, vehicleType);
  };

  // Litros input: allow decimals (e.g. 8.46)
  const handleLitrosInput = (value: string) => {
    // Allow digits and one dot or comma
    const cleaned = value.replace(',', '.').replace(/[^0-9.]/g, '');
    // Prevent multiple dots
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    setLitros(cleaned);
  };

  // Auto-calc rendimento
  const rendimento = useMemo(() => {
    const ini = parseInt(kmInicial, 10);
    const fim = parseInt(kmFinal, 10);
    const lit = parseFloat(litros);
    if (!isNaN(ini) && !isNaN(fim) && !isNaN(lit) && fim > ini && lit > 0) {
      return (fim - ini) / lit;
    }
    return null;
  }, [kmInicial, kmFinal, litros]);

  useEffect(() => {
    if (isOpen) {
      setRecords(loadRecords(vehicleType));
      const lastKm = loadLastKm(vehicleType);
      if (lastKm) setKmInicial(lastKm);
    }
  }, [isOpen, vehicleType]);

  const monthRecords = useMemo(() => {
    return records
      .filter(r => {
        const d = new Date(r.data + 'T00:00:00');
        return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
      })
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [records, viewYear, viewMonth]);

  const avgRendimento = useMemo(() => {
    if (monthRecords.length === 0) return null;
    const total = monthRecords.reduce((s, r) => s + r.rendimento, 0);
    return total / monthRecords.length;
  }, [monthRecords]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleSave = () => {
    const ini = parseInt(kmInicial, 10);
    const fim = parseInt(kmFinal, 10);
    const lit = parseFloat(litros);

    if (isNaN(ini) || ini <= 0) {
      toast({ title: 'Erro', description: 'Preencha o KM Inicial.', variant: 'destructive' });
      return;
    }
    if (isNaN(fim) || fim <= ini) {
      toast({ title: 'Erro', description: 'KM Final deve ser maior que o Inicial.', variant: 'destructive' });
      return;
    }
    if (isNaN(lit) || lit <= 0) {
      toast({ title: 'Erro', description: 'Preencha os litros abastecidos.', variant: 'destructive' });
      return;
    }

    const rend = (fim - ini) / lit;
    const record: FuelRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      data: format(new Date(), 'yyyy-MM-dd'),
      kmInicial: ini,
      kmFinal: fim,
      litros: lit,
      rendimento: parseFloat(rend.toFixed(2)),
    };

    const updated = [...records, record];
    saveRecords(updated, vehicleType);
    setRecords(updated);

    // KM Final becomes next KM Inicial
    saveLastKm(kmFinal, vehicleType);
    setKmInicial(kmFinal);
    setKmFinal('');
    setLitros('');
    setShowForm(false);

    toast({ title: '⛽ Registrado!', description: `Rendimento: ${rend.toFixed(2)} km/L` });
  };

  const handleDelete = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    saveRecords(updated, vehicleType);
    setRecords(updated);
    toast({ title: 'Removido', description: 'Registro excluído.' });
  };

  const resetForm = () => {
    setShowForm(false);
    setKmFinal('');
    setLitros('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetForm(); } }}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            ⛽ Rendimento — {vehicleType === 'moto' ? '🏍️ Moto' : '🚗 Carro'}
          </DialogTitle>
          <DialogDescription className="sr-only">Controle de consumo de combustível</DialogDescription>
        </DialogHeader>

        {/* Month navigation */}
        <div className="flex items-center justify-between px-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Records list */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {monthRecords.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              Nenhum registro neste mês.
            </p>
          ) : (
            <div className="space-y-2 px-1">
              {monthRecords.map((r) => {
                const d = new Date(r.data + 'T00:00:00');
                return (
                  <div key={r.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">
                        {format(d, 'dd/MM', { locale: ptBR })}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {formatKm(r.kmInicial)} → {formatKm(r.kmFinal)} · {r.litros.toFixed(2)}L
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary text-base">{r.rendimento.toFixed(2)} km/L</div>
                      <div className="text-xs text-muted-foreground">{formatKm(r.kmFinal - r.kmInicial)} km</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Average */}
        <div className="flex justify-between bg-muted rounded-lg p-3 text-sm font-semibold">
          <span className="text-muted-foreground">Média do mês:</span>
          <span className="text-foreground">
            {avgRendimento != null ? `${avgRendimento.toFixed(2)} km/L` : '—'}
          </span>
        </div>

        {/* Add form */}
        {showForm ? (
          <div className="space-y-3 border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground font-medium uppercase block mb-1">KM Inicial</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatInputDisplay(kmInicial)}
                  onChange={(e) => handleKmInput(e.target.value, setKmInicial)}
                  className="w-full bg-input border border-border text-foreground text-center text-sm font-bold rounded-lg py-2 px-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-medium uppercase block mb-1">KM Final</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatInputDisplay(kmFinal)}
                  onChange={(e) => handleKmInput(e.target.value, setKmFinal)}
                  className="w-full bg-input border border-border text-foreground text-center text-sm font-bold rounded-lg py-2 px-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-primary font-bold uppercase block mb-1">Litros</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={litros}
                  onChange={(e) => handleLitrosInput(e.target.value)}
                  className="w-full bg-input border border-border text-foreground text-center text-sm font-bold rounded-lg py-2 px-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] text-primary font-bold uppercase block mb-1">Rendimento</label>
                <div className="w-full bg-muted border border-border text-center text-sm font-bold rounded-lg py-2 px-2 text-primary">
                  {rendimento != null ? `${rendimento.toFixed(2)} km/L` : '— km/L'}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={resetForm}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowForm(true)} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Novo Abastecimento
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
