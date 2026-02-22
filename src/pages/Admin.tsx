import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, AppRole } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Shield, Crown, User, Loader2, Clock, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface UserWithRole {
  id: string;
  email: string;
  display_name: string | null;
  roles: AppRole[];
  expires_at: string | null;
}

const PRESET_DAYS = [
  { label: '24h (teste)', days: 1 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: '180 dias', days: 180 },
  { label: '365 dias', days: 365 },
];

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [premiumDialog, setPremiumDialog] = useState<{ userId: string; userName: string } | null>(null);
  const [customDays, setCustomDays] = useState('');

  useEffect(() => {
    if (!authLoading && !subLoading) {
      if (!user || !isAdmin) {
        navigate('/');
        return;
      }
      fetchUsers();
    }
  }, [user, isAdmin, authLoading, subLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .order('created_at', { ascending: false });

    if (pErr || !profiles) {
      toast({ title: 'Erro', description: 'Não foi possível carregar usuários.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { data: allRoles } = await supabase
      .from('user_roles')
      .select('user_id, role, expires_at');

    const rolesMap = new Map<string, { roles: AppRole[]; expires_at: string | null }>();
    allRoles?.forEach((r) => {
      const existing = rolesMap.get(r.user_id) || { roles: [], expires_at: null };
      existing.roles.push(r.role as AppRole);
      if (r.role === 'premium' && r.expires_at) {
        existing.expires_at = r.expires_at;
      }
      rolesMap.set(r.user_id, existing);
    });

    setUsers(
      profiles.map((p) => {
        const data = rolesMap.get(p.id);
        return {
          id: p.id,
          email: p.email,
          display_name: p.display_name,
          roles: data?.roles || ['user'],
          expires_at: data?.expires_at || null,
        };
      })
    );
    setLoading(false);
  };

  const setPremiumWithDays = async (userId: string, days: number) => {
    setUpdating(userId);
    setPremiumDialog(null);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // Remove existing non-admin roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role', ['premium', 'user']);

    const { error } = await supabase.from('user_roles').insert({
      user_id: userId,
      role: 'premium',
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Premium ativado!', description: `Acesso liberado por ${days} dia(s).` });
    }
    await fetchUsers();
    setUpdating(null);
  };

  const setRole = async (userId: string, newRole: AppRole) => {
    if (newRole === 'premium') {
      const u = users.find((x) => x.id === userId);
      setPremiumDialog({ userId, userName: u?.display_name || u?.email || userId });
      return;
    }

    setUpdating(userId);

    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role', ['premium', 'user']);

    if (newRole === 'admin') {
      await supabase.from('user_roles').delete().eq('user_id', userId);
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
        setUpdating(null);
        return;
      }
    } else {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole });
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
        setUpdating(null);
        return;
      }
    }

    toast({ title: 'Atualizado!', description: `Usuário alterado para ${newRole}.` });
    await fetchUsers();
    setUpdating(null);
  };

  const formatExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return <span className="text-xs text-red-400 font-medium">Expirado</span>;
    if (diffDays === 1) return <span className="text-xs text-amber-400 font-medium">Expira em 1 dia</span>;
    return <span className="text-xs text-green-400 font-medium">Expira em {diffDays} dias</span>;
  };

  const getRoleBadge = (roles: AppRole[]) => {
    if (roles.includes('admin')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          <Shield className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (roles.includes('premium')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Crown className="w-3 h-3" /> Premium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
        <User className="w-3 h-3" /> Gratuito
      </span>
    );
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full bg-card border-b border-border">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Painel Admin
                </h1>
                <p className="text-xs text-muted-foreground">{users.length} usuários cadastrados</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {u.display_name || 'Sem nome'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    {getRoleBadge(u.roles)}
                    {u.roles.includes('premium') && formatExpiry(u.expires_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {updating === u.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      {!u.roles.includes('premium') && !u.roles.includes('admin') && (
                        <Button
                          size="sm"
                          onClick={() => setRole(u.id, 'premium')}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                        >
                          <Crown className="w-3.5 h-3.5 mr-1" />
                          Premium
                        </Button>
                      )}
                      {!u.roles.includes('user') && !u.roles.includes('admin') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRole(u.id, 'user')}
                          className="text-xs font-bold"
                        >
                          <User className="w-3.5 h-3.5 mr-1" />
                          Revogar
                        </Button>
                      )}
                      {!u.roles.includes('admin') && u.id !== user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRole(u.id, 'admin')}
                          className="text-xs font-bold border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Shield className="w-3.5 h-3.5 mr-1" />
                          Admin
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-10">Nenhum usuário cadastrado ainda.</p>
            )}
          </div>
        )}
      </main>

      {/* Dialog para escolher duração do premium */}
      <Dialog open={!!premiumDialog} onOpenChange={(open) => !open && setPremiumDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Definir período Premium
            </DialogTitle>
            <DialogDescription className="text-left pt-1">
              Escolha a duração do acesso para <strong>{premiumDialog?.userName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            {PRESET_DAYS.map((preset) => (
              <Button
                key={preset.days}
                variant="outline"
                onClick={() => premiumDialog && setPremiumWithDays(premiumDialog.userId, preset.days)}
                className="text-sm font-semibold"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Input
              type="number"
              placeholder="Dias personalizados"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              min={1}
              className="flex-1"
            />
            <Button
              onClick={() => {
                const d = parseInt(customDays);
                if (!d || d < 1) {
                  toast({ title: 'Erro', description: 'Informe um número válido de dias.', variant: 'destructive' });
                  return;
                }
                if (premiumDialog) setPremiumWithDays(premiumDialog.userId, d);
                setCustomDays('');
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              Ativar
            </Button>
          </div>

          <Button variant="ghost" onClick={() => setPremiumDialog(null)} className="w-full text-muted-foreground">
            Cancelar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
