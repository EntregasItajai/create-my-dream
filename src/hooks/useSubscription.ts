import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'premium' | 'user';

export const useSubscription = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, expires_at')
        .eq('user_id', user.id);

      if (!error && data) {
        const activeRoles = data.filter((r) => {
          if (r.expires_at) {
            return new Date(r.expires_at) > new Date();
          }
          return true;
        });
        setRoles(activeRoles.map((r) => r.role as AppRole));
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const isPremium = roles.includes('premium') || roles.includes('admin');
  const isAdmin = roles.includes('admin');

  return { roles, isPremium, isAdmin, loading };
};
