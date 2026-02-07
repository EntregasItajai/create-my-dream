interface ImageBannerProps {
  imageUrl: string;
  link: string;
  alt: string;
}

export const ImageBanner = ({ imageUrl, link, alt }: ImageBannerProps) => {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-200 hover:scale-[1.01] shadow-card"
    >
      <img 
        src={imageUrl} 
        alt={alt}
        className="w-full h-auto block"
      />
    </a>
  );
};
