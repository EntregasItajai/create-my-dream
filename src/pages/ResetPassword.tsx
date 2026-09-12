import { FormEvent, useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { getAuthOrigin } from '@/lib/authUrls';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validRecovery, setValidRecovery] = useState(
    new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidRecovery(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Senhas diferentes', description: 'Digite a mesma senha nos dois campos.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: 'Não foi possível alterar', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Senha atualizada', description: 'Sua nova senha já pode ser usada.' });
    navigate('/', { replace: true });
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LockKeyhole className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-foreground">Definir nova senha</h1>
        <p className="mt-2 mb-6 text-sm text-center text-muted-foreground">
          {validRecovery ? 'Crie uma nova senha para sua conta.' : 'Abra esta página pelo link enviado ao seu e-mail.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nova senha"
            minLength={6}
            required
            disabled={!validRecovery || loading}
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirme a nova senha"
            minLength={6}
            required
            disabled={!validRecovery || loading}
          />
          <Button type="submit" className="w-full" disabled={!validRecovery || loading}>
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/auth')}>
            Voltar ao login
          </Button>
          {window.location.origin !== getAuthOrigin() && (
            <Button type="button" variant="link" className="w-full" asChild>
              <a href={`${getAuthOrigin()}/auth`}>Abrir no endereço oficial</a>
            </Button>
          )}
        </form>
      </section>
    </main>
  );
};

export default ResetPassword;