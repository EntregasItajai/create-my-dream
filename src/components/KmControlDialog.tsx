import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Form state
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');
  const [kmRodado, setKmRodado] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRecords(loadKmRecords(vehicleType));
    }
  }, [isOpen, vehicleType]);

  // Auto-calc kmRodado
  useEffect(() => {
    const ini = parseFloat(kmInicial);
    const fim = parseFloat(kmFinal);
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
    const km = parseFloat(kmRodado);
    if (isNaN(km) || km <= 0) {
      toast({ title: 'Erro', description: 'KM Rodado deve ser maior que 0.', variant: 'destructive' });
      return;
    }

    const record: KmRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      data: format(formDate, 'yyyy-MM-dd'),
      kmInicial: kmInicial ? parseFloat(kmInicial) : undefined,
      kmFinal: kmFinal ? parseFloat(kmFinal) : undefined,
      kmRodado: km,
      custoEstimado: calcularCustoEstimado(km, settings),
    };

    saveKmRecord(record, vehicleType);
    setRecords(loadKmRecords(vehicleType));
    resetForm();
    toast({ title: 'Registrado!', description: `${km} km adicionados.` });
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
                          ? `${r.kmInicial.toLocaleString('pt-BR')} → ${r.kmFinal.toLocaleString('pt-BR')}`
                          : '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">{r.kmRodado.toLocaleString('pt-BR')} km</div>
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
          <span className="text-foreground">{totals.totalKm.toLocaleString('pt-BR')} km · {formatCurrency(totals.totalCusto)}</span>
        </div>

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
                  type="number"
                  placeholder="0"
                  value={kmInicial}
                  onChange={(e) => setKmInicial(e.target.value)}
                  className="w-full bg-input border border-border text-foreground text-center text-sm font-bold rounded-lg py-2 px-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-medium uppercase block mb-1">KM Final</label>
                <input
                  type="number"
                  placeholder="0"
                  value={kmFinal}
                  onChange={(e) => setKmFinal(e.target.value)}
                  className="w-full bg-input border border-border text-foreground text-center text-sm font-bold rounded-lg py-2 px-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] text-primary font-bold uppercase block mb-1">KM Rodado</label>
                <input
                  type="number"
                  placeholder="0"
                  value={kmRodado}
                  onChange={(e) => setKmRodado(e.target.value)}
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
