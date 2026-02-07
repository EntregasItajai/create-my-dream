import logo from '@/assets/logo-entregas-itajai.png';

interface TextBannerProps {
  link: string;
}

export const TextBanner = ({ link }: TextBannerProps) => {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center justify-center p-4 rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary"
    >
      <div className="w-60 h-60 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
        <img src={logo} alt="Entregas Itajaí" className="w-full h-full object-cover" />
      </div>
    </a>
  );
};