import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FreightCalculatorProps {
  distance: string;
  hours: string;
  minutes: string;
  onDistanceChange: (value: string) => void;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onCalculate: () => void;
}

export const FreightCalculator = ({
  distance,
  hours,
  minutes,
  onDistanceChange,
  onHoursChange,
  onMinutesChange,
  onCalculate,
}: FreightCalculatorProps) => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6">
        <h2 className="text-center text-muted-foreground text-sm mb-6 uppercase tracking-wider font-medium">
          Dados da Viagem
        </h2>
        
        <div className="space-y-5">
          {/* Distância */}
          <div>
            <label className="text-xs text-primary block mb-2 font-bold uppercase ml-1">
              Distância (KM)
            </label>
            <input
              type="number"
              placeholder="0.0"
              value={distance}
              onChange={(e) => onDistanceChange(e.target.value)}
              min="0"
              step="0.1"
              className="w-full bg-background border border-border text-foreground text-center text-2xl font-bold rounded-lg py-4 px-4 transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground placeholder:font-bold"
            />
          </div>

          {/* Tempo de Viagem */}
          <div>
            <label className="text-xs text-primary block mb-2 font-bold uppercase ml-1">
              Tempo de Viagem
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => onHoursChange(e.target.value)}
                  min="0"
                  className="w-full bg-background border border-border text-foreground text-center text-2xl font-bold rounded-lg py-4 px-4 transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground placeholder:font-bold"
                />
                <p className="text-[10px] text-muted-foreground text-center mt-2 uppercase font-medium">Horas</p>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="0"
                  value={minutes}
                  onChange={(e) => onMinutesChange(e.target.value)}
                  min="0"
                  max="59"
                  className="w-full bg-background border border-border text-foreground text-center text-2xl font-bold rounded-lg py-4 px-4 transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground placeholder:font-bold"
                />
                <p className="text-[10px] text-muted-foreground text-center mt-2 uppercase font-medium">Minutos</p>
              </div>
            </div>
          </div>

          {/* Botão Calcular */}
          <Button
            onClick={onCalculate}
            className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] text-primary-foreground flex items-center justify-center gap-3 rounded-lg"
          >
            <Calculator className="w-6 h-6" />
            CALCULAR VALOR
          </Button>
        </div>
      </div>
    </div>
  );
};
