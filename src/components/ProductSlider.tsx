import { useState, useEffect, useRef, TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/apiClient';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

const ProductSlider = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [angle, setAngle] = useState(0);
  const [paused, setPaused] = useState(false);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const touchStartX = useRef(0);
  const speedRef = useRef(0.012);

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
  }));

  const len = items.length;

  // Find front item
  const getFrontIndex = () => {
    if (len === 0) return 0;
    let bestIdx = 0;
    let bestZ = -Infinity;
    for (let i = 0; i < len; i++) {
      const rad = (((360 / len) * i + angle) * Math.PI) / 180;
      const z = Math.cos(rad);
      if (z > bestZ) { bestZ = z; bestIdx = i; }
    }
    return bestIdx;
  };

  const frontIndex = getFrontIndex();
  const frontItem = items[frontIndex] || null;

  // Continuous rotation
  useEffect(() => {
    if (paused || len < 2) return;
    const animate = (time: number) => {
      if (lastTimeRef.current) {
        const delta = time - lastTimeRef.current;
        setAngle(prev => (prev + speedRef.current * delta) % 360);
      }
      lastTimeRef.current = time;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = 0;
    };
  }, [paused, len]);

  const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchMove = (e: TouchEvent) => {
    const delta = e.touches[0].clientX - touchStartX.current;
    setAngle(prev => prev - delta * 0.15);
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => { setPaused(false); };

  if (len === 0) return null;

  const radius = 280;
  const cardW = 150;
  const cardH = 190;

  return (
    <section className="py-16 md:py-20 bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'radial-gradient(hsl(var(--sm-gold)) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-8">
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

        {/* Main layout: info left, 3D carousel right */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 max-w-6xl mx-auto">

          {/* Left: product info */}
          <div className="flex-1 text-center md:text-left order-2 md:order-1 min-w-0">
            {frontItem && (
              <div key={frontItem.id}>
                {frontItem.category && (
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase mb-3 bg-primary/10 text-primary">
                    {frontItem.category}
                  </span>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {frontItem.name}
                </h3>
                {frontItem.desc && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3 max-w-sm mx-auto md:mx-0">
                    {frontItem.desc}
                  </p>
                )}
                <button
                  onClick={() => navigate(`/product/${frontItem.id}`)}
                  className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 bg-primary text-primary-foreground"
                >
                  {lang === 'en' ? 'View Details' : 'বিস্তারিত দেখুন'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3 mt-6 justify-center md:justify-start">
              <button
                onClick={() => setAngle(a => a - 360 / len)}
                aria-label="Previous"
                className="w-10 h-10 rounded-full border border-border bg-background hover:bg-accent flex items-center justify-center text-foreground/60 hover:text-foreground transition-all active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPaused(p => !p)}
                className="px-4 py-2 rounded-full border border-border bg-background hover:bg-accent text-xs font-medium text-foreground/60 hover:text-foreground transition-all"
              >
                {paused ? '▶ Play' : '⏸ Pause'}
              </button>
              <button
                onClick={() => setAngle(a => a + 360 / len)}
                aria-label="Next"
                className="w-10 h-10 rounded-full border border-border bg-background hover:bg-accent flex items-center justify-center text-foreground/60 hover:text-foreground transition-all active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: 3D circular carousel */}
          <div
            className="flex-1 order-1 md:order-2 relative w-full max-w-lg h-[300px] sm:h-[340px] md:h-[380px] flex items-center justify-center touch-pan-y"
            style={{ perspective: '900px' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {items.map((item, i) => {
              const itemAngle = (360 / len) * i + angle;
              const rad = (itemAngle * Math.PI) / 180;
              const x = Math.sin(rad) * radius;
              const z = Math.cos(rad) * radius;
              const depthNorm = (z + radius) / (2 * radius);
              const scale = 0.45 + depthNorm * 0.55;
              const opacity = 0.15 + depthNorm * 0.85;
              const zIndex = Math.round(depthNorm * 100);
              const blurVal = depthNorm < 0.25 ? `blur(${Math.round((0.25 - depthNorm) * 6)}px)` : 'none';
              const isFront = i === frontIndex;

              return (
                <div
                  key={item.id}
                  className="absolute cursor-pointer"
                  style={{
                    width: cardW,
                    height: cardH,
                    left: '50%',
                    top: '50%',
                    marginLeft: -cardW / 2,
                    marginTop: -cardH / 2,
                    transform: `translateX(${x}px) scale(${scale})`,
                    opacity,
                    zIndex,
                    filter: blurVal,
                  }}
                  onClick={() => { if (isFront) navigate(`/product/${item.id}`); }}
                >
                  <div
                    className="w-full h-full rounded-2xl overflow-hidden bg-background"
                    style={{
                      boxShadow: isFront
                        ? '0 20px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px hsl(var(--sm-gold) / 0.25)'
                        : '0 6px 20px -4px rgba(0,0,0,0.1), 0 0 0 1px hsl(var(--border) / 0.5)',
                    }}
                  >
                    <div className="w-full h-full p-3 flex items-center justify-center">
                      <OptimizedImage
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        blurPlaceholder={false}
                      />
                    </div>
                    {isFront && (
                      <div className="absolute bottom-0 left-0 w-full h-[3px]"
                        style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--sm-gold)), transparent)' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* View all */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/catalog')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-border bg-background hover:bg-accent text-foreground transition-all duration-300 hover:scale-105"
          >
            {lang === 'en' ? 'View All Products' : 'সকল পণ্য দেখুন'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
