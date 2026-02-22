import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { VehicleType } from '@/data/maintenanceItems';
import { Settings } from '@/pages/Index';
import {
  KmRecord,
  loadKmRecords,
  saveKmRecord,
  deleteKmRecord,
  calcularCustoEstimado,
  getRecordsForMonth,
} from '@/data/kmControl';
import {
  saveKmAtual,
  calcularStatusTodos,
  ItemStatus,
} from '@/data/maintenanceMonitor';
import { toast } from '@/hooks/use-toast';

interface KmControlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleType: VehicleType;
  settings: Settings;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const KmControlDialog = ({ isOpen, onClose, vehicleType, settings }: KmControlDialogProps) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [records, setRecords] = useState<KmRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [maintenanceAlert, setMaintenanceAlert] = useState<{ vencidos: ItemStatus[]; proximos: ItemStatus[] } | null>(null);

  // Form state
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');
  const [kmRodado, setKmRodado] = useState('');

  const formatKm = (v: number) => v.toLocaleString('pt-BR');

  // Format number string with dot separators for display
  const formatInputDisplay = (raw: string): string => {
    const num = raw.replace(/\D/g, '');
    if (!num) return '';
    return parseInt(num, 10).toLocaleString('pt-BR');
  };

  const handleKmInput = (value: string, setter: (v: string) => void) => {
    // Strip non-digits, store raw number
    const raw = value.replace(/\D/g, '');
    setter(raw);
  };

  useEffect(() => {
    if (isOpen) {
      setRecords(loadKmRecords(vehicleType));
    }
  }, [isOpen, vehicleType]);

  // Auto-calc kmRodado
  useEffect(() => {
    const ini = parseInt(kmInicial, 10);
    const fim = parseInt(kmFinal, 10);
    if (!isNaN(ini) && !isNaN(fim) && fim > ini) {
      setKmRodado((fim - ini).toString());
    }
  }, [kmInicial, kmFinal]);

  const monthRecords = useMemo(
    () => getRecordsForMonth(records, viewYear, viewMonth),
    [records, viewYear, viewMonth]
  );

  const totals = useMemo(() => {
    const totalKm = monthRecords.reduce((s, r) => s + r.kmRodado, 0);
    const totalCusto = monthRecords.reduce((s, r) => s + r.custoEstimado, 0);
    return { totalKm, totalCusto };
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
    const km = parseInt(kmRodado, 10);
    if (isNaN(km) || km <= 0) {
      toast({ title: 'Erro', description: 'KM Rodado deve ser maior que 0.', variant: 'destructive' });
      return;
    }

    const record: KmRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      data: format(formDate, 'yyyy-MM-dd'),
      kmInicial: kmInicial ? parseInt(kmInicial, 10) : undefined,
      kmFinal: kmFinal ? parseInt(kmFinal, 10) : undefined,
      kmRodado: km,
      custoEstimado: calcularCustoEstimado(km, settings),
    };

    saveKmRecord(record, vehicleType);
    setRecords(loadKmRecords(vehicleType));

    // Sync kmFinal with maintenance monitor kmAtual
    const kmFinalVal = kmFinal ? parseInt(kmFinal, 10) : 0;
    if (kmFinalVal > 0) {
      saveKmAtual(kmFinalVal);
      const status = calcularStatusTodos(vehicleType, kmFinalVal);
      if (status.vencidos.length > 0 || status.proximos.length > 0) {
        setMaintenanceAlert({ vencidos: status.vencidos, proximos: status.proximos });
      } else {
        setMaintenanceAlert(null);
        toast({ title: '✅ Registrado!', description: `${formatKm(km)} km · Manutenções em dia!` });
      }
    } else {
      toast({ title: 'Registrado!', description: `${formatKm(km)} km adicionados.` });
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteKmRecord(id, vehicleType);
    setRecords(loadKmRecords(vehicleType));
    toast({ title: 'Removido', description: 'Registro excluído.' });
  };

  const resetForm = () => {
    setShowForm(false);
    setKmInicial('');
    setKmFinal('');
    setKmRodado('');
    setFormDate(new Date());
    setMaintenanceAlert(null);
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetForm(); } }}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            📋 Controle de KM — {vehicleType === 'moto' ? '🏍️ Moto' : '🚗 Carro'}
          </DialogTitle>
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
        <ScrollArea className="flex-1 min-h-0 max-h-[40vh]">
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
                        {r.kmInicial != null && r.kmFinal != null
                          ? `${formatKm(r.kmInicial)} → ${formatKm(r.kmFinal)}`
                          : '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">{formatKm(r.kmRodado)} km</div>
                      <div className="text-xs text-primary">{formatCurrency(r.custoEstimado)}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Totals */}
        <div className="flex justify-between bg-muted rounded-lg p-3 text-sm font-semibold">
          <span className="text-muted-foreground">Total do mês:</span>
          <span className="text-foreground">{formatKm(totals.totalKm)} km · {formatCurrency(totals.totalCusto)}</span>
        </div>

        {/* Maintenance alerts */}
        {maintenanceAlert && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-destructive">
              <AlertTriangle className="w-4 h-4" />
              ⚠️ AVISO DE MANUTENÇÃO
            </div>
            {maintenanceAlert.vencidos.length > 0 && (
              <div className="space-y-1">
                {maintenanceAlert.vencidos.map(item => (
                  <div key={item.item} className="text-xs flex items-center gap-1">
                    <span className="text-destructive font-semibold">🔴 {item.item}</span>
                    {item.kmFaltam != null && (
                      <span className="text-destructive">— atrasado {formatKm(Math.abs(item.kmFaltam))} km</span>
                    )}
                    {!item.ultimaTroca && <span className="text-destructive">— nunca trocado</span>}
                  </div>
                ))}
              </div>
            )}
            {maintenanceAlert.proximos.length > 0 && (
              <div className="space-y-1">
                {maintenanceAlert.proximos.map(item => (
                  <div key={item.item} className="text-xs flex items-center gap-1">
                    <span className="text-yellow-500 font-semibold">🟡 {item.item}</span>
                    {item.kmFaltam != null && (
                      <span className="text-muted-foreground">— falta {formatKm(item.kmFaltam)} km</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7 text-muted-foreground"
              onClick={() => setMaintenanceAlert(null)}
            >
              Fechar aviso
            </Button>
          </div>
        )}

        {/* Add form */}
        {showForm ? (
          <div className="space-y-3 border border-border rounded-lg p-4">
            {/* Date picker */}
            <div>
              <label className="text-xs text-primary font-bold uppercase block mb-1">Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDate ? format(formDate, 'dd/MM/yyyy') : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate}
                    onSelect={(d) => d && setFormDate(d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* KM fields */}
            <div className="grid grid-cols-3 gap-2">
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
              <div>
                <label className="text-[10px] text-primary font-bold uppercase block mb-1">KM Rodado</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatInputDisplay(kmRodado)}
                  onChange={(e) => handleKmInput(e.target.value, setKmRodado)}
                  className="w-full bg-input border border-border text-foreground text-center text-sm font-bold rounded-lg py-2 px-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                />
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
            Novo Registro
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
