import { Calculator, Bike, Car, ClipboardList, Coins, Wrench, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleType } from '@/data/maintenanceItems';
import { PremiumGate } from '@/components/PremiumGate';
import { useSubscription } from '@/hooks/useSubscription';

interface FreightCalculatorProps {
  distance: string;
  hours: string;
  minutes: string;
  onDistanceChange: (value: string) => void;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onCalculate: () => void;
  onCalculateCosts: () => void;
  onOpenKmControl: () => void;
  onOpenMaintenanceMonitor: () => void;
  vehicleType: VehicleType;
}

export const FreightCalculator = ({
  distance, hours, minutes,
  onDistanceChange, onHoursChange, onMinutesChange,
  onCalculate, onCalculateCosts, onOpenKmControl, onOpenMaintenanceMonitor, vehicleType,
}: FreightCalculatorProps) => {
  const VehicleIcon = vehicleType === 'moto' ? Bike : Car;
  const vehicleLabel = vehicleType === 'moto' ? '🏍️ Moto' : '🚗 Carro';
  const { isPremium } = useSubscription();

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6">
        <h2 className="text-center text-muted-foreground text-sm mb-6 uppercase tracking-wider font-medium flex items-center justify-center gap-2">
          <VehicleIcon className="w-4 h-4" />
          Dados da Viagem — {vehicleLabel}
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
              className="w-full bg-input border border-border text-foreground text-center text-2xl font-bold rounded-lg py-4 px-4 transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground placeholder:font-bold"
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
                  className="w-full bg-input border border-border text-foreground text-center text-2xl font-bold rounded-lg py-4 px-4 transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground placeholder:font-bold"
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
                  className="w-full bg-input border border-border text-foreground text-center text-2xl font-bold rounded-lg py-4 px-4 transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground placeholder:font-bold"
                />
                <p className="text-[10px] text-muted-foreground text-center mt-2 uppercase font-medium">Minutos</p>
              </div>
            </div>
          </div>

          {/* Botão Calcular */}
          <Button
            onClick={onCalculate}
            className="w-full h-16 text-lg font-bold bg-secondary hover:bg-secondary/90 transition-all shadow-glow text-secondary-foreground flex items-center justify-center gap-3 rounded-lg"
          >
            <Calculator className="w-6 h-6" />
            CALCULAR VALOR
          </Button>

          <Button
            onClick={onCalculateCosts}
            variant="outline"
            className="w-full h-14 text-base font-bold transition-all flex items-center justify-center gap-3 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
          >
            <Coins className="w-5 h-5" />
            CALCULAR CUSTOS
          </Button>

          {/* Premium: Controle de KM */}
          <PremiumGate onAction={onOpenKmControl} featureName="Controle de KM">
            <Button
              variant="outline"
              className="w-full h-12 text-sm font-bold transition-all flex items-center justify-center gap-2 rounded-lg pointer-events-none"
            >
              <ClipboardList className="w-5 h-5" />
              CONTROLE DE KM
              {!isPremium && <Lock className="w-4 h-4 ml-1 text-muted-foreground" />}
            </Button>
          </PremiumGate>

          {/* Premium: Monitorar Manutenções */}
          <PremiumGate onAction={onOpenMaintenanceMonitor} featureName="Monitorar Manutenções">
            <Button
              variant="outline"
              className="w-full h-12 text-sm font-bold transition-all flex items-center justify-center gap-2 rounded-lg border-primary/30 text-primary hover:bg-primary/10 pointer-events-none"
            >
              <Wrench className="w-5 h-5" />
              MONITORAR MANUTENÇÕES
              {!isPremium && <Lock className="w-4 h-4 ml-1 text-muted-foreground" />}
            </Button>
          </PremiumGate>
        </div>
      </div>
    </div>
  );
};
