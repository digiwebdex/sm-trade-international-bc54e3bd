import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Gift, Monitor, Briefcase, GlassWater } from 'lucide-react';
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

  const filtered = active === 'all' ? categories : categories.filter(c => c.filter === active);

  return (
    <section id="services" className="py-24">
      <div className="container mx-auto px-4">
        {/* Header with gold accents */}
        <div className="text-center mb-14">
          <span
            className="inline-block text-accent text-sm font-semibold tracking-widest uppercase mb-3"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {lang === 'en' ? 'What We Offer' : 'আমরা যা অফার করি'}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-5">
            {t('categories.title')}
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-accent/40" />
            <div className="w-2 h-2 rounded-full bg-accent" />
            <div className="h-px w-12 bg-accent/40" />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {filterChips.map(chip => (
            <button
              key={chip.key}
              onClick={() => setActive(chip.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                active === chip.key
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-foreground hover:bg-primary/10 hover:text-primary'
              }`}
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {lang === 'en' ? chip.labelEn : chip.labelBn}
            </button>
          ))}
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((s, i) => (
            <div
              key={`${s.filter}-${i}`}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gold top accent — expands on hover */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-accent group-hover:w-full transition-all duration-500" />

              <div className="p-8 text-center">
                {/* Icon circle with emerald fill on hover */}
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary transition-colors duration-300">
                  <s.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>

                <h3
                  className="font-bold text-lg mb-3"
                  style={{ fontFamily: 'DM Sans, Noto Sans Bengali, sans-serif' }}
                >
                  {t(s.titleKey)}
                </h3>

                {/* Gold mini divider */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="h-px w-6 bg-accent/50" />
                  <div className="w-1 h-1 rounded-full bg-accent" />
                  <div className="h-px w-6 bg-accent/50" />
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">{t(s.descKey)}</p>
              </div>

              {/* Bottom emerald gradient accent on hover */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
