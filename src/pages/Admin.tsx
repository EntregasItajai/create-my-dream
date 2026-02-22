import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, AppRole } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Crown, User, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

  const setRole = async (userId: string, newRole: AppRole) => {
    setUpdating(userId);

    // Remove existing non-admin roles (keep admin if setting premium)
    const { error: delErr } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role', ['premium', 'user']);

    if (delErr) {
      toast({ title: 'Erro', description: delErr.message, variant: 'destructive' });
      setUpdating(null);
      return;
    }

    if (newRole === 'admin') {
      // Remove all first, then add admin
      await supabase.from('user_roles').delete().eq('user_id', userId);
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
        setUpdating(null);
        return;
      }
    } else {
      // Insert new role
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
      {/* Header */}
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
                  <div className="mt-1.5">{getRoleBadge(u.roles)}</div>
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
    </div>
  );
};

export default Admin;
