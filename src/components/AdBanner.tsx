import { Megaphone } from 'lucide-react';

export const AdBanner = () => {
  return (
    <div className="w-full p-4 rounded-xl bg-gradient-to-r from-muted/80 to-muted/40 border border-border/50 flex items-center justify-center gap-3">
      <Megaphone className="w-5 h-5 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Espaço para publicidade</span>
    </div>
  );
};
