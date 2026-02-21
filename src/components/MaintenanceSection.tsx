import { RotateCcw, Wrench, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  ItemManutencao,
  ITENS_DEFAULTS,
  calcularCustoKm,
  calcularManutencaoTotalKm,
} from '@/data/maintenanceItems';

interface MaintenanceSectionProps {
  itens: ItemManutencao[];
  onItensChange: (itens: ItemManutencao[]) => void;
  onRestore: () => void;
}

export const MaintenanceSection = ({ itens, onItensChange, onRestore }: MaintenanceSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const totalKm = calcularManutencaoTotalKm(itens);

  const handleChange = (index: number, field: 'valorItem' | 'kmTroca', value: string) => {
    const numValue = parseFloat(value) || 0;
    const updated = itens.map((item, i) =>
      i === index ? { ...item, [field]: numValue } : item
    );
    onItensChange(updated);
  };

  const formatCustoKm = (value: number) => value.toFixed(4).replace('.', ',');

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs font-bold text-primary uppercase tracking-wider py-2"
      >
        <span className="flex items-center gap-2">
          <Wrench className="w-3 h-3" /> Manutenção Detalhada
        </span>
        <span className="flex items-center gap-2">
          <span className="text-foreground font-mono text-sm">R$ {formatCustoKm(totalKm)}/km</span>
          {expanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className="space-y-2 animate-fade-in">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_80px_70px] gap-1 text-[9px] text-muted-foreground uppercase font-bold px-1">
            <span>Item</span>
            <span className="text-center">Valor (R$)</span>
            <span className="text-center">Km troca</span>
            <span className="text-right">R$/km</span>
          </div>

          {/* Items */}
          {itens.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_80px_80px_70px] gap-1 items-center bg-input rounded-lg p-2 border border-border"
            >
              <span className="text-[10px] text-foreground leading-tight pr-1">{item.nome}</span>
              <input
                type="number"
                min="0"
                step="1"
                value={item.valorItem}
                onChange={(e) => handleChange(index, 'valorItem', e.target.value)}
                className="w-full text-center text-xs font-bold bg-card border border-border rounded px-1 py-1.5 text-foreground focus:outline-none focus:border-primary"
              />
              <input
                type="number"
                min="1"
                step="500"
                value={item.kmTroca}
                onChange={(e) => handleChange(index, 'kmTroca', e.target.value)}
                className="w-full text-center text-xs font-bold bg-card border border-border rounded px-1 py-1.5 text-foreground focus:outline-none focus:border-primary"
              />
              <span className="text-right text-xs font-mono text-primary">
                {formatCustoKm(calcularCustoKm(item))}
              </span>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg p-3 mt-2">
            <span className="text-xs font-bold text-primary uppercase">Total Manutenção</span>
            <span className="text-sm font-bold font-mono text-foreground">
              R$ {formatCustoKm(totalKm)}/km
            </span>
          </div>

          {/* Restore */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRestore}
            className="w-full text-xs gap-2"
          >
            <RotateCcw className="w-3 h-3" />
            Restaurar padrões
          </Button>
        </div>
      )}
    </div>
  );
};
