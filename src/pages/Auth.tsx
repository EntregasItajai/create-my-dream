import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, UserPlus, LogIn, ArrowLeft, Truck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthCallbackUrl, getAuthOrigin, getPasswordResetUrl } from '@/lib/authUrls';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const locationState = location.state as { from?: string } | null;
  const queryReturnTo = new URLSearchParams(location.search).get('returnTo');
  const returnTo = locationState?.from === '/admin' || queryReturnTo === '/admin' ? '/admin' : '/';

  useEffect(() => {
    if (!authLoading && user) navigate(returnTo, { replace: true });
  }, [authLoading, navigate, returnTo, user]);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(location.search);
    const oauthError = hash.get('error_description') || query.get('error_description');

    if (!oauthError) return;

    toast({
      title: 'Não foi possível entrar com Google',
      description: decodeURIComponent(oauthError.replace(/\+/g, ' ')),
      variant: 'destructive',
    });
  }, [location.search]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const invalidCredentials = error.message.toLowerCase().includes('invalid login credentials');
        toast({
          title: 'Não foi possível entrar',
          description: invalidCredentials
            ? 'Se sua conta foi criada pelo Google, use “Entrar com Google”. Caso contrário, confira a senha ou recupere o acesso.'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
        navigate(returnTo, { replace: true });
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: getAuthCallbackUrl(returnTo) },
      });
      if (error) {
        toast({ title: 'Erro no cadastro', description: error.message, variant: 'destructive' });
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          title: 'E-mail já cadastrado',
          description: 'Este e-mail já possui uma conta. Tente fazer login.',
          variant: 'destructive',
        });
      } else if (data.user) {
        toast({
          title: 'Cadastro realizado!',
          description: data.session
            ? 'Conta criada com sucesso! Você já está logado.'
            : 'Verifique seu e-mail para confirmar a conta antes de fazer login.',
        });
        if (data.session) {
          navigate(returnTo, { replace: true });
        }
      } else {
        toast({ title: 'Erro inesperado', description: 'Nenhum usuário retornado. Tente novamente.', variant: 'destructive' });
      }
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetUrl(),
    });
    setLoading(false);

    if (error) {
      toast({ title: 'Não foi possível enviar', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Confira seu e-mail', description: 'Enviamos um link para você criar uma nova senha.' });
    setForgotPassword(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAuthCallbackUrl(returnTo) },
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-secondary tracking-tight">ENTREGAS ITAJAÍ</h1>
          <p className="text-primary font-semibold mt-2 text-sm tracking-wide uppercase">
            Entre para acessar todas as ferramentas
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-5 shadow-lg shadow-black/20">
          <p className="text-center text-sm text-muted-foreground">
            {forgotPassword
              ? 'Informe seu e-mail para recuperar o acesso'
              : isLogin ? 'Entre na sua conta para continuar' : 'Crie sua conta gratuitamente'}
          </p>

          {/* Google button — prominent */}
          {!forgotPassword && <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 font-bold text-base border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Aguarde...' : 'Entrar com Google'}
          </Button>}

          {/* Divider */}
          {!forgotPassword && <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">ou use seu e-mail</span>
            </div>
          </div>}

          {/* Email/password form */}
          <form onSubmit={forgotPassword ? handlePasswordReset : handleAuth} className="space-y-4">
            {!forgotPassword && <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-primary ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>}

            {isLogin && !forgotPassword && (
              <button
                type="button"
                onClick={() => setForgotPassword(true)}
                className="block ml-auto text-sm font-semibold text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-primary ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              {loading ? (
                'Aguarde...'
              ) : forgotPassword ? (
                'ENVIAR LINK'
              ) : isLogin ? (
                <span className="flex items-center gap-2"><LogIn className="w-5 h-5" /> ENTRAR</span>
              ) : (
                <span className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> CADASTRAR</span>
              )}
            </Button>
          </form>

          {!forgotPassword ? <p className="text-center text-sm text-muted-foreground">
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p> : (
            <button
              type="button"
              onClick={() => setForgotPassword(false)}
              className="block mx-auto text-sm font-bold text-primary hover:underline"
            >
              Voltar ao login
            </button>
          )}
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-5 mx-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o início
        </button>
      </div>
    </div>
  );
};

export default Auth;
