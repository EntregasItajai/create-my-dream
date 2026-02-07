import { DollarSign, Route, Clock, Fuel, TrendingUp, Wrench, TrendingDown, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Settings {
  taxaKm: number;
  taxaHora: number;
  precoGasolina: number;
  consumoMoto: number;
  depreciacao: number;
  manutencao: number;
}

interface ResultDisplayProps {
  totalDistance: number;
  totalDuration: number;
  settings: Settings;
}

export const ResultDisplay = ({ totalDistance, totalDuration, settings }: ResultDisplayProps) => {
  const hours = totalDuration / 60;
  
  // Cálculos
  const valorKm = totalDistance * settings.taxaKm;
  const valorHora = hours * settings.taxaHora;
  const litrosGasolina = totalDistance / settings.consumoMoto;
  const custoGasolina = litrosGasolina * settings.precoGasolina;
  const custoDepreciacao = totalDistance * settings.depreciacao;
  const custoManutencao = totalDistance * settings.manutencao;
  const custoTotal = custoGasolina + custoDepreciacao + custoManutencao;
  const valorBruto = valorKm + valorHora;
  const lucroLiquido = valorBruto - custoTotal;
  const precoSugerido = lucroLiquido > 0 ? valorBruto : custoTotal * 1.3; // 30% de margem mínima

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h > 0) {
      return `${h}h ${m}min`;
    }
    return `${m}min`;
  };

  return (
    <Card className="shadow-card border-border/50 overflow-hidden">
      <CardHeader className="pb-4 gradient-primary">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-primary-foreground font-bold text-lg">Resultado do Frete</span>
              <p className="text-primary-foreground/80 text-xs font-normal mt-0.5">Valores calculados</p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Preço Sugerido */}
        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Preço Sugerido</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="w-8 h-8 text-primary" />
            <span className="text-4xl font-bold text-gradient">
              {formatCurrency(precoSugerido)}
            </span>
          </div>
        </div>

        {/* Distância e Tempo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Route className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Distância</p>
              <p className="font-semibold text-foreground">{totalDistance.toFixed(1)} km</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tempo</p>
              <p className="font-semibold text-foreground">{formatTime(totalDuration)}</p>
            </div>
          </div>
        </div>

        {/* Custos da Viagem */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💸</span>
            <span className="font-semibold text-foreground">Custos da Viagem</span>
            <span className="ml-auto font-bold text-muted-foreground">- {formatCurrency(custoTotal)}</span>
          </div>
          
          <div className="space-y-3">
            {/* Gasolina */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Fuel className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Combustível</p>
                  <p className="text-xs text-muted-foreground">{litrosGasolina.toFixed(2)}L × {formatCurrency(settings.precoGasolina)}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">- {formatCurrency(custoGasolina)}</span>
            </div>

            {/* Depreciação */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Depreciação</p>
                  <p className="text-xs text-muted-foreground">{totalDistance.toFixed(1)}km × {formatCurrency(settings.depreciacao)}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">- {formatCurrency(custoDepreciacao)}</span>
            </div>

            {/* Manutenção */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Manutenção</p>
                  <p className="text-xs text-muted-foreground">{totalDistance.toFixed(1)}km × {formatCurrency(settings.manutencao)}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">- {formatCurrency(custoManutencao)}</span>
            </div>
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Lucro Líquido</span>
            </div>
            <span className={`text-xl font-bold ${lucroLiquido >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(lucroLiquido)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Valor bruto: {formatCurrency(valorBruto)} (Km: {formatCurrency(valorKm)} + Hora: {formatCurrency(valorHora)})
          </p>
        </div>

        {/* Resumo */}
        <div className="p-4 rounded-xl bg-secondary/20 border border-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💡</span>
            <span className="font-semibold text-foreground">Resumo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Para uma entrega de <strong className="text-foreground">{totalDistance.toFixed(1)}km</strong> em{' '}
            <strong className="text-foreground">{formatTime(totalDuration)}</strong>, sugerimos cobrar{' '}
            <strong className="text-primary">{formatCurrency(precoSugerido)}</strong>. Seus custos totais serão{' '}
            <strong className="text-foreground">{formatCurrency(custoTotal)}</strong>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
