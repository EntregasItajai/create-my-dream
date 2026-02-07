import { Calculator, Route, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ManualCalculationProps {
  distance: string;
  hours: string;
  minutes: string;
  onDistanceChange: (value: string) => void;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onCalculate: () => void;
  isCalculating: boolean;
}

export const ManualCalculation = ({
  distance,
  hours,
  minutes,
  onDistanceChange,
  onHoursChange,
  onMinutesChange,
  onCalculate,
  isCalculating,
}: ManualCalculationProps) => {
  return (
    <Card className="shadow-card border-border/50 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Calculator className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-foreground font-bold">Cálculo Manual</span>
            <p className="text-xs text-muted-foreground font-normal mt-0.5">Informe distância e tempo</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Distância */}
        <div className="space-y-2">
          <Label htmlFor="distance" className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Route className="w-4 h-4 text-primary" />
            Distância
          </Label>
          <div className="relative">
            <Input
              id="distance"
              type="number"
              placeholder="Ex: 5.5"
              value={distance}
              onChange={(e) => onDistanceChange(e.target.value)}
              min="0"
              step="0.1"
              className="h-12 pr-12 bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
              km
            </span>
          </div>
        </div>

        {/* Tempo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            Tempo Estimado
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={hours}
                onChange={(e) => onHoursChange(e.target.value)}
                min="0"
                className="h-12 pr-14 bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                horas
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="30"
                value={minutes}
                onChange={(e) => onMinutesChange(e.target.value)}
                min="0"
                max="59"
                className="h-12 pr-12 bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                min
              </span>
            </div>
          </div>
        </div>

        {/* Botão Calcular */}
        <Button
          onClick={onCalculate}
          disabled={isCalculating}
          className="w-full h-14 text-base font-semibold gradient-primary hover:opacity-90 transition-all shadow-glow hover:shadow-lg text-primary-foreground"
        >
          {isCalculating ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Calculando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Calcular Frete
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
