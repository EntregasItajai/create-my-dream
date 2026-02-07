import { Settings, Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header = ({ onSettingsClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Bike className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Calculadora de Frete</h1>
            <p className="text-xs text-muted-foreground">Entregas Itajaí</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onSettingsClick}
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
