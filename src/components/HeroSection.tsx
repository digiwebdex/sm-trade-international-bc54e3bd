import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import heroBg from '@/assets/hero-bg.jpg';

let hasAnimated = false;
const SPEED = 4000;

const HeroSection = () => {
  const { t, lang } = useLanguage();
  const { get } = useSiteSettings();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  const isFirstLoad = !hasAnimated;

  useEffect(() => { if (!hasAnimated) hasAnimated = true; }, []);

  const anim = (delay: string) =>
    isFirstLoad ? { animation: `heroFadeUp 0.7s ${delay} ease-out both` } : {};

  const title = get('hero', 'title', t('hero.title'));
  const subtitle = get('hero', 'subtitle', t('hero.subtitle'));
  const ctaPrimary = get('hero', 'cta_primary', t('hero.cta'));

  const stats = [1, 2, 3, 4].map(n => ({
    value: get('hero', `stat${n}_value`, n === 1 ? '500+' : n === 2 ? '10+' : n === 3 ? '1000+' : '50+'),
    label: get('hero', `stat${n}_label`, n === 1 ? 'Clients' : n === 2 ? 'Years' : n === 3 ? 'Products' : 'Countries'),
  }));

  const { data: dbProducts } = useQuery({
    queryKey: ['hero-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_en, name_bn, image_url, product_code')
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const items = (dbProducts || []).map(p => ({
    img: p.image_url || '',
    label: lang === 'en' ? p.name_en : (p.name_bn || p.name_en),
    id: p.id,
  }));

  const len = items.length;
  const safeIdx = (i: number) => ((i % len) + len) % len;

  const next = useCallback(() => {
    if (len > 1) setCurrent(c => (c + 1) % len);
  }, [len]);
  const prev = useCallback(() => {
    if (len > 1) setCurrent(c => (c - 1 + len) % len);
  }, [len]);

  useEffect(() => {
    if (paused || len < 2) return;
    timerRef.current = setInterval(next, SPEED);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused, len]);

  const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchDelta.current = 0; setPaused(true); };
  const onTouchMove = (e: TouchEvent) => { touchDelta.current = e.touches[0].clientX - touchStartX.current; };
  const onTouchEnd = () => { if (touchDelta.current > 50) prev(); else if (touchDelta.current < -50) next(); setPaused(false); };

  // Coverflow card positions: left, center, right
  const getCardStyle = (position: 'left' | 'center' | 'right'): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f6f3 100%)',
      border: '1px solid rgba(255,255,255,0.6)',
      cursor: 'pointer',
    };

    switch (position) {
      case 'left':
        return {
          ...base,
          width: '140px', height: '180px',
          left: '0', top: '50%',
          transform: 'translateY(-50%) rotateY(25deg) scale(0.85)',
          boxShadow: '-10px 15px 40px -10px rgba(0,0,0,0.2)',
          zIndex: 1, opacity: 0.7,
          transformOrigin: 'right center',
        };
      case 'center':
        return {
          ...base,
          width: '220px', height: '280px',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%) rotateY(0deg) scale(1)',
          boxShadow: '0 30px 60px -15px rgba(0,0,0,0.25), 0 0 40px -10px hsl(var(--sm-gold) / 0.2)',
          zIndex: 10, opacity: 1,
        };
      case 'right':
        return {
          ...base,
          width: '140px', height: '180px',
          right: '0', top: '50%',
          transform: 'translateY(-50%) rotateY(-25deg) scale(0.85)',
          boxShadow: '10px 15px 40px -10px rgba(0,0,0,0.2)',
          zIndex: 1, opacity: 0.7,
          transformOrigin: 'left center',
        };
    }
  };

  const ProductCard = ({ idx, position }: { idx: number; position: 'left' | 'center' | 'right' }) => {
    const item = items[idx];
    if (!item) return null;
    return (
      <div
        style={getCardStyle(position)}
        onClick={() => {
          if (position === 'center') navigate(`/product/${item.id}`);
          else if (position === 'left') prev();
          else next();
        }}
      >
        {/* Corner accents for center card */}
        {position === 'center' && (
          <>
            <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-accent/30 rounded-tl-lg" />
            <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-accent/30 rounded-tr-lg" />
            <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 border-accent/30 rounded-bl-lg" />
            <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-accent/30 rounded-br-lg" />
          </>
        )}
        <div className="w-full h-full p-3 flex items-center justify-center">
          <OptimizedImage
            src={item.img} alt={item.label}
            className="w-full h-full object-contain drop-shadow-md"
            sizes={position === 'center' ? '220px' : '140px'}
            blurPlaceholder={false}
          />
        </div>
      </div>
    );
  };

  return (
    <section id="home" className="relative bg-foreground" style={{ overflow: 'clip' }}>
      <OptimizedImage src={heroBg} alt="" priority blurPlaceholder={false}
        className="absolute inset-0 w-full h-full object-cover opacity-20" wrapperClassName="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 via-foreground/70 to-primary/30" />

      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8 lg:pt-6 lg:pb-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[500px] lg:min-h-[560px]">

          {/* Left — Copy */}
          <div className="flex flex-col justify-center" style={anim('0s')}>
            <p className="text-xs uppercase tracking-[0.3em] text-accent/80 mb-3 font-medium"
              style={{ fontFamily: 'DM Sans, sans-serif', ...anim('0.05s') }}>
              S.M. Trade International
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5 text-white"
              style={anim('0.1s')}>{title}</h1>
            <p className="text-base md:text-lg text-white/60 mb-8 max-w-lg leading-relaxed"
              style={{ fontFamily: 'DM Sans, sans-serif', ...anim('0.2s') }}>{subtitle}</p>

            <div className="flex flex-col sm:flex-row gap-4" style={anim('0.3s')}>
              <Button asChild size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base rounded-lg shadow-lg">
                <a href="#contact">
                  <span className="flex items-center gap-2 font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {ctaPrimary}<ArrowRight className="w-5 h-5" />
                  </span>
                </a>
              </Button>
              <Button asChild variant="outline" size="lg"
                className="border-white/20 text-white bg-white/5 backdrop-blur-sm px-8 py-6 text-base rounded-lg hover:bg-white/10 hover:border-white/30">
                <a href="#products">
                  <span className="font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('hero.contact')}</span>
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10" style={anim('0.5s')}>
              {stats.map(s => (
                <div key={s.label}>
                  <div className="text-white font-bold text-xl md:text-2xl" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.value}</div>
                  <div className="text-white/40 text-[10px] md:text-xs tracking-wider uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Coverflow Slider */}
          {len > 0 && (
            <div
              className="relative flex flex-col items-center justify-center touch-pan-y"
              style={{ ...anim('0.4s'), perspective: '1000px' }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Ambient glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-accent/10 blur-[80px] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-40 h-40 rounded-full bg-primary/15 blur-[50px] pointer-events-none" />

              {/* Cards container */}
              <div className="relative w-full max-w-[420px] h-[300px] sm:h-[340px] mx-auto mb-4"
                style={{ transformStyle: 'preserve-3d' }}>
                {len >= 3 && <ProductCard idx={safeIdx(current - 1)} position="left" />}
                <ProductCard idx={safeIdx(current)} position="center" />
                {len >= 2 && <ProductCard idx={safeIdx(current + 1)} position="right" />}

                {/* Nav arrows */}
                <button onClick={prev}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white/50 hover:text-white hover:border-accent/50 hover:bg-accent/15 hover:scale-110 transition-all duration-300 z-20">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={next}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white/50 hover:text-white hover:border-accent/50 hover:bg-accent/15 hover:scale-110 transition-all duration-300 z-20">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Active product label */}
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold px-5 py-2 rounded-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-lg shadow-accent/30 transition-all duration-500"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {items[current]?.label}
                </div>
                <button onClick={() => setPaused(p => !p)}
                  className="w-9 h-9 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white/70 hover:border-accent/30 transition-all duration-300"
                  title={paused ? 'Play' : 'Pause'}>
                  {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Dots */}
              <div className="flex items-center gap-1.5 mt-4">
                {items.slice(0, Math.min(len, 12)).map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`rounded-full transition-all duration-500 ${
                      i === current ? 'w-6 h-2 bg-accent shadow-sm shadow-accent/40' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                    }`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
