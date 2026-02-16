import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Gift, Monitor, Briefcase, GlassWater, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type CategoryFilter = 'all' | 'corporate' | 'office' | 'leather' | 'crystal';

const categories = [
  { icon: Gift, titleKey: 'categories.1.title', descKey: 'categories.1.desc', filter: 'corporate' as const },
  { icon: Monitor, titleKey: 'categories.2.title', descKey: 'categories.2.desc', filter: 'office' as const },
  { icon: Briefcase, titleKey: 'categories.3.title', descKey: 'categories.3.desc', filter: 'leather' as const },
  { icon: GlassWater, titleKey: 'categories.4.title', descKey: 'categories.4.desc', filter: 'crystal' as const },
];

const filterChips: { key: CategoryFilter; labelEn: string; labelBn: string }[] = [
  { key: 'all', labelEn: 'All Categories', labelBn: 'সব ক্যাটাগরি' },
  { key: 'corporate', labelEn: 'Corporate Gifts', labelBn: 'কর্পোরেট গিফট' },
  { key: 'office', labelEn: 'Office Accessories', labelBn: 'অফিস আনুষাঙ্গিক' },
  { key: 'leather', labelEn: 'Leather Products', labelBn: 'লেদার পণ্য' },
  { key: 'crystal', labelEn: 'Glass & Crystal', labelBn: 'গ্লাস ও ক্রিস্টাল' },
];

const ServicesSection = () => {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState<CategoryFilter>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = active === 'all' ? categories : categories.filter(c => c.filter === active);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('categories.title')}</h2>
        <div className="w-16 h-1 bg-sm-gold mx-auto mb-8 rounded" />

        {/* Filter Chips */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {filterChips.map(chip => (
            <button
              key={chip.key}
              onClick={() => setActive(chip.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                active === chip.key
                  ? 'bg-sm-red text-white shadow-md'
                  : 'bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {lang === 'en' ? chip.labelEn : chip.labelBn}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative group/carousel">
          {filtered.length > 3 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background shadow-lg border border-border flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background shadow-lg border border-border flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filtered.map((s, i) => (
              <Card
                key={`${s.filter}-${i}`}
                className="group hover-lift border-0 shadow-md hover:shadow-xl transition-all duration-300 snap-center shrink-0 w-[280px] md:w-[calc(25%-18px)]"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-sm-red/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-sm-red transition-colors duration-300">
                    <s.icon className="h-8 w-8 text-sm-red group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-lg mb-3" style={{ fontFamily: 'DM Sans, Noto Sans Bengali, sans-serif' }}>
                    {t(s.titleKey)}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(s.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
