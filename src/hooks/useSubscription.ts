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
    console.log('[useSubscription] Fetching roles for user:', userId);
    
    let data: { role: string; expires_at?: string | null }[] | null = null;
    let error: any = null;

    const result1 = await supabase
      .from('user_roles')
      .select('role, expires_at')
      .eq('user_id', userId);

    if (result1.error && result1.error.code === '42703') {
      console.log('[useSubscription] expires_at column not found, querying without it');
      const result2 = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      data = result2.data;
      error = result2.error;
    } else {
      data = result1.data;
      error = result1.error;
    }

    console.log('[useSubscription] Result:', { data, error });

    if (error) {
      console.error('[useSubscription] Error fetching roles:', error.message);
      setRoles([]);
    } else if (data) {
      const activeRoles = data.filter((r) => {
        if (r.expires_at) {
          return new Date(r.expires_at) > new Date();
        }
        return true;
      });
      const mapped = activeRoles.map((r) => r.role as AppRole);
      console.log('[useSubscription] Active roles:', mapped);
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
