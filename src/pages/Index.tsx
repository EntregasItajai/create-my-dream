import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { ManualCalculation } from '@/components/ManualCalculation';
import { AdBanner } from '@/components/AdBanner';
import { ResultDisplay } from '@/components/ResultDisplay';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';

interface Settings {
  taxaKm: number;
  taxaHora: number;
  precoGasolina: number;
  consumoMoto: number;
  depreciacao: number;
  manutencao: number;
}

const defaultSettings: Settings = {
  taxaKm: 0.50,
  taxaHora: 50.00,
  precoGasolina: 6.70,
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

const Index = () => {
  const { isDark, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [manualDistance, setManualDistance] = useState('');
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualResult, setManualResult] = useState<{ distance: number; duration: number } | null>(null);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('freightSettings', JSON.stringify(settings));
  }, [settings]);

  // Close settings drawer after 3 seconds on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettingsOpen(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleManualCalculate = () => {
    const distance = parseFloat(manualDistance);
    const hours = parseFloat(manualHours) || 0;
    const minutes = parseFloat(manualMinutes) || 0;
    const totalMinutes = (hours * 60) + minutes;

    if (isNaN(distance) || distance <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, informe uma distância válida.",
        variant: "destructive",
      });
      return;
    }

    if (totalMinutes <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, informe um tempo válido.",
        variant: "destructive",
      });
      return;
    }

    setManualResult({ distance, duration: totalMinutes });
    toast({
      title: "Sucesso!",
      description: "Frete calculado com sucesso.",
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          <ManualCalculation
            distance={manualDistance}
            hours={manualHours}
            minutes={manualMinutes}
            onDistanceChange={setManualDistance}
            onHoursChange={setManualHours}
            onMinutesChange={setManualMinutes}
            onCalculate={handleManualCalculate}
            isCalculating={false}
          />

          {/* Ad Banner */}
          <AdBanner />

          {/* Result Display */}
          {manualResult && (
            <ResultDisplay 
              totalDistance={manualResult.distance} 
              totalDuration={manualResult.duration}
              settings={settings} 
            />
          )}

          {/* Second Ad Banner */}
          <AdBanner />
        </div>
      </main>

      <footer className="py-6 text-center border-t border-border/50 mt-8">
        <p className="text-sm text-muted-foreground">
          © 2024 Entregas Itajaí - Soluções Logísticas
        </p>
      </footer>
    </div>
  );
};

export default Index;
