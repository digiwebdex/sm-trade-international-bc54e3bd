import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

const HeroSection = () => {
  const { t } = useLanguage();
  const { get } = useSiteSettings();
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (bgRef.current) {
        const scrollY = window.scrollY;
        bgRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const title = get('hero', 'title', t('hero.title'));
  const subtitle = get('hero', 'subtitle', t('hero.subtitle'));
  const ctaPrimary = get('hero', 'cta_primary', t('hero.cta'));
  const ctaSecondary = get('hero', 'cta_secondary', t('hero.contact'));

  return (
    <section id="home" className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 -top-20 -bottom-20 will-change-transform"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 4%) 0%, hsl(0 0% 10%) 40%, hsl(0 72% 18%) 75%, hsl(0 72% 28%) 100%)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(0 72% 51% / 0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/6 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(0 72% 51% / 0.3) 0%, transparent 70%)' }} />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 py-28 md:py-40 relative z-10">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="inline-block bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-5 py-2 rounded-full mb-8 tracking-widest uppercase border border-white/10">
            S.M. Trade International
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] mb-7 text-white">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-sm-red hover:bg-[hsl(var(--sm-red-dark))] text-white text-base px-10 py-6 rounded-lg shadow-lg shadow-red-900/30">
              <a href="#contact">{ctaPrimary}</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 text-base px-10 py-6 rounded-lg backdrop-blur-sm">
              <a href="#products">{ctaSecondary}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
