import { DollarSign, Route, Clock, Fuel, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Settings {
  taxaKm: number;
  taxaHora: number;
  precoGasolina: number;
  consumoMoto: number;
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
  const custoGasolina = (totalDistance / settings.consumoMoto) * settings.precoGasolina;
  const valorBruto = valorKm + valorHora;
  const lucroLiquido = valorBruto - custoGasolina;

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

  const detailItems = [
    {
      icon: Route,
      label: 'Distância',
      value: `${totalDistance.toFixed(1)} km`,
      subValue: formatCurrency(valorKm),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Clock,
      label: 'Tempo',
      value: formatTime(totalDuration),
      subValue: formatCurrency(valorHora),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Fuel,
      label: 'Combustível',
      value: `${(totalDistance / settings.consumoMoto).toFixed(2)}L`,
      subValue: `- ${formatCurrency(custoGasolina)}`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

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
        {/* Valor Total */}
        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">Lucro Líquido Estimado</p>
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="w-8 h-8 text-primary" />
            <span className="text-4xl font-bold text-gradient">
              {formatCurrency(lucroLiquido)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Valor bruto: {formatCurrency(valorBruto)}
          </p>
        </div>

        {/* Detalhes */}
        <div className="grid gap-3">
          {detailItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
                <span className={`font-bold ${item.label === 'Combustível' ? 'text-destructive' : 'text-primary'}`}>
                  {item.subValue}
                </span>
              </div>
            );
          })}
        </div>

        {/* Resumo */}
        <div className="p-4 rounded-xl bg-secondary/20 border border-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💡</span>
            <span className="font-semibold text-foreground">Resumo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Para uma entrega de <strong className="text-foreground">{totalDistance.toFixed(1)}km</strong> em{' '}
            <strong className="text-foreground">{formatTime(totalDuration)}</strong>, você terá um lucro estimado de{' '}
            <strong className="text-primary">{formatCurrency(lucroLiquido)}</strong> após descontar{' '}
            <strong className="text-destructive">{formatCurrency(custoGasolina)}</strong> de combustível.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
