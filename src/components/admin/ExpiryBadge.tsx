interface ExpiryBadgeProps {
  expiresAt: string | null;
}

export const ExpiryBadge = ({ expiresAt }: ExpiryBadgeProps) => {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return <span className="text-xs text-red-400 font-medium">Expirado</span>;
  if (diffDays === 1) return <span className="text-xs text-amber-400 font-medium">Expira em 1 dia</span>;
  return <span className="text-xs text-green-400 font-medium">Expira em {diffDays} dias</span>;
};
