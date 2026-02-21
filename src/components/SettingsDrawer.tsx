import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fuel, Timer, Route, Gauge, Wrench, TrendingDown, Tag, Bike, Car } from 'lucide-react';
import { Settings } from '@/pages/Index';
import { ItemManutencao, VehicleType } from '@/data/maintenanceItems';
import { MaintenanceSection } from '@/components/MaintenanceSection';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  maintenanceItems: ItemManutencao[];
  onMaintenanceChange: (itens: ItemManutencao[]) => void;
  onMaintenanceRestore: () => void;
  vehicleType: VehicleType;
}

export const SettingsDrawer = ({
  isOpen, onClose, settings, onSettingsChange,
  maintenanceItems, onMaintenanceChange, onMaintenanceRestore,
  vehicleType,
}: SettingsDrawerProps) => {
  const handleChange = (key: keyof Settings, value: string) => {
    const numValue = parseFloat(value) || 0;
    onSettingsChange({ ...settings, [key]: numValue });
  };

  const vehicleLabel = vehicleType === 'moto' ? '🏍️ Moto' : '🚗 Carro';
  const VehicleIcon = vehicleType === 'moto' ? Bike : Car;

  const saleFields = [
    { key: 'precoKm' as keyof Settings, label: 'Preço / Km', icon: Route, prefix: 'R$', suffix: '/km', step: '0.10' },
    { key: 'valorHora' as keyof Settings, label: 'Valor Hora', icon: Timer, prefix: 'R$', suffix: '/hora', step: '1.00', highlight: true },
    { key: 'valorMinimo' as keyof Settings, label: 'Valor Mínimo (Piso)', icon: Tag, prefix: 'R$', suffix: '', step: '1.00', fullWidth: true, highlight: true },
  ];

  const costFields = [
    { key: 'precoGasolina' as keyof Settings, label: 'Gasolina (R$/L)', icon: Fuel, prefix: 'R$', suffix: '/litro', step: '0.10' },
    { key: 'consumoMoto' as keyof Settings, label: 'Consumo (Km/L)', icon: Gauge, prefix: '', suffix: 'km/l', step: '1' },
    { key: 'depreciacao' as keyof Settings, label: 'Depreciação (R$/Km)', icon: TrendingDown, prefix: 'R$', suffix: '/km', step: '0.05' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 bg-card border-l border-border overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <VehicleIcon className="w-4 h-4 text-secondary-foreground" />
            </div>
            Configurações {vehicleLabel}
          </SheetTitle>
        </SheetHeader>

        {/* Tabela de Venda */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Tag className="w-3 h-3" /> Tabela de Venda
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {saleFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className={`space-y-1 ${field.fullWidth ? 'col-span-2' : ''}`}>
                  <Label htmlFor={field.key} className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                    <Icon className="w-3 h-3 text-primary" />
                    {field.label}
                  </Label>
                  <div className="relative">
                    {field.prefix && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{field.prefix}</span>
                    )}
                    <Input
                      id={field.key}
                      type="number"
                      step={field.step}
                      min="0"
                      value={settings[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className={`${field.prefix ? 'pl-10' : 'pl-3'} ${field.suffix ? 'pr-14' : 'pr-3'} h-10 bg-input border-border focus:border-primary focus:ring-primary/20 transition-all ${field.highlight ? 'font-bold border-primary/50' : ''}`}
                    />
                    {field.suffix && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{field.suffix}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <hr className="border-border mb-6" />

        {/* Custos Operacionais */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wrench className="w-3 h-3" /> Custos Operacionais
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {costFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className="space-y-1">
                  <Label htmlFor={field.key} className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                    <Icon className="w-3 h-3 text-primary" />
                    {field.label}
                  </Label>
                  <div className="relative">
                    {field.prefix && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{field.prefix}</span>
                    )}
                    <Input
                      id={field.key}
                      type="number"
                      step={field.step}
                      min="0"
                      value={settings[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className={`${field.prefix ? 'pl-10' : 'pl-3'} ${field.suffix ? 'pr-14' : 'pr-3'} h-10 bg-input border-border focus:border-primary focus:ring-primary/20 transition-all`}
                    />
                    {field.suffix && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{field.suffix}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manutenção (read-only) */}
          <div className="mt-3 space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
              <Wrench className="w-3 h-3 text-primary" />
              Manutenção (R$/Km) — calculado automaticamente
            </Label>
            <div className="h-10 bg-input border border-border rounded-md flex items-center px-3">
              <span className="text-muted-foreground text-sm">R$</span>
              <span className="ml-2 text-sm font-bold text-foreground">{settings.manutencao.toFixed(4).replace('.', ',')}</span>
              <span className="ml-auto text-muted-foreground text-xs">/km</span>
            </div>
          </div>
        </div>

        <hr className="border-border mb-6" />

        {/* Manutenção Detalhada */}
        <MaintenanceSection
          itens={maintenanceItems}
          onItensChange={onMaintenanceChange}
          onRestore={onMaintenanceRestore}
        />

        <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            💡 <strong className="text-foreground">Dica:</strong> Ajuste os valores de acordo com sua região e custos operacionais.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
