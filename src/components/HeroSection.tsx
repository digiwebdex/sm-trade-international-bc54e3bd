import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/apiClient';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

const SPEED = 4000;

const HeroSection = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);

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
  const next = useCallback(() => { if (len > 1) setCurrent(c => (c + 1) % len); }, [len]);
  const prev = useCallback(() => { if (len > 1) setCurrent(c => (c - 1 + len) % len); }, [len]);

  useEffect(() => {
    if (paused || len < 2) return;
    timerRef.current = setInterval(next, SPEED);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused, len]);

  const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchDelta.current = 0; setPaused(true); };
  const onTouchMove = (e: TouchEvent) => { touchDelta.current = e.touches[0].clientX - touchStartX.current; };
  const onTouchEnd = () => { if (touchDelta.current > 50) prev(); else if (touchDelta.current < -50) next(); setPaused(false); };

  if (len === 0) {
    return (
      <section id="home" className="relative min-h-[420px] flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, hsl(var(--foreground)) 0%, #0f2040 100%)' }}>
        <div className="w-10 h-10 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </section>
    );
  }

  // Cube face size
  const cubeSize = 260;
  const halfCube = cubeSize / 2;
  // Rotation angle per face
  const faceAngle = 360 / len;
  // Cube rotation based on current index
  const rotateY = -current * faceAngle;
  // Translate Z so the cube face is at the right distance
  const tz = halfCube / Math.tan(Math.PI / len);

  return (
    <section id="home" className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, hsl(var(--foreground)) 0%, #0f2040 50%, hsl(var(--foreground)) 100%)' }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.06), transparent 70%)' }} />
      </div>

      <div
        className="relative z-10 flex flex-col items-center justify-center px-4 py-10 md:py-14 lg:py-16 touch-pan-y"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* 3D Cube Carousel */}
        <div
          className="relative mx-auto mb-2"
          style={{
            width: cubeSize,
            height: cubeSize + 60,
            perspective: '1000px',
            perspectiveOrigin: '50% 45%',
          }}
        >
          <div
            style={{
              width: cubeSize,
              height: cubeSize + 60,
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: `translateZ(-${tz}px) rotateY(${rotateY}deg)`,
              transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            {items.map((item, i) => {
              const angle = i * faceAngle;
              const isFront = i === current;

              return (
                <div
                  key={item.id}
                  className="absolute top-0 left-0 w-full h-full cursor-pointer backface-hidden"
                  style={{
                    width: cubeSize,
                    height: cubeSize + 60,
                    transform: `rotateY(${angle}deg) translateZ(${tz}px)`,
                    backfaceVisibility: 'hidden',
                  }}
                  onClick={() => {
                    if (isFront) navigate(`/product/${item.id}`);
                    else {
                      let diff = i - current;
                      if (diff > len / 2) diff -= len;
                      if (diff < -len / 2) diff += len;
                      if (diff > 0) setCurrent(i);
                      else setCurrent(i);
                    }
                  }}
                >
                  <div
                    className="w-full h-full rounded-2xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(160deg, #ffffff 0%, #f8f8f8 100%)',
                      boxShadow: '0 20px 50px -10px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Product image */}
                    <div className="w-full p-4 flex items-center justify-center" style={{ height: cubeSize }}>
                      <OptimizedImage
                        src={item.img}
                        alt={item.label}
                        className="w-full h-full object-contain drop-shadow-md"
                        blurPlaceholder={false}
                      />
                    </div>

                    {/* Product name */}
                    <div className="h-[60px] flex items-center justify-center border-t border-gray-100 px-3">
                      <span className="text-sm font-semibold text-gray-700 truncate text-center">
                        {item.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reflection / shadow below cube */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[200px] h-[20px] rounded-full bg-black/20 blur-xl" />
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-5 mt-6">
          <button onClick={prev} aria-label="Previous"
            className="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all duration-300">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {items.slice(0, Math.min(len, 12)).map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-500 ${
                  i === current
                    ? 'w-6 h-2 bg-white shadow-sm'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`} />
            ))}
          </div>

          <button onClick={next} aria-label="Next"
            className="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all duration-300">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
