import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSettingsClick: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header = ({ onSettingsClick }: HeaderProps) => {
  return (
    <header className="w-full bg-card border-b border-border">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">ENTREGAS ITAJAÍ</h1>
            <p className="text-xs text-muted-foreground">Calculadora de Frete</p>
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
    </header>
  );
};
