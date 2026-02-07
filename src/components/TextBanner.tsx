import { ArrowRightCircle } from 'lucide-react';
import logo from '@/assets/logo-entregas-itajai.png';

interface TextBannerProps {
  imageUrl?: string;
  title: string;
  subtitle: string;
  link: string;
}

export const TextBanner = ({ title, subtitle, link }: TextBannerProps) => {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center p-3 rounded-lg border border-border bg-card gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary group"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-background flex items-center justify-center p-1">
        <img src={logo} alt="Entregas Itajaí" className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-bold text-primary text-sm">{title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <ArrowRightCircle className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
    </a>
  );
};
