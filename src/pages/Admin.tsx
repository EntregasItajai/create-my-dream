import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, AppRole } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, User, Loader2, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { UserRoleBadge } from '@/components/admin/UserRoleBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface UserWithRole {
  id: string;
  email: string;
  display_name: string | null;
  roles: AppRole[];
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
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
      .select('user_id, role');

    const rolesMap = new Map<string, AppRole[]>();
    allRoles?.forEach((r) => {
      const existing = rolesMap.get(r.user_id) || [];
      existing.push(r.role as AppRole);
      rolesMap.set(r.user_id, existing);
    });

    setUsers(
      profiles.map((p) => ({
        id: p.id,
        email: p.email,
        display_name: p.display_name,
        roles: rolesMap.get(p.id) || ['user'],
      }))
    );
    setLoading(false);
  };

  const requestRoleChange = (userId: string, newRole: AppRole) => {
    const u = users.find((x) => x.id === userId);
    const userName = u?.display_name || u?.email || 'este usuário';

    const roleLabels: Record<AppRole, string> = {
      admin: 'Admin',
      premium: 'Premium',
      user: 'Gratuito',
    };

    setConfirmAction({
      title: `Alterar para ${roleLabels[newRole]}?`,
      description: `Tem certeza que deseja alterar ${userName} para ${roleLabels[newRole]}?${newRole === 'user' ? ' Isso removerá todos os privilégios especiais.' : ''}`,
      confirmLabel: `Sim, alterar para ${roleLabels[newRole]}`,
      variant: newRole === 'admin' ? 'destructive' : 'default',
      onConfirm: () => executeRoleChange(userId, newRole),
    });
  };

  const executeRoleChange = async (userId: string, newRole: AppRole) => {
    setConfirmAction(null);
    setUpdating(userId);

    await supabase.from('user_roles').delete().eq('user_id', userId);

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

  const requestDeleteUser = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    const userName = u?.display_name || u?.email || 'este usuário';

    setConfirmAction({
      title: 'Excluir usuário?',
      description: `Tem certeza que deseja excluir ${userName}? Isso removerá o perfil e todas as permissões. Esta ação não pode ser desfeita.`,
      confirmLabel: 'Sim, excluir',
      variant: 'destructive',
      onConfirm: () => executeDeleteUser(userId),
    });
  };

  const executeDeleteUser = async (userId: string) => {
    setConfirmAction(null);
    setUpdating(userId);

    // Remove roles first, then profile
    await supabase.from('user_roles').delete().eq('user_id', userId);
    const { error } = await supabase.from('profiles').delete().eq('id', userId);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      setUpdating(null);
      return;
    }

    toast({ title: 'Excluído!', description: `Usuário ${userId.slice(0, 8)}... foi removido.` });
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
              <div key={u.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{u.display_name || 'Sem nome'}</p>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    <div className="mt-1.5">
                      <UserRoleBadge roles={u.roles} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {updating === u.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        {/* Revogar - shown for admin (except self) */}
                        {u.roles.includes('admin') && u.id !== user?.id && (
                          <Button size="sm" variant="outline" onClick={() => requestRoleChange(u.id, 'user')} className="text-xs font-bold">
                            <User className="w-3.5 h-3.5 mr-1" /> Revogar
                          </Button>
                        )}

                        {/* Admin button - not shown for admins or self */}
                        {!u.roles.includes('admin') && u.id !== user?.id && (
                          <Button size="sm" variant="outline" onClick={() => requestRoleChange(u.id, 'admin')} className="text-xs font-bold border-destructive/30 text-destructive hover:bg-destructive/10">
                            <Shield className="w-3.5 h-3.5 mr-1" /> Admin
                          </Button>
                        )}

                        {/* Delete button - not shown for self */}
                        {u.id !== user?.id && (
                          <Button size="sm" variant="outline" onClick={() => requestDeleteUser(u.id)} className="text-xs font-bold border-destructive/30 text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir
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
