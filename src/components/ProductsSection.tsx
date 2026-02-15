import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

// Static fallback images
import img1 from '@/assets/products/ties-blue.png';
import img2 from '@/assets/products/bpatc-building.png';
import img3 from '@/assets/products/product-3.png';
import img4 from '@/assets/products/product-4.png';
import img5 from '@/assets/products/product-5.png';
import img6 from '@/assets/products/tunnel-souvenir.png';
import img7 from '@/assets/products/product-7.png';
import img8 from '@/assets/products/product-8.png';
import img9 from '@/assets/products/product-9.png';
import img10 from '@/assets/products/product-10.png';
import img11 from '@/assets/products/glassware.png';
import img12 from '@/assets/products/product-12.png';

interface StaticProduct {
  src: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  category: string;
}

const staticProducts: StaticProduct[] = [
  { src: img1, titleEn: 'Customized Ties', titleBn: 'কাস্টমাইজড টাই', descEn: 'Premium silk ties with custom branding.', descBn: 'কাস্টম ব্র্যান্ডিং সহ প্রিমিয়াম সিল্ক টাই।', category: 'corporate' },
  { src: img2, titleEn: 'BPATC Project', titleBn: 'বিপিএটিসি প্রজেক্ট', descEn: 'Custom project for BPATC.', descBn: 'বিপিএটিসির জন্য কাস্টম প্রকল্প।', category: 'souvenir' },
  { src: img3, titleEn: 'Leather Goods', titleBn: 'লেদার পণ্য', descEn: 'Genuine leather products.', descBn: 'আসল চামড়ার পণ্য।', category: 'corporate' },
  { src: img4, titleEn: 'Custom Bags', titleBn: 'কাস্টম ব্যাগ', descEn: 'Branded bags for events.', descBn: 'ইভেন্টের জন্য ব্র্যান্ডেড ব্যাগ।', category: 'corporate' },
  { src: img5, titleEn: 'Promotional Items', titleBn: 'প্রমোশনাল আইটেম', descEn: 'Custom promotional gifts.', descBn: 'কাস্টম প্রমোশনাল গিফট।', category: 'corporate' },
  { src: img6, titleEn: 'Bangabandhu Tunnel Souvenir', titleBn: 'বঙ্গবন্ধু টানেল স্মারক', descEn: 'Commemorative souvenir.', descBn: 'স্মারক উপহার।', category: 'souvenir' },
  { src: img7, titleEn: 'Custom Products', titleBn: 'কাস্টম পণ্য', descEn: 'Tailor-made corporate items.', descBn: 'কর্পোরেট আইটেম।', category: 'corporate' },
  { src: img8, titleEn: 'Branded Items', titleBn: 'ব্র্যান্ডেড আইটেম', descEn: 'Logo-printed merchandise.', descBn: 'লোগো-প্রিন্টেড পণ্য।', category: 'corporate' },
  { src: img9, titleEn: 'Stationery Set', titleBn: 'স্টেশনারি সেট', descEn: 'Premium branded stationery.', descBn: 'প্রিমিয়াম ব্র্যান্ডেড স্টেশনারি।', category: 'stationery' },
  { src: img10, titleEn: 'Premium Gifts', titleBn: 'প্রিমিয়াম গিফট', descEn: 'Luxury gift collections.', descBn: 'বিলাসবহুল গিফট সংগ্রহ।', category: 'corporate' },
  { src: img11, titleEn: 'Deli Glassware', titleBn: 'ডেলি গ্লাসওয়্যার', descEn: 'Custom engraved glassware.', descBn: 'কাস্টম খোদাই গ্লাসওয়্যার।', category: 'corporate' },
  { src: img12, titleEn: 'Special Collection', titleBn: 'স্পেশাল কালেকশন', descEn: 'Exclusive gift collection.', descBn: 'এক্সক্লুসিভ গিফট সংগ্রহ।', category: 'corporate' },
];

const ProductsSection = () => {
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState<{
    src: string;
    title: string;
    desc: string;
    category: string;
    categoryLabel: string;
  } | null>(null);

  // Fetch DB products + categories
  const { data: dbProducts = [] } = useQuery({
    queryKey: ['public-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name_en, name_bn)')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: dbCategories = [] } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name_en, name_bn')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Merge DB products into unified format
  type DisplayProduct = { src: string; title: string; desc: string; category: string; categoryLabel: string };

  const useDbData = dbProducts.length > 0;

  const allProducts: DisplayProduct[] = useDbData
    ? dbProducts.map(p => ({
        src: p.image_url || '',
        title: lang === 'en' ? p.name_en : (p.name_bn || p.name_en),
        desc: lang === 'en' ? (p.description_en || '') : (p.description_bn || p.description_en || ''),
        category: p.category_id || 'all',
        categoryLabel: (p as any).categories
          ? (lang === 'en' ? (p as any).categories.name_en : ((p as any).categories.name_bn || (p as any).categories.name_en))
          : '',
      }))
    : staticProducts.map(p => ({
        src: p.src,
        title: lang === 'en' ? p.titleEn : p.titleBn,
        desc: lang === 'en' ? p.descEn : p.descBn,
        category: p.category,
        categoryLabel: '',
      }));

  // Build filter categories
  const filterCategories = useDbData
    ? [{ id: 'all', label: t('products.all') }, ...dbCategories.map(c => ({
        id: c.id,
        label: lang === 'en' ? c.name_en : (c.name_bn || c.name_en),
      }))]
    : [
        { id: 'all', label: t('products.all') },
        { id: 'corporate', label: t('products.corporate') },
        { id: 'souvenir', label: t('products.souvenir') },
        { id: 'stationery', label: t('products.stationery') },
      ];

  const filtered = filter === 'all' ? allProducts : allProducts.filter(p => p.category === filter);

  return (
    <section id="products" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('products.title')}</h2>
        <div className="w-16 h-1 bg-sm-red mx-auto mb-8 rounded" />

        {/* Category filter chips */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {filterCategories.map(c => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === c.id ? 'bg-sm-red text-white' : 'bg-background text-foreground hover:bg-accent'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <div
              key={i}
              className="group cursor-pointer overflow-hidden rounded-xl bg-background shadow-sm hover:shadow-xl transition-all duration-300"
              onClick={() => setLightbox(p)}
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {p.src ? (
                  <img
                    src={p.src}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    {p.title}
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="font-medium text-sm text-center line-clamp-1">{p.title}</p>
                {p.desc && (
                  <p className="text-xs text-muted-foreground text-center line-clamp-2">{p.desc}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox with bilingual details */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white z-10" onClick={() => setLightbox(null)}>
            <X className="h-8 w-8" />
          </button>
          <div className="max-w-3xl w-full flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            {lightbox.src && (
              <img src={lightbox.src} alt={lightbox.title} className="max-w-full max-h-[65vh] object-contain rounded-lg" />
            )}
            <div className="text-center space-y-2 max-w-xl">
              <h3 className="text-xl font-bold text-white">{lightbox.title}</h3>
              {lightbox.categoryLabel && (
                <span className="inline-block bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">{lightbox.categoryLabel}</span>
              )}
              {lightbox.desc && (
                <p className="text-white/60 text-sm leading-relaxed">{lightbox.desc}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductsSection;
