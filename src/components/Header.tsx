import { Settings2, Bike, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleType } from '@/data/maintenanceItems';

interface HeaderProps {
  onSettingsClick: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  vehicleType: VehicleType;
  onVehicleChange: (type: VehicleType) => void;
}

export const Header = ({ onSettingsClick, vehicleType, onVehicleChange }: HeaderProps) => {
  return (
    <header className="w-full bg-card border-b border-border">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-xl font-bold text-secondary tracking-tight">ENTREGAS ITAJAÍ</h1>
            <p className="text-sm font-semibold text-foreground">Calculadora de Rota</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Vehicle Toggle */}
            <div className="flex bg-muted rounded-lg p-0.5">
              <button
                onClick={() => onVehicleChange('moto')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  vehicleType === 'moto'
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bike className="w-4 h-4" />
                Moto
              </button>
              <button
                onClick={() => onVehicleChange('carro')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  vehicleType === 'carro'
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Car className="w-4 h-4" />
                Carro
              </button>
            </div>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={onSettingsClick}
              className="bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors"
            >
              <Settings2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
