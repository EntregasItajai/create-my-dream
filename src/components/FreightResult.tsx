import { Fuel, Wrench, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { CalculationResult } from '@/pages/Index';

interface FreightResultProps {
  result: CalculationResult;
}

export const FreightResult = ({ result }: FreightResultProps) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-input rounded-xl border border-border overflow-hidden animate-fade-in">
      <div className="p-6 space-y-6">
        {/* Valor Final */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Valor Final ao Cliente
          </p>
          <div className="text-6xl font-bold text-foreground tracking-tighter drop-shadow-2xl">
            {formatCurrency(result.valorFinal)}
          </div>
          {result.minimoAplicado && (
            <span className="inline-flex items-center gap-2 bg-amber-900/50 text-amber-400 text-xs px-4 py-2 rounded-full mt-4 border border-amber-700/50 font-bold">
              <AlertTriangle className="w-4 h-4" />
              Valor Mínimo Aplicado
            </span>
          )}
        </div>

        {/* Custos */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-3 ml-1">
            Seus Custos (Estimativa)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {/* Combustível */}
            <div className="bg-card p-3 rounded-lg border border-rose-900/30 text-center">
              <div className="flex justify-center mb-1">
                <Fuel className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-[9px] text-muted-foreground uppercase">Combustível</p>
              <p className="text-sm font-bold text-rose-300">{formatCurrency(result.custoCombustivel)}</p>
              <p className="text-[9px] text-muted-foreground mt-1">
                {result.litrosUsados.toFixed(2).replace('.', ',')} L
              </p>
            </div>

            {/* Manutenção */}
            <div className="bg-card p-3 rounded-lg border border-orange-900/30 text-center">
              <div className="flex justify-center mb-1">
                <Wrench className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-[9px] text-muted-foreground uppercase">Manutenção</p>
              <p className="text-sm font-bold text-orange-300">{formatCurrency(result.custoManutencao)}</p>
            </div>

            {/* Depreciação */}
            <div className="bg-card p-3 rounded-lg border border-amber-900/30 text-center">
              <div className="flex justify-center mb-1">
                <TrendingDown className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-[9px] text-muted-foreground uppercase">Depreciação</p>
              <p className="text-sm font-bold text-amber-300">{formatCurrency(result.custoDepreciacao)}</p>
            </div>
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className={`p-4 rounded-lg text-center ${result.lucroLiquido >= 0 ? 'bg-emerald-900/20 border border-emerald-900/50' : 'bg-muted border border-border'}`}>
          <div className="flex justify-center items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-sm uppercase font-bold text-emerald-400">Lucro Líquido</span>
          </div>
          <p className={`text-3xl font-bold ${result.lucroLiquido >= 0 ? 'text-emerald-200' : 'text-muted-foreground'}`}>
            {formatCurrency(result.lucroLiquido)}
          </p>
          <p className="text-[10px] text-emerald-400/60 mt-1">Dinheiro livre no bolso</p>
        </div>
      </div>
    </div>
  );
};
