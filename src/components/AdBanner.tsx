interface AdBannerProps {
  width: number;
  height: number;
  className?: string;
  label?: string;
}

export const AdBanner = ({ width, height, className = '', label }: AdBannerProps) => {
  return (
    <div
      className={`flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/30 text-muted-foreground text-xs font-medium select-none ${className}`}
      style={{ width: '100%', maxWidth: width, height }}
    >
      {label || `Anúncio ${width}x${height}`}
    </div>
  );
};