import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fuel, Timer, Route, Gauge } from 'lucide-react';

interface Settings {
  taxaKm: number;
  taxaHora: number;
  precoGasolina: number;
  consumoMoto: number;
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export const SettingsDrawer = ({ isOpen, onClose, settings, onSettingsChange }: SettingsDrawerProps) => {
  const handleChange = (key: keyof Settings, value: string) => {
    const numValue = parseFloat(value) || 0;
    onSettingsChange({ ...settings, [key]: numValue });
  };

  const settingsFields = [
    {
      key: 'taxaKm' as keyof Settings,
      label: 'Taxa por Km',
      icon: Route,
      prefix: 'R$',
      suffix: '/km',
      step: '0.10',
    },
    {
      key: 'taxaHora' as keyof Settings,
      label: 'Taxa por Hora',
      icon: Timer,
      prefix: 'R$',
      suffix: '/hora',
      step: '1.00',
    },
    {
      key: 'precoGasolina' as keyof Settings,
      label: 'Preço da Gasolina',
      icon: Fuel,
      prefix: 'R$',
      suffix: '/litro',
      step: '0.10',
    },
    {
      key: 'consumoMoto' as keyof Settings,
      label: 'Consumo da Moto',
      icon: Gauge,
      prefix: '',
      suffix: 'km/l',
      step: '1',
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 bg-card border-l border-border">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Gauge className="w-4 h-4 text-primary-foreground" />
            </div>
            Configurações
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {settingsFields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  {field.label}
                </Label>
                <div className="relative">
                  {field.prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                      {field.prefix}
                    </span>
                  )}
                  <Input
                    id={field.key}
                    type="number"
                    step={field.step}
                    min="0"
                    value={settings[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`${field.prefix ? 'pl-10' : 'pl-4'} pr-16 h-12 bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {field.suffix}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            💡 <strong className="text-foreground">Dica:</strong> Ajuste os valores de acordo com sua região e custos operacionais.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
