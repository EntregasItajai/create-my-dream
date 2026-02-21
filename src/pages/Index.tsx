import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { FreightCalculator } from '@/components/FreightCalculator';
import { FreightResult } from '@/components/FreightResult';
import { TextBanner } from '@/components/TextBanner';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import {
  ItemManutencao,
  ITENS_DEFAULTS,
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

const defaultSettings: Settings = {
  precoKm: 0.50,
  valorHora: 50.00,
  valorMinimo: 15.00,
  precoGasolina: 6.50,
  consumoMoto: 37,
  depreciacao: 0.10,
  manutencao: 0.20,
};

const loadSettings = (): Settings => {
  const stored = localStorage.getItem('freightSettings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultSettings;
    }
  }
  return defaultSettings;
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
}

const Index = () => {
  const { isDark, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [maintenanceItems, setMaintenanceItems] = useState<ItemManutencao[]>(loadMaintenanceItems);

  // Sync maintenance total to settings
  useEffect(() => {
    const total = calcularManutencaoTotalKm(maintenanceItems);
    setSettings(prev => ({ ...prev, manutencao: parseFloat(total.toFixed(4)) }));
  }, [maintenanceItems]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('freightSettings', JSON.stringify(settings));
  }, [settings]);

  const handleMaintenanceChange = (itens: ItemManutencao[]) => {
    setMaintenanceItems(itens);
    saveMaintenanceItems(itens);
  };

  const handleMaintenanceRestore = () => {
    resetMaintenanceItems();
    setMaintenanceItems([...ITENS_DEFAULTS]);
    toast({ title: "Restaurado!", description: "Valores de manutenção restaurados ao padrão." });
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

    const precoMinuto = settings.valorHora / 60;
    let valorBruto = (km * settings.precoKm) + (totalMinutes * precoMinuto);
    let minimoAplicado = false;

    if (valorBruto < settings.valorMinimo) {
      valorBruto = settings.valorMinimo;
      minimoAplicado = true;
    }

    const litrosUsados = km / settings.consumoMoto;
    const custoCombustivel = litrosUsados * settings.precoGasolina;
    const custoManutencao = km * settings.manutencao;
    const custoDepreciacao = km * settings.depreciacao;
    const custoTotal = custoCombustivel + custoManutencao + custoDepreciacao;
    const lucroLiquido = valorBruto - custoTotal;

    // Detalhamento por item
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
    });

    toast({ title: "Sucesso!", description: "Valor calculado com sucesso." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSettingsClick={() => setSettingsOpen(true)} isDark={isDark} onToggleTheme={toggleTheme} />
      
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        maintenanceItems={maintenanceItems}
        onMaintenanceChange={handleMaintenanceChange}
        onMaintenanceRestore={handleMaintenanceRestore}
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
          />

          {result && <FreightResult result={result} />}

          <TextBanner link="https://www.instagram.com/entregasitajai.com.br/" />
        </div>
      </main>
    </div>
  );
};

export default Index;
