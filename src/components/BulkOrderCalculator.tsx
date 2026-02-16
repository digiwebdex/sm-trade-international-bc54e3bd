import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calculator, TrendingDown, Package, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface ProductTier {
  id: string;
  nameEn: string;
  nameBn: string;
  basePrice: number; // BDT per unit at tier 1
  tiers: { min: number; max: number; discount: number }[];
}

const products: ProductTier[] = [
  {
    id: 'crystal-trophy', nameEn: 'Crystal Award Trophy', nameBn: 'ক্রিস্টাল অ্যাওয়ার্ড ট্রফি',
    basePrice: 2500,
    tiers: [
      { min: 1, max: 49, discount: 0 },
      { min: 50, max: 99, discount: 10 },
      { min: 100, max: 499, discount: 18 },
      { min: 500, max: 10000, discount: 25 },
    ],
  },
  {
    id: 'silk-tie', nameEn: 'Premium Silk Tie', nameBn: 'প্রিমিয়াম সিল্ক টাই',
    basePrice: 800,
    tiers: [
      { min: 1, max: 49, discount: 0 },
      { min: 50, max: 99, discount: 8 },
      { min: 100, max: 499, discount: 15 },
      { min: 500, max: 10000, discount: 22 },
    ],
  },
  {
    id: 'exec-pen', nameEn: 'Executive Pen Set', nameBn: 'এক্সিকিউটিভ পেন সেট',
    basePrice: 1200,
    tiers: [
      { min: 1, max: 49, discount: 0 },
      { min: 50, max: 99, discount: 10 },
      { min: 100, max: 499, discount: 17 },
      { min: 500, max: 10000, discount: 24 },
    ],
  },
  {
    id: 'leather-portfolio', nameEn: 'Leather Portfolio', nameBn: 'লেদার পোর্টফোলিও',
    basePrice: 1800,
    tiers: [
      { min: 1, max: 49, discount: 0 },
      { min: 50, max: 99, discount: 8 },
      { min: 100, max: 499, discount: 15 },
      { min: 500, max: 10000, discount: 20 },
    ],
  },
  {
    id: 'thermos', nameEn: 'Insulated Thermos', nameBn: 'ইনসুলেটেড থার্মোস',
    basePrice: 950,
    tiers: [
      { min: 1, max: 49, discount: 0 },
      { min: 50, max: 99, discount: 10 },
      { min: 100, max: 499, discount: 18 },
      { min: 500, max: 10000, discount: 25 },
    ],
  },
  {
    id: 'crystal-souvenir', nameEn: 'Crystal Souvenir', nameBn: 'ক্রিস্টাল স্যুভেনির',
    basePrice: 3500,
    tiers: [
      { min: 1, max: 49, discount: 0 },
      { min: 50, max: 99, discount: 12 },
      { min: 100, max: 499, discount: 20 },
      { min: 500, max: 10000, discount: 28 },
    ],
  },
];

const tierLabels = [
  { en: '1–49 pcs', bn: '১–৪৯ পিস' },
  { en: '50–99 pcs', bn: '৫০–৯৯ পিস' },
  { en: '100–499 pcs', bn: '১০০–৪৯৯ পিস' },
  { en: '500+ pcs', bn: '৫০০+ পিস' },
];

const formatBDT = (amount: number) =>
  '৳' + amount.toLocaleString('en-BD');

