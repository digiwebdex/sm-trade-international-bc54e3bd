import { Phone, MessageCircle, MapPin } from 'lucide-react';

const MobileBottomBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="grid grid-cols-3 h-14">
        <a
          href="tel:+8801867666888"
          className="flex flex-col items-center justify-center gap-0.5 text-foreground hover:text-[hsl(var(--sm-red))] transition-colors"
        >
          <Phone className="h-5 w-5" />
          <span className="text-[10px] font-medium">Call</span>
        </a>
        <a
          href="https://wa.me/8801867666888"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 text-[hsl(142,70%,40%)] hover:text-[hsl(142,70%,35%)] transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[10px] font-medium">WhatsApp</span>
        </a>
        <a
          href="https://maps.google.com/?q=23.7104,90.4074"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 text-foreground hover:text-[hsl(var(--sm-red))] transition-colors"
        >
          <MapPin className="h-5 w-5" />
          <span className="text-[10px] font-medium">Location</span>
        </a>
      </div>
    </div>
  );
};

export default MobileBottomBar;
