import { Shield, Crown, User } from 'lucide-react';
import { AppRole } from '@/hooks/useSubscription';

interface UserRoleBadgeProps {
  roles: AppRole[];
}

export const UserRoleBadge = ({ roles }: UserRoleBadgeProps) => {
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