const BulkOrderCalculator = () => {
  const { lang } = useLanguage();
  const { get } = useSiteSettings();
  const whatsappNumber = (get('contact', 'whatsapp_number', '8801867666888') as string).replace(/[^0-9]/g, '') || '8801867666888';

  const [selectedProduct, setSelectedProduct] = useState(products[0].id);
  const [quantity, setQuantity] = useState(100);

  const product = products.find(p => p.id === selectedProduct)!;

  const currentTier = useMemo(() => {
    return product.tiers.find(t => quantity >= t.min && quantity <= t.max) || product.tiers[product.tiers.length - 1];
  }, [product, quantity]);

  const unitPrice = Math.round(product.basePrice * (1 - currentTier.discount / 100));
  const totalPrice = unitPrice * quantity;
  const savedPerUnit = product.basePrice - unitPrice;
  const totalSaved = savedPerUnit * quantity;

  const getWhatsAppUrl = () => {
    const name = lang === 'en' ? product.nameEn : product.nameBn;
    const message = lang === 'en'
      ? `Hi, I'd like a quote for ${quantity} units of "${name}" at approx. ${formatBDT(unitPrice)}/unit (${formatBDT(totalPrice)} total). Please confirm pricing and customization options.`
      : `হ্যালো, আমি "${name}" ${quantity} পিসের জন্য কোটেশন চাই, আনুমানিক ${formatBDT(unitPrice)}/পিস (মোট ${formatBDT(totalPrice)})। দয়া করে মূল্য ও কাস্টমাইজেশন নিশ্চিত করুন।`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section id="bulk-calculator" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-accent text-sm font-semibold tracking-widest uppercase mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {lang === 'en' ? 'Savings Estimator' : 'সাশ্রয় হিসাবকারী'}
          </span>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="h-7 w-7 text-primary" />
            <h2 className="text-3xl md:text-5xl font-bold">
              {lang === 'en' ? 'Bulk Order Calculator' : 'বাল্ক অর্ডার ক্যালকুলেটর'}
            </h2>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-accent/40" />
            <div className="w-2 h-2 rounded-full bg-accent" />
            <div className="h-px w-12 bg-accent/40" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {lang === 'en'
              ? 'See how much you save with larger orders. Slide to adjust quantity and watch pricing update in real-time.'
              : 'বেশি অর্ডারে কত সাশ্রয় হয় দেখুন। পরিমাণ পরিবর্তন করুন এবং রিয়েল-টাইমে মূল্য আপডেট দেখুন।'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Product selector */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedProduct === p.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {lang === 'en' ? p.nameEn : p.nameBn}
              </button>
            ))}
          </div>

          {/* Calculator card */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
            {/* Quantity slider */}
            <div className="p-8 border-b border-border/50">
              <div className="flex items-center justify-between mb-6">
                <label className="text-sm font-semibold text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {lang === 'en' ? 'Quantity' : 'পরিমাণ'}
                </label>
                <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-lg font-bold">
                  {quantity.toLocaleString()} {lang === 'en' ? 'pcs' : 'পিস'}
                </div>
              </div>
              <Slider
                value={[quantity]}
                onValueChange={([v]) => setQuantity(v)}
                min={1}
                max={1000}
                step={1}
                className="mb-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <span>1</span>
                <span>250</span>
                <span>500</span>
                <span>750</span>
                <span>1000</span>
              </div>
            </div>

            {/* Tier indicators */}
            <div className="grid grid-cols-4 border-b border-border/50">
              {product.tiers.map((tier, i) => {
                const isActive = quantity >= tier.min && quantity <= tier.max;
                return (
                  <div
                    key={i}
                    className={`p-4 text-center transition-all ${
                      isActive ? 'bg-accent/10 border-b-2 border-accent' : ''
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {tierLabels[i][lang]}
                    </p>
                    <p className={`text-sm font-bold ${isActive ? 'text-accent' : 'text-foreground'}`}>
                      {tier.discount > 0 ? `-${tier.discount}%` : (lang === 'en' ? 'Base' : 'বেস')}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Results */}
            <div className="p-8">
              <div className="grid sm:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {lang === 'en' ? 'Unit Price' : 'একক মূল্য'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{formatBDT(unitPrice)}</p>
                  {savedPerUnit > 0 && (
                    <p className="text-xs text-accent mt-1 flex items-center justify-center gap-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      <TrendingDown className="h-3 w-3" />
                      {lang === 'en' ? `Save ${formatBDT(savedPerUnit)}/unit` : `${formatBDT(savedPerUnit)}/পিস সাশ্রয়`}
                    </p>
                  )}
                </div>
                <div className="text-center p-4 rounded-xl bg-primary/5">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {lang === 'en' ? 'Total Estimate' : 'মোট আনুমানিক'}
                  </p>
                  <p className="text-2xl font-bold text-primary">{formatBDT(totalPrice)}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    <Package className="h-3 w-3" />
                    {quantity.toLocaleString()} × {formatBDT(unitPrice)}
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-accent/5">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {lang === 'en' ? 'Total Savings' : 'মোট সাশ্রয়'}
                  </p>
                  <p className="text-2xl font-bold text-accent">{totalSaved > 0 ? formatBDT(totalSaved) : '—'}</p>
                  {currentTier.discount > 0 && (
                    <p className="text-xs text-accent mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {currentTier.discount}% {lang === 'en' ? 'discount' : 'ছাড়'}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {lang === 'en'
                  ? '* Prices are approximate estimates. Final pricing depends on customization, materials, and design complexity.'
                  : '* মূল্য আনুমানিক। চূড়ান্ত মূল্য কাস্টমাইজেশন, উপকরণ এবং ডিজাইনের জটিলতার উপর নির্ভর করে।'}
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 gap-2">
                  <a href="/#quote">
                    <Calculator className="h-4 w-4" />
                    <span className="font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {lang === 'en' ? 'Request Detailed Quote' : 'বিস্তারিত কোটেশন অনুরোধ'}
                    </span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 border-[hsl(142,70%,40%)] text-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,40%)]/10 px-8">
                  <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {lang === 'en' ? 'Discuss on WhatsApp' : 'WhatsApp এ আলোচনা করুন'}
                    </span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BulkOrderCalculator;
