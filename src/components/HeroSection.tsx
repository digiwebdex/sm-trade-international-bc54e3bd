import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

import img1 from '@/assets/products/ties-blue.png';
import img2 from '@/assets/products/bpatc-building.png';
import img3 from '@/assets/products/product-4.png';
import img4 from '@/assets/products/glassware.png';
import img5 from '@/assets/products/tunnel-souvenir.png';
import img6 from '@/assets/products/product-5.png';

const showcaseProducts = [
  { src: img1, label: 'Customized Ties' },
  { src: img2, label: 'BPATC Project' },
  { src: img3, label: 'Custom Bags' },
  { src: img4, label: 'Deli Glassware' },
  { src: img5, label: 'Tunnel Souvenir' },
  { src: img6, label: 'Promotional Items' },
];

const HeroSection = () => {
  const { t } = useLanguage();
  const { get } = useSiteSettings();
  const bgRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const total = showcaseProducts.length;

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);

  useEffect(() => {
    const handleScroll = () => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(next, 3500);
    }
    return () => clearInterval(intervalRef.current);
  }, [isHovered, next]);

  const title = get('hero', 'title', t('hero.title'));
  const subtitle = get('hero', 'subtitle', t('hero.subtitle'));
  const ctaPrimary = get('hero', 'cta_primary', t('hero.cta'));

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax Background */}
      <div
        ref={bgRef}
        className="absolute inset-0 -top-20 -bottom-20 will-change-transform"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 3%) 0%, hsl(0 0% 8%) 35%, hsl(0 72% 14%) 70%, hsl(0 72% 22%) 100%)',
        }}
      />

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/6 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(0 72% 51% / 0.35) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(0 0% 100% / 0.1) 0%, transparent 70%)' }} />
      </div>

      {/* Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div className="animate-fade-in text-center lg:text-left">
            <div className="inline-block bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-5 py-2 rounded-full mb-8 tracking-widest uppercase border border-white/10">
              S.M. Trade International
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] mb-6 text-white">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-white/55 mb-10 max-w-xl leading-relaxed font-light">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-sm-red hover:bg-[hsl(var(--sm-red-dark))] text-white text-base px-10 py-6 rounded-lg shadow-lg shadow-red-900/40 group"
              >
                <a href="#contact">
                  {ctaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 text-base px-10 py-6 rounded-lg backdrop-blur-sm"
              >
                <a href="#products">{t('hero.contact')}</a>
              </Button>
            </div>
          </div>

          {/* Right: Product Carousel */}
          <div
            className="relative animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Glowing border frame */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl shadow-black/40">
              {/* Carousel viewport */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {showcaseProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="absolute inset-0 transition-all duration-700 ease-in-out"
                    style={{
                      opacity: idx === current ? 1 : 0,
                      transform: idx === current ? 'scale(1)' : 'scale(1.08)',
                    }}
                  >
                    <img
                      src={product.src}
                      alt={product.label}
                      className="w-full h-full object-cover"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                    {/* Bottom gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                ))}

                {/* Product label */}
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between z-10">
                  <p className="text-white font-semibold text-lg drop-shadow-lg">
                    {showcaseProducts[current].label}
                  </p>
                  <span className="text-white/60 text-sm font-mono tabular-nums">
                    {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Navigation arrows */}
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                aria-label="Previous product"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                aria-label="Next product"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-5">
              {showcaseProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === current ? 'w-8 bg-sm-red' : 'w-3 bg-white/25 hover:bg-white/40'
                  }`}
                  aria-label={`Go to product ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
