import { Lock, MessageCircle } from 'lucide-react';
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

const WHATSAPP_LINK = 'https://wa.me/5547991508563?text=Ol%C3%A1%21+Gostaria+de+solicitar+o+acesso+Premium+para+a+Calculadora+Itaja%C3%AD.';

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
      navigate('/auth', { state: { premiumRedirect: true } });
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
                Solicite seu acesso agora mesmo pelo WhatsApp e comece a usar em minutos!
              </p>
              <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
                <p className="font-bold text-foreground">💰 A partir de R$ 9,90/mês</p>
                <p className="text-muted-foreground">Acesso liberado em até 24h após confirmação</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              asChild
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-base h-12"
            >
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                Solicitar acesso premium!
              </a>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDialog(false)}
              className="w-full text-muted-foreground font-medium"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
