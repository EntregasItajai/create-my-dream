import { ArrowRightCircle } from 'lucide-react';

interface TextBannerProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string;
}

export const TextBanner = ({ imageUrl, title, subtitle, link }: TextBannerProps) => {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center p-4 rounded-lg border border-border bg-card gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary group"
    >
      <img 
        src={imageUrl} 
        alt="Logo"
        className="w-12 h-12 rounded object-cover bg-background border border-border"
      />
      <div className="flex-1 text-left">
        <p className="font-bold text-primary text-sm">{title}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <ArrowRightCircle className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
    </a>
  );
};
