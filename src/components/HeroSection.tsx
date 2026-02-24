import { useState, useEffect, useRef, TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import heroBg from '@/assets/hero-bg.jpg';

// Module-level flag: animations only play on first ever mount
let hasAnimated = false;

// Static fallback images
import product3 from '@/assets/products/product-3.png';
import tiesBlue from '@/assets/products/ties-blue.png';
import glassware from '@/assets/products/glassware.png';
import product8 from '@/assets/products/product-8.png';
import product10 from '@/assets/products/product-10.png';
import bpatcBuilding from '@/assets/products/bpatc-building.png';
import tunnelSouvenir from '@/assets/products/tunnel-souvenir.png';
import product9 from '@/assets/products/product-9.png';

const fallbackItems = [
  { img: product3, label: 'Crystal Awards', id: '' },
  { img: tiesBlue, label: 'Premium Ties', id: '' },
  { img: glassware, label: 'Custom Glassware', id: '' },
  { img: product8, label: 'Gift Sets', id: '' },
  { img: product10, label: 'Premium Souvenirs', id: '' },
  { img: bpatcBuilding, label: 'Model Replicas', id: '' },
  { img: tunnelSouvenir, label: 'Tunnel Souvenirs', id: '' },
  { img: product9, label: 'Executive Pens', id: '' },
];

const stats = [
  { value: '500+', label: 'Clients' },
  { value: '10+', label: 'Years' },
  { value: '1000+', label: 'Products' },
  { value: '50+', label: 'Countries' },
];

// Predefined scattered positions for 8 items in a boutique floating grid
const GRID_POSITIONS = [
  { x: '5%',  y: '2%',  size: 130, delay: 0 },
  { x: '55%', y: '0%',  size: 120, delay: 0.4 },
  { x: '28%', y: '8%',  size: 155, delay: 0.2 },
  { x: '72%', y: '15%', size: 115, delay: 0.6 },
  { x: '0%',  y: '48%', size: 120, delay: 0.3 },
  { x: '60%', y: '50%', size: 140, delay: 0.1 },
  { x: '22%', y: '60%', size: 110, delay: 0.5 },
  { x: '78%', y: '58%', size: 125, delay: 0.7 },
];

const HeroSection = () => {
  const { t, lang } = useLanguage();
  const { get } = useSiteSettings();
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  const isFirstLoad = !hasAnimated;

  useEffect(() => {
    if (!hasAnimated) hasAnimated = true;
  }, []);

  const anim = (delay: string) =>
    isFirstLoad ? { animation: `heroFadeUp 0.7s ${delay} ease-out both` } : {};

  const title = get('hero', 'title', t('hero.title'));
  const subtitle = get('hero', 'subtitle', t('hero.subtitle'));
  const ctaPrimary = get('hero', 'cta_primary', t('hero.cta'));

  // Fetch featured products from DB
  const { data: dbProducts } = useQuery({
    queryKey: ['hero-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_en, name_bn, image_url, product_code')
        .eq('is_active', true)
        .order('sort_order')
        .limit(8);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    initialData: [],
    placeholderData: (prev: any) => prev,
  });

  const carouselItems = dbProducts && dbProducts.length >= 4
    ? dbProducts.map(p => ({
        img: p.image_url || '',
        label: lang === 'en' ? p.name_en : (p.name_bn || p.name_en),
        id: p.id,
      }))
    : fallbackItems;


  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };
  const onTouchMove = (e: TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    // swipe navigates to catalog
    if (Math.abs(touchDelta.current) > 60) navigate('/catalog');
  };

  return (
    <section id="home" className="relative bg-foreground" style={{ overflow: 'clip' }}>
      <OptimizedImage src={heroBg} alt="" priority blurPlaceholder={false} className="absolute inset-0 w-full h-full object-cover opacity-20" wrapperClassName="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 via-foreground/70 to-primary/30" />

      <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[500px] lg:min-h-[560px]">

          {/* Left — Value Proposition */}
          <div className="flex flex-col justify-center" style={anim('0s')}>
            <span
              className="inline-flex items-center gap-2 text-primary-foreground/60 text-xs font-semibold tracking-[0.2em] uppercase mb-5"
              style={{ fontFamily: 'Montserrat, DM Sans, sans-serif' }}
            >
              <span className="w-8 h-px bg-primary" />
              S. M. Trade International
            </span>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5 text-white"
              style={anim('0.1s')}
            >
              {title}
            </h1>

            <p
              className="text-base md:text-lg text-white/60 mb-8 max-w-lg leading-relaxed"
              style={{ fontFamily: 'DM Sans, sans-serif', ...anim('0.2s') }}
            >
              {subtitle}
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4"
              style={anim('0.3s')}
            >
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base rounded-lg shadow-lg"
              >
                <a href="#contact">
                  <span className="flex items-center gap-2 font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {ctaPrimary}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 text-white bg-white/5 backdrop-blur-sm px-8 py-6 text-base rounded-lg hover:bg-white/10 hover:border-white/30"
              >
                <a href="#products">
                  <span className="font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {t('hero.contact')}
                  </span>
                </a>
              </Button>
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10"
              style={anim('0.5s')}
            >
              {stats.map(s => (
                <div key={s.label}>
                  <div className="text-white font-bold text-xl md:text-2xl" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.value}</div>
                  <div className="text-white/40 text-[10px] md:text-xs tracking-wider uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating Grid */}
          <div
            className="relative touch-pan-y"
            style={{ ...anim('0.4s'), minHeight: 420 }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-full bg-accent/6 blur-[100px] pointer-events-none" />

            {/* Floating product cards */}
            <div className="relative w-full" style={{ height: 420 }}>
              {carouselItems.slice(0, 8).map((item, i) => {
                const pos = GRID_POSITIONS[i];
                const isHovered = hoveredIdx === i;
                const isFaded = hoveredIdx !== null && !isHovered;

                return (
                  <div
                    key={i}
                    className="absolute cursor-pointer"
                    style={{
                      left: pos.x,
                      top: pos.y,
                      width: pos.size,
                      zIndex: isHovered ? 30 : 10,
                      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease, filter 0.4s ease, box-shadow 0.4s ease',
                      transform: isHovered
                        ? 'scale(1.25) translateY(-12px)'
                        : `translateY(${Math.sin(Date.now() / 1000 + i) * 0}px)`,
                      opacity: isFaded ? 0.35 : 1,
                      filter: isFaded ? 'blur(2px)' : 'none',
                      animation: `heroFloat ${3 + (i % 3)}s ${pos.delay}s ease-in-out infinite`,
                    }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => {
                      if (item.id) navigate(`/product/${item.id}`);
                      else navigate('/catalog');
                    }}
                  >
                    <div
                      className={`rounded-2xl overflow-hidden bg-white transition-shadow duration-500 ${
                        isHovered
                          ? 'shadow-[0_20px_60px_-10px_hsl(var(--sm-gold)/0.45)] ring-2 ring-accent/30'
                          : 'shadow-lg shadow-black/20 ring-1 ring-white/10'
                      }`}
                    >
                      <div className="p-2 flex items-center justify-center" style={{ height: pos.size * 0.85 }}>
                        <OptimizedImage
                          src={item.img}
                          alt={item.label}
                          className="w-full h-full object-contain"
                          sizes={`${pos.size}px`}
                          priority={i < 4}
                          blurPlaceholder={false}
                        />
                      </div>
                    </div>

                    {/* Label on hover */}
                    <div
                      className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-all duration-400 ${
                        isHovered
                          ? 'bg-accent text-accent-foreground opacity-100 translate-y-0 shadow-md shadow-accent/20'
                          : 'opacity-0 translate-y-2'
                      }`}
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
