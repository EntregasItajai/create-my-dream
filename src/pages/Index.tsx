import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { FreightCalculator } from '@/components/FreightCalculator';
import { FreightResult } from '@/components/FreightResult';
import { WhatsAppLink } from '@/components/WhatsAppLink';
import { TextBanner } from '@/components/TextBanner';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';

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
  precoKm: 1.50,
  valorHora: 25.00,
  valorMinimo: 15.00,
  precoGasolina: 6.50,
  consumoMoto: 35,
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
}

const Index = () => {
  const { isDark, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('freightSettings', JSON.stringify(settings));
  }, [settings]);

  const handleCalculate = () => {
    const km = parseFloat(distance);
    const h = parseFloat(hours) || 0;
    const m = parseFloat(minutes) || 0;
    const totalMinutes = (h * 60) + m;

    if (isNaN(km) || km <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha a Distância.",
        variant: "destructive",
      });
      return;
    }

    if (totalMinutes <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o Tempo.",
        variant: "destructive",
      });
      return;
    }

    // Cálculo da Receita: (Km * PreçoKm) + (MinutosTotais * PreçoPorMinuto)
    const precoMinuto = settings.valorHora / 60;
    let valorBruto = (km * settings.precoKm) + (totalMinutes * precoMinuto);
    let minimoAplicado = false;

    if (valorBruto < settings.valorMinimo) {
      valorBruto = settings.valorMinimo;
      minimoAplicado = true;
    }

    // Cálculo dos Custos
    const litrosUsados = km / settings.consumoMoto;
    const custoCombustivel = litrosUsados * settings.precoGasolina;
    const custoManutencao = km * settings.manutencao;
    const custoDepreciacao = km * settings.depreciacao;
    const custoTotal = custoCombustivel + custoManutencao + custoDepreciacao;

    // Lucro Líquido
    const lucroLiquido = valorBruto - custoTotal;

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
    });

    toast({
      title: "Sucesso!",
      description: "Valor calculado com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSettingsClick={() => setSettingsOpen(true)} isDark={isDark} onToggleTheme={toggleTheme} />
      
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="space-y-6">
          {/* Link WhatsApp */}
          <WhatsAppLink 
            text="Solicite Orçamento no WhatsApp"
            link="https://wa.me/5547991508563?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento."
          />

          {/* Calculadora */}
          <FreightCalculator
            distance={distance}
            hours={hours}
            minutes={minutes}
            onDistanceChange={setDistance}
            onHoursChange={setHours}
            onMinutesChange={setMinutes}
            onCalculate={handleCalculate}
          />

          {/* Resultado */}
          {result && <FreightResult result={result} />}

          {/* Banner Rodapé */}
          <TextBanner 
            imageUrl="/placeholder.svg"
            title="VISITE NOSSO SITE OFICIAL"
            subtitle="Soluções logísticas completas para você."
            link="https://entregasitajai.com/"
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
