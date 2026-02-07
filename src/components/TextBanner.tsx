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
      className="flex items-center justify-center gap-4 p-3 rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary group"
    >
      <div className="w-28 h-28 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
        <img src={logo} alt="Entregas Itajaí" className="w-full h-full object-cover" />
      </div>
      <p className="text-primary font-semibold text-sm group-hover:underline">Visite nosso Instagram</p>
    </a>
  );
};