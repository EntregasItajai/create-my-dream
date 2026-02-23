import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'premium' | 'user';

export const useSubscription = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async (userId: string) => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('[useSubscription] Error fetching roles:', error.message);
      setRoles([]);
    } else if (data) {
      const mapped = data.map((r) => r.role as AppRole);
      setRoles(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    fetchRoles(user.id);
  }, [user, authLoading, fetchRoles]);

  const isPremium = roles.includes('premium') || roles.includes('admin');
  const isAdmin = roles.includes('admin');

  return { roles, isPremium, isAdmin, loading, refetchRoles: () => user && fetchRoles(user.id) };
};
