interface WhatsAppLinkProps {
  text: string;
  link: string;
}

export const WhatsAppLink = ({ text, link }: WhatsAppLinkProps) => {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block text-foreground font-medium hover:text-primary transition-colors"
    >
      {text}
    </a>
  );
};
