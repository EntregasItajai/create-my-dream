import { Banner } from '@/hooks/useBanners';

interface AdBannerProps {
  width: number;
  height: number;
  className?: string;
  label?: string;
  banner?: Banner;
}

export const AdBanner = ({ width, height, className = '', label, banner }: AdBannerProps) => {
  if (banner) {
    const content = (
      <img
        src={banner.image_url}
        alt="Anúncio"
        loading="lazy"
        className="rounded-lg object-cover"
        style={{ width: '100%', maxWidth: width, height }}
      />
    );

    if (banner.link_url) {
      return (
        <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className={className}>
          {content}
        </a>
      );
    }

    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={`flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/30 text-muted-foreground text-xs font-medium select-none ${className}`}
      style={{ width: '100%', maxWidth: width, height }}
    >
      {label || '📢 Anuncie Aqui'}
    </div>
  );
};
