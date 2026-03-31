import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/apiClient';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

const SPEED = 4000;

const ProductSlider = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const { data: dbProducts } = useQuery({
    queryKey: ['slider-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_en, name_bn, image_url, product_code, short_description_en, short_description_bn, categories(name_en, name_bn)')
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
    id: p.id,
    img: p.image_url || '',
    name: lang === 'en' ? p.name_en : (p.name_bn || p.name_en),
    desc: lang === 'en' ? (p.short_description_en || '') : (p.short_description_bn || p.short_description_en || ''),
    category: (p as any).categories
      ? (lang === 'en' ? (p as any).categories.name_en : ((p as any).categories.name_bn || (p as any).categories.name_en))
      : '',
    code: p.product_code,
  }));

  const len = items.length;

  const next = useCallback(() => { if (len > 1) setCurrent(c => (c + 1) % len); }, [len]);
  const prev = useCallback(() => { if (len > 1) setCurrent(c => (c - 1 + len) % len); }, [len]);

  useEffect(() => {
    if (paused || len < 2) return;
    timerRef.current = setInterval(next, SPEED);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused, len]);

  const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchEnd = (e: TouchEvent) => {
    const d = e.changedTouches[0].clientX - touchStartX.current;
    if (d > 50) prev(); else if (d < -50) next();
    setPaused(false);
  };

  if (len === 0) return null;

  const getIndex = (offset: number) => ((current + offset) % len + len) % len;

  // Show 5 cards: -2, -1, 0, +1, +2
  const positions = [
    { offset: -2, x: '-72%', scale: 0.55, z: 1, opacity: 0.3 },
    { offset: -1, x: '-36%', scale: 0.75, z: 5, opacity: 0.6 },
    { offset: 0,  x: '0%',   scale: 1,    z: 10, opacity: 1 },
    { offset: 1,  x: '36%',  scale: 0.75, z: 5, opacity: 0.6 },
    { offset: 2,  x: '72%',  scale: 0.55, z: 1, opacity: 0.3 },
  ];

  const centerItem = items[current];

  return (
    <section className="py-16 md:py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, hsl(var(--secondary)) 0%, hsl(var(--background)) 100%)' }}>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-accent text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {lang === 'en' ? 'Our Products' : 'আমাদের পণ্য'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {lang === 'en' ? 'Premium Collection' : 'প্রিমিয়াম কালেকশন'}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-accent/40" />
            <div className="w-2 h-2 rotate-45 bg-accent/70" />
            <div className="h-px w-12 bg-accent/40" />
          </div>
        </div>

        {/* Carousel */}
        <div
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Cards area */}
          <div className="relative h-[320px] sm:h-[380px] md:h-[420px] flex items-center justify-center">
            {positions.map(({ offset, x, scale, z, opacity }) => {
              const idx = getIndex(offset);
              const item = items[idx];
              const isCenter = offset === 0;
              const cardW = isCenter ? 260 : 200;
              const cardH = isCenter ? 340 : 260;

              return (
                <div
                  key={`${offset}-${idx}`}
                  className="absolute cursor-pointer"
                  style={{
                    width: cardW,
                    height: cardH,
                    left: '50%',
                    top: '50%',
                    marginLeft: -cardW / 2,
                    marginTop: -cardH / 2,
                    transform: `translateX(${x}) scale(${scale})`,
                    zIndex: z,
                    opacity,
                    transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  }}
                  onClick={() => {
                    if (isCenter) navigate(`/product/${item.id}`);
                    else if (offset < 0) prev();
                    else next();
                  }}
                >
                  <div
                    className="w-full h-full rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      background: 'hsl(var(--background))',
                      boxShadow: isCenter
                        ? '0 25px 60px -15px rgba(0,0,0,0.15), 0 0 0 1px hsl(var(--sm-gold) / 0.2)'
                        : '0 8px 25px -5px rgba(0,0,0,0.08), 0 0 0 1px hsl(var(--border) / 0.5)',
                      border: isCenter ? '2px solid hsl(var(--sm-gold) / 0.15)' : '1px solid hsl(var(--border) / 0.3)',
                    }}
                  >
                    {/* Gold top line for center */}
                    {isCenter && (
                      <div className="w-full h-[3px] shrink-0"
                        style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--sm-gold)), transparent)' }} />
                    )}

                    {/* Image */}
                    <div className="flex-1 p-4 flex items-center justify-center bg-white dark:bg-white/5">
                      <OptimizedImage
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        blurPlaceholder={false}
                      />
                    </div>

                    {/* Info — center card only */}
                    {isCenter && (
                      <div className="shrink-0 px-4 py-3 text-center"
                        style={{ borderTop: '1px solid hsl(var(--border) / 0.3)' }}>
                        {centerItem.category && (
                          <span className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-1">
                            {centerItem.category}
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-foreground truncate">
                          {centerItem.name}
                        </h3>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation bar */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button onClick={prev} aria-label="Previous"
              className="w-10 h-10 rounded-full border border-border bg-background hover:bg-accent flex items-center justify-center text-foreground/50 hover:text-foreground transition-all active:scale-90">
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {items.slice(0, Math.min(len, 12)).map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} aria-label={`Product ${i + 1}`}
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: i === current ? 24 : 8,
                    height: 8,
                    background: i === current
                      ? 'hsl(var(--sm-gold))'
                      : 'hsl(var(--border))',
                  }} />
              ))}
            </div>

            <button onClick={next} aria-label="Next"
              className="w-10 h-10 rounded-full border border-border bg-background hover:bg-accent flex items-center justify-center text-foreground/50 hover:text-foreground transition-all active:scale-90">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/catalog')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-border bg-background hover:bg-accent text-foreground transition-all duration-300 hover:scale-105"
            >
              {lang === 'en' ? 'View All Products' : 'সকল পণ্য দেখুন'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
