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
import { UserRoleBadge } from '@/components/admin/UserRoleBadge';
import { ExpiryBadge } from '@/components/admin/ExpiryBadge';
import { ExpiryDatePicker } from '@/components/admin/ExpiryDatePicker';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

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
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    confirmLabel: string;
    variant?: 'default' | 'destructive';
  } | null>(null);

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

    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role', ['premium', 'user', 'admin']);

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

  const updateExpiryDate = async (userId: string, date: Date) => {
    setUpdating(userId);
    const { error } = await supabase
      .from('user_roles')
      .update({ expires_at: date.toISOString() })
      .eq('user_id', userId)
      .eq('role', 'premium');

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Data atualizada!', description: `Expiração alterada para ${date.toLocaleDateString('pt-BR')}.` });
    }
    await fetchUsers();
    setUpdating(null);
  };

  const requestRoleChange = (userId: string, newRole: AppRole) => {
    const u = users.find((x) => x.id === userId);
    const userName = u?.display_name || u?.email || 'este usuário';

    if (newRole === 'premium') {
      setPremiumDialog({ userId, userName });
      return;
    }

    const roleLabels: Record<AppRole, string> = {
      admin: 'Admin',
      premium: 'Premium',
      user: 'Gratuito',
    };

    setConfirmAction({
      title: `Alterar para ${roleLabels[newRole]}?`,
      description: `Tem certeza que deseja alterar ${userName} para ${roleLabels[newRole]}? ${newRole === 'user' ? 'Isso removerá todos os privilégios especiais.' : ''}`,
      confirmLabel: `Sim, alterar para ${roleLabels[newRole]}`,
      variant: newRole === 'admin' ? 'destructive' : 'default',
      onConfirm: () => executeRoleChange(userId, newRole),
    });
  };

  const executeRoleChange = async (userId: string, newRole: AppRole) => {
    setConfirmAction(null);
    setUpdating(userId);

    // Delete all existing roles for this user
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (newRole !== 'user') {
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
                className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {u.display_name || 'Sem nome'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <UserRoleBadge roles={u.roles} />
                      {u.roles.includes('premium') && <ExpiryBadge expiresAt={u.expires_at} />}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {updating === u.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        {/* Show date picker for premium users */}
                        {u.roles.includes('premium') && (
                          <ExpiryDatePicker
                            currentDate={u.expires_at}
                            onDateChange={(date) => updateExpiryDate(u.id, date)}
                          />
                        )}

                        {/* Premium button - shown for non-premium, non-admin */}
                        {!u.roles.includes('premium') && !u.roles.includes('admin') && (
                          <Button
                            size="sm"
                            onClick={() => requestRoleChange(u.id, 'premium')}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                          >
                            <Crown className="w-3.5 h-3.5 mr-1" />
                            Premium
                          </Button>
                        )}

                        {/* Revogar (set to user) - shown for premium OR admin (except self) */}
                        {(u.roles.includes('premium') || (u.roles.includes('admin') && u.id !== user?.id)) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => requestRoleChange(u.id, 'user')}
                            className="text-xs font-bold"
                          >
                            <User className="w-3.5 h-3.5 mr-1" />
                            Revogar
                          </Button>
                        )}

                        {/* Admin button - not shown for admins or self */}
                        {!u.roles.includes('admin') && u.id !== user?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => requestRoleChange(u.id, 'admin')}
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

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        onConfirm={confirmAction?.onConfirm || (() => {})}
        confirmLabel={confirmAction?.confirmLabel}
        variant={confirmAction?.variant}
      />
    </div>
  );
};

export default Admin;
