import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PremiumGateProps {
  children: React.ReactNode;
  onAction: () => void;
  featureName: string;
}

export const PremiumGate = ({ children, onAction, featureName }: PremiumGateProps) => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  const handleClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isPremium) {
      setShowDialog(true);
      return;
    }
    onAction();
  };

  return (
    <>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Recurso Premium
            </DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p>
                O <strong>{featureName}</strong> é um recurso exclusivo para assinantes premium.
              </p>
              <p>
                Para assinar, faça um PIX e envie o comprovante pelo WhatsApp:
              </p>
              <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
                <p className="font-bold text-foreground">📱 WhatsApp: (47) 99999-9999</p>
                <p className="font-bold text-foreground">💰 Valor: R$ 9,90/mês</p>
              </div>
              <p className="text-xs">
                Após a confirmação do pagamento, seu acesso será liberado em até 24h.
              </p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowDialog(false)} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold">
            Entendi
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
