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
  const [sliding, setSliding] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const getIdx = (offset: number) => (current + offset + len) % len;

  const goTo = useCallback((dir: 'next' | 'prev') => {
    if (sliding || len < 2) return;
    setSliding(true);
    setTimeout(() => {
      setCurrent(prev => dir === 'next' ? (prev + 1) % len : (prev - 1 + len) % len);
      setSliding(false);
    }, 500);
  }, [sliding, len]);

  const next = useCallback(() => goTo('next'), [goTo]);
  const prev = useCallback(() => goTo('prev'), [goTo]);

  useEffect(() => {
    if (paused || len < 2) return;
    timerRef.current = setInterval(next, SPEED);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused, len]);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
    setPaused(true);
  };
  const onTouchMove = (e: TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (touchDelta.current > 50) prev();
    else if (touchDelta.current < -50) next();
    setPaused(false);
  };

  const cardStyle = (size: 'lg' | 'sm') => ({
    background: 'linear-gradient(145deg, #ffffff 0%, #f8f6f3 100%)',
    boxShadow: size === 'lg'
      ? '0 25px 60px -15px rgba(0,0,0,0.15), 0 10px 30px -10px rgba(0,0,0,0.1)'
      : '0 15px 40px -10px rgba(0,0,0,0.12), 0 5px 15px -5px rgba(0,0,0,0.08)',
    border: '1px solid rgba(255,255,255,0.6)',
  });

  const ProductCard = ({ idx, size, className = '' }: { idx: number; size: 'lg' | 'sm'; className?: string }) => {
    const item = items[idx];
    if (!item) return null;
    return (
      <div
        className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.03] ${className}`}
        style={cardStyle(size)}
        onClick={() => navigate(`/product/${item.id}`)}
      >
        <div className="relative w-full h-full p-4 flex items-center justify-center">
          <OptimizedImage
            src={item.img}
            alt={item.label}
            className="w-full h-full object-contain drop-shadow-md"
            sizes={size === 'lg' ? '280px' : '140px'}
            priority={idx < 3}
            blurPlaceholder={false}
          />
          {/* Label badge */}
          <div className="absolute bottom-2 left-2 right-2">
            <span
              className="inline-block text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full bg-accent/90 text-accent-foreground shadow-sm truncate max-w-full"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {item.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="home" className="relative bg-foreground" style={{ overflow: 'clip' }}>
      <OptimizedImage src={heroBg} alt="" priority blurPlaceholder={false} className="absolute inset-0 w-full h-full object-cover opacity-20" wrapperClassName="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 via-foreground/70 to-primary/30" />

      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8 lg:pt-6 lg:pb-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[500px] lg:min-h-[560px]">

          {/* Left — Value Proposition */}
          <div className="flex flex-col justify-center" style={anim('0s')}>
            <p className="text-xs uppercase tracking-[0.3em] text-accent/80 mb-3 font-medium" style={{ fontFamily: 'DM Sans, sans-serif', ...anim('0.05s') }}>
              S.M. Trade International
            </p>
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

            <div className="flex flex-col sm:flex-row gap-4" style={anim('0.3s')}>
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
            <div className="grid grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10" style={anim('0.5s')}>
              {stats.map(s => (
                <div key={s.label}>
                  <div className="text-white font-bold text-xl md:text-2xl" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.value}</div>
                  <div className="text-white/40 text-[10px] md:text-xs tracking-wider uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Multi-Product Slider */}
          {len > 0 && (
            <div
              className="relative flex flex-col items-center justify-center touch-pan-y"
              style={anim('0.4s')}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Ambient glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

              {/* Product grid: 1 large + 2 small stacked */}
              <div className="relative w-full max-w-[420px] mx-auto">
                <div className="grid grid-cols-5 gap-3 h-[320px] sm:h-[360px]">
                  {/* Large card — spans 3 cols */}
                  <div className="col-span-3 h-full">
                    <ProductCard idx={getIdx(0)} size="lg" className="h-full" />
                  </div>
                  {/* Two small cards stacked — spans 2 cols */}
                  <div className="col-span-2 flex flex-col gap-3 h-full">
                    <ProductCard idx={getIdx(1)} size="sm" className="flex-1" />
                    <ProductCard idx={getIdx(2)} size="sm" className="flex-1" />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white/50 hover:text-white hover:border-accent/50 hover:bg-accent/15 hover:scale-110 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-1.5">
                  {items.slice(0, Math.min(len, 10)).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (i !== current) {
                          setSliding(true);
                          setTimeout(() => { setCurrent(i); setSliding(false); }, 500);
                        }
                      }}
                      className={`rounded-full transition-all duration-500 ${
                        i === current
                          ? 'w-6 h-2 bg-accent shadow-sm shadow-accent/40'
                          : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white/50 hover:text-white hover:border-accent/50 hover:bg-accent/15 hover:scale-110 transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setPaused(p => !p)}
                  className="w-9 h-9 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white/70 hover:border-accent/30 transition-all duration-300"
                  title={paused ? 'Play' : 'Pause'}
                >
                  {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
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
