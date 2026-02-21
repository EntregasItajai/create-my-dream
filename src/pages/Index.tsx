import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { FreightCalculator } from '@/components/FreightCalculator';
import { FreightResult } from '@/components/FreightResult';
import { TextBanner } from '@/components/TextBanner';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import {
  VehicleType,
  ItemManutencao,
  ITENS_DEFAULTS,
  loadVehicleType,
  saveVehicleType,
  loadMaintenanceItems,
  saveMaintenanceItems,
  resetMaintenanceItems,
  calcularCustoKm,
  calcularManutencaoTotalKm,
} from '@/data/maintenanceItems';

export interface Settings {
  precoKm: number;
  valorHora: number;
  valorMinimo: number;
  precoGasolina: number;
  consumoMoto: number;
  depreciacao: number;
  manutencao: number;
}

const DEFAULT_SETTINGS: Record<VehicleType, Settings> = {
  moto: {
    precoKm: 0.50,
    valorHora: 50.00,
    valorMinimo: 15.00,
    precoGasolina: 6.70,
    consumoMoto: 37,
    depreciacao: 0.05,
    manutencao: 0,
  },
  carro: {
    precoKm: 1.0845,
    valorHora: 50.00,
    valorMinimo: 25.00,
    precoGasolina: 6.70,
    consumoMoto: 11,
    depreciacao: 0.18,
    manutencao: 0,
  },
};

const SETTINGS_KEYS: Record<VehicleType, string> = {
  moto: 'freightSettings_moto',
  carro: 'freightSettings_carro',
};

const loadSettings = (vehicle: VehicleType): Settings => {
  const defaults = DEFAULT_SETTINGS[vehicle];
  const stored = localStorage.getItem(SETTINGS_KEYS[vehicle]);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const sanitized = { ...defaults };
      for (const key of Object.keys(defaults) as (keyof Settings)[]) {
        const val = parsed[key];
        if (typeof val === 'number' && !isNaN(val)) {
          sanitized[key] = val;
        }
      }
      return sanitized;
    } catch {
      return { ...defaults };
    }
  }
  return { ...defaults };
};

export interface MaintenanceBreakdown {
  nome: string;
  custoRota: number;
}

export interface CalculationResult {
  valorFinal: number;
  minimoAplicado: boolean;
  custoCombustivel: number;
  litrosUsados: number;
  custoManutencao: number;
  custoDepreciacao: number;
  custoTotal: number;
  lucroLiquido: number;
  distancia: number;
  tempoTotal: number;
  manutencaoDetalhada: MaintenanceBreakdown[];
  vehicleType: VehicleType;
}

const Index = () => {
  const { isDark, toggleTheme } = useTheme();
  const [vehicleType, setVehicleType] = useState<VehicleType>(loadVehicleType);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => loadSettings(vehicleType));
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [maintenanceItems, setMaintenanceItems] = useState<ItemManutencao[]>(() => loadMaintenanceItems(vehicleType));

  // Switch vehicle
  const handleVehicleChange = useCallback((type: VehicleType) => {
    if (type === vehicleType) return;
    setVehicleType(type);
    saveVehicleType(type);
    const newSettings = loadSettings(type);
    const newItems = loadMaintenanceItems(type);
    const maintenanceTotal = calcularManutencaoTotalKm(newItems);
    setSettings({ ...newSettings, manutencao: parseFloat(maintenanceTotal.toFixed(4)) });
    setMaintenanceItems(newItems);
    setResult(null);
    toast({ title: type === 'moto' ? '🏍️ Moto' : '🚗 Carro', description: `Configurações de ${type} carregadas.` });
  }, [vehicleType]);

  // Sync maintenance total to settings
  useEffect(() => {
    const total = calcularManutencaoTotalKm(maintenanceItems);
    setSettings(prev => ({ ...prev, manutencao: parseFloat(total.toFixed(4)) }));
  }, [maintenanceItems]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEYS[vehicleType], JSON.stringify(settings));
  }, [settings, vehicleType]);

  const handleMaintenanceChange = (itens: ItemManutencao[]) => {
    setMaintenanceItems(itens);
    saveMaintenanceItems(itens, vehicleType);
  };

  const handleMaintenanceRestore = () => {
    resetMaintenanceItems(vehicleType);
    setMaintenanceItems([...ITENS_DEFAULTS[vehicleType]]);
    toast({ title: "Restaurado!", description: `Manutenção ${vehicleType} restaurada ao padrão.` });
  };

  const handleCalculate = () => {
    const km = parseFloat(distance);
    const h = parseFloat(hours) || 0;
    const m = parseFloat(minutes) || 0;
    const totalMinutes = (h * 60) + m;

    if (isNaN(km) || km <= 0) {
      toast({ title: "Erro", description: "Por favor, preencha a Distância.", variant: "destructive" });
      return;
    }

    if (totalMinutes <= 0) {
      toast({ title: "Erro", description: "Por favor, preencha o Tempo.", variant: "destructive" });
      return;
    }

    const precoMinuto = (settings.valorHora || 0) / 60;
    let valorBruto = (km * (settings.precoKm || 0)) + (totalMinutes * precoMinuto);
    let minimoAplicado = false;

    if (valorBruto < settings.valorMinimo) {
      valorBruto = settings.valorMinimo;
      minimoAplicado = true;
    }

    const consumo = settings.consumoMoto > 0 ? settings.consumoMoto : 1;
    const litrosUsados = km / consumo;
    const custoCombustivel = litrosUsados * (settings.precoGasolina || 0);
    const custoManutencao = km * (settings.manutencao || 0);
    const custoDepreciacao = km * (settings.depreciacao || 0);
    const custoTotal = custoCombustivel + custoManutencao + custoDepreciacao;
    const lucroLiquido = valorBruto - custoTotal;

    const manutencaoDetalhada: MaintenanceBreakdown[] = maintenanceItems.map(item => ({
      nome: item.nome,
      custoRota: calcularCustoKm(item) * km,
    }));

    setResult({
      valorFinal: valorBruto,
      minimoAplicado,
      custoCombustivel,
      litrosUsados,
      custoManutencao,
      custoDepreciacao,
      custoTotal,
      lucroLiquido,
      distancia: km,
      tempoTotal: totalMinutes,
      manutencaoDetalhada,
      vehicleType,
    });

    toast({ title: "Sucesso!", description: "Valor calculado com sucesso." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSettingsClick={() => setSettingsOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        vehicleType={vehicleType}
        onVehicleChange={handleVehicleChange}
      />
      
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        maintenanceItems={maintenanceItems}
        onMaintenanceChange={handleMaintenanceChange}
        onMaintenanceRestore={handleMaintenanceRestore}
        vehicleType={vehicleType}
      />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="space-y-6">
          <FreightCalculator
            distance={distance}
            hours={hours}
            minutes={minutes}
            onDistanceChange={setDistance}
            onHoursChange={setHours}
            onMinutesChange={setMinutes}
            onCalculate={handleCalculate}
            vehicleType={vehicleType}
          />

          {result && <FreightResult result={result} />}

          <TextBanner link="https://www.instagram.com/entregasitajai.com.br/" />
        </div>
      </main>
    </div>
  );
};

export default Index;
