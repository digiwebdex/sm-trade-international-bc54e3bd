import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuoteBasket } from '@/contexts/QuoteBasketContext';
import { ArrowLeft, ShoppingBag, MessageCircle, Share2, ChevronRight, Minus, Plus, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/OptimizedImage';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import { toast } from 'sonner';

const BULK_TIERS = [
  { min: 1, max: 49, discount: 0, label: '1–49' },
  { min: 50, max: 99, discount: 5, label: '50–99' },
  { min: 100, max: 499, discount: 10, label: '100–499' },
  { min: 500, max: Infinity, discount: 15, label: '500+' },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { addItem } = useQuoteBasket();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name_en, name_bn)')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: variants = [] } = useQuery({
    queryKey: ['product-variants', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id!)
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: productImages = [] } = useQuery({
    queryKey: ['product-images', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id!)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products', product?.category_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name_en, name_bn)')
        .eq('category_id', product!.category_id!)
        .neq('id', id!)
        .eq('is_active', true)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id,
  });

  const activeVariant = useMemo(() => {
    if (!selectedVariant) return variants[0] || null;
    return variants.find(v => v.id === selectedVariant) || variants[0] || null;
  }, [variants, selectedVariant]);

  const { data: variantImages = [] } = useQuery({
    queryKey: ['variant-images', activeVariant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variant_images')
        .select('*')
        .eq('variant_id', activeVariant!.id)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!activeVariant?.id,
  });

  const displayImage = activeVariant?.image_url || product?.image_url || '';

  const unitPrice = activeVariant?.unit_price ? Number(activeVariant.unit_price) : 0;
  const currentTier = BULK_TIERS.find(t => quantity >= t.min && quantity <= t.max) || BULK_TIERS[0];
  const discountedPrice = unitPrice > 0 ? unitPrice * (1 - currentTier.discount / 100) : 0;
  const totalPrice = discountedPrice * quantity;
  const savings = unitPrice > 0 ? (unitPrice - discountedPrice) * quantity : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">{lang === 'en' ? 'Product not found' : 'পণ্য পাওয়া যায়নি'}</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {lang === 'en' ? 'Go Back' : 'ফিরে যান'}
          </Button>
        </div>
      </div>
    );
  }

  const cat = (product as any).categories;
  const title = lang === 'en' ? product.name_en : (product.name_bn || product.name_en);
  const desc = lang === 'en' ? (product.description_en || '') : (product.description_bn || product.description_en || '');
  const categoryLabel = cat ? (lang === 'en' ? cat.name_en : (cat.name_bn || cat.name_en)) : '';
  const altTitle = lang === 'en' ? product.name_bn : product.name_en;

  const handleAddToQuote = () => {
    addItem({
      id: product.id,
      titleEn: product.name_en,
      titleBn: product.name_bn || '',
      src: displayImage,
      category: product.category_id || '',
    });
    toast.success(lang === 'en' ? 'Added to quote basket' : 'কোটেশন বাস্কেটে যোগ হয়েছে');
  };

  const handleWhatsApp = () => {
    const variantInfo = activeVariant
      ? ` (${lang === 'en' ? activeVariant.variant_label_en : (activeVariant.variant_label_bn || activeVariant.variant_label_en)})`
      : '';
    const msg = encodeURIComponent(
      `Hi, I'm interested in: ${product.name_en}${variantInfo}, Qty: ${quantity}. Please share details.`
    );
    window.open(`https://wa.me/8801700000000?text=${msg}`, '_blank');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(lang === 'en' ? 'Link copied!' : 'লিংক কপি হয়েছে!');
    }
  };

  const hasVariants = variants.length > 0;
  const hasColors = variants.some(v => v.color_hex);
  const hasDesigns = variants.some(v => v.design_type);

  return (
    <div className="min-h-screen bg-background pt-4 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">
            {lang === 'en' ? 'Home' : 'হোম'}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/#products" className="hover:text-foreground transition-colors">
            {lang === 'en' ? 'Products' : 'পণ্য'}
          </Link>
          {categoryLabel && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{categoryLabel}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
        </nav>

        {/* Main product section */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative">
            <ProductImageGallery
              mainImage={product.image_url || ''}
              productImages={productImages}
              variantImages={variantImages}
              activeVariantImage={activeVariant?.image_url}
              variants={variants.map(v => ({
                id: v.id,
                image_url: v.image_url,
                variant_label_en: v.variant_label_en,
                color_hex: v.color_hex,
              }))}
              selectedVariantId={selectedVariant || variants[0]?.id || null}
              onVariantSelect={setSelectedVariant}
              title={title}
            />
            {!product.is_active && (
              <Badge variant="secondary" className="absolute top-4 left-4 z-10">
                {lang === 'en' ? 'Currently Unavailable' : 'বর্তমানে অনুপলব্ধ'}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            {categoryLabel && (
              <Badge variant="outline" className="self-start text-xs">
                {categoryLabel}
              </Badge>
            )}

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {title}
            </h1>

            {altTitle && (
              <p className="text-muted-foreground text-sm">
                {lang === 'en' ? 'বাংলা' : 'English'}: {altTitle}
              </p>
            )}

            {/* Price display */}
            {unitPrice > 0 && (
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-[hsl(var(--sm-gold))]">
                  ৳{discountedPrice.toFixed(0)}
                </span>
                {currentTier.discount > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">৳{unitPrice.toFixed(0)}</span>
                    <Badge className="bg-green-600 text-white text-xs">{currentTier.discount}% OFF</Badge>
                  </>
                )}
                <span className="text-xs text-muted-foreground">/ {lang === 'en' ? 'unit' : 'পিস'}</span>
              </div>
            )}

            {desc && (
              <p className="text-muted-foreground leading-relaxed text-base">{desc}</p>
            )}

            {/* Color variants */}
            {hasColors && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">
                  {lang === 'en' ? 'Color' : 'রঙ'}:
                  {activeVariant && (
                    <span className="font-normal text-muted-foreground ml-2">
                      {lang === 'en' ? activeVariant.variant_label_en : (activeVariant.variant_label_bn || activeVariant.variant_label_en)}
                    </span>
                  )}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {variants.filter(v => v.color_hex).map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      title={lang === 'en' ? v.variant_label_en : (v.variant_label_bn || v.variant_label_en)}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        (selectedVariant || variants[0]?.id) === v.id
                          ? 'border-[hsl(var(--sm-gold))] ring-2 ring-[hsl(var(--sm-gold))]/30 scale-110'
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: v.color_hex || '#ccc' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Design variants */}
            {hasDesigns && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">{lang === 'en' ? 'Design' : 'ডিজাইন'}</h3>
                <div className="flex gap-2 flex-wrap">
                  {variants.filter(v => v.design_type).map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                        (selectedVariant || variants[0]?.id) === v.id
                          ? 'border-[hsl(var(--sm-gold))] bg-[hsl(var(--sm-gold))]/10 text-foreground font-medium'
                          : 'border-border bg-background text-muted-foreground hover:border-foreground/30'
                      }`}
                    >
                      {lang === 'en' ? v.variant_label_en : (v.variant_label_bn || v.variant_label_en)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">{lang === 'en' ? 'Quantity' : 'পরিমাণ'}</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border-0 rounded-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {activeVariant?.min_quantity && activeVariant.min_quantity > 1 && (
                  <span className="text-xs text-muted-foreground">
                    {lang === 'en' ? `Min: ${activeVariant.min_quantity}` : `সর্বনিম্ন: ${activeVariant.min_quantity}`}
                  </span>
                )}
              </div>
            </div>

            {/* Bulk pricing calculator */}
            {unitPrice > 0 && (
              <div className="bg-secondary rounded-xl p-4 space-y-3 border border-border/30">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Calculator className="h-4 w-4 text-[hsl(var(--sm-gold))]" />
                  {lang === 'en' ? 'Bulk Pricing' : 'বাল্ক মূল্য'}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {BULK_TIERS.map(tier => (
                    <button
                      key={tier.label}
                      onClick={() => setQuantity(tier.min)}
                      className={`text-center p-2 rounded-lg text-xs transition-all ${
                        currentTier.label === tier.label
                          ? 'bg-[hsl(var(--sm-gold))]/15 border border-[hsl(var(--sm-gold))]/40 font-semibold text-foreground'
                          : 'bg-background border border-border/50 text-muted-foreground hover:border-border'
                      }`}
                    >
                      <div className="font-medium">{tier.label}</div>
                      <div className="text-[10px]">{tier.discount > 0 ? `${tier.discount}% off` : lang === 'en' ? 'Base' : 'বেস'}</div>
                    </button>
                  ))}
                </div>
                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30 text-sm">
                  <span className="text-muted-foreground">
                    {quantity} × ৳{discountedPrice.toFixed(0)}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-lg text-foreground">৳{totalPrice.toFixed(0)}</span>
                    {savings > 0 && (
                      <span className="block text-xs text-green-600">
                        {lang === 'en' ? `You save ৳${savings.toFixed(0)}` : `সঞ্চয় ৳${savings.toFixed(0)}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Highlights */}
            <div className="border-t border-border pt-5 space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                {lang === 'en' ? 'Highlights' : 'বৈশিষ্ট্য'}
              </h3>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--sm-gold))] shrink-0" />
                  {lang === 'en' ? 'Custom branding & logo engraving available' : 'কাস্টম ব্র্যান্ডিং ও লোগো খোদাই উপলব্ধ'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--sm-gold))] shrink-0" />
                  {lang === 'en' ? 'Bulk order discounts for 50+ units' : '৫০+ ইউনিটে বাল্ক অর্ডার ডিসকাউন্ট'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--sm-gold))] shrink-0" />
                  {lang === 'en' ? 'Premium quality materials & craftsmanship' : 'প্রিমিয়াম মানের উপকরণ ও কারুশিল্প'}
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                size="lg"
                onClick={handleAddToQuote}
                className="bg-[hsl(var(--sm-gold))] hover:bg-[hsl(var(--sm-gold))]/90 text-white gap-2 rounded-full"
              >
                <ShoppingBag className="h-5 w-5" />
                {lang === 'en' ? 'Add to Quote Basket' : 'কোটেশন বাস্কেটে যোগ করুন'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWhatsApp}
                className="gap-2 rounded-full"
              >
                <MessageCircle className="h-5 w-5" />
                {lang === 'en' ? 'WhatsApp Inquiry' : 'হোয়াটসঅ্যাপে জানুন'}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={handleShare}
                className="gap-2 rounded-full"
              >
                <Share2 className="h-4 w-4" />
                {lang === 'en' ? 'Share' : 'শেয়ার'}
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6">
              {lang === 'en' ? 'Related Products' : 'সম্পর্কিত পণ্য'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rp: any) => {
                const rpCat = rp.categories;
                const rpTitle = lang === 'en' ? rp.name_en : (rp.name_bn || rp.name_en);
                return (
                  <Link
                    key={rp.id}
                    to={`/product/${rp.id}`}
                    className="group rounded-2xl overflow-hidden bg-background border border-border/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-square overflow-hidden bg-white">
                      {rp.image_url ? (
                        <OptimizedImage
                          src={rp.image_url}
                          alt={rpTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          wrapperClassName="w-full h-full"
                          sizes="(min-width: 768px) 25vw, 50vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">{rpTitle}</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2">{rpTitle}</h3>
                      {rpCat && (
                        <span className="text-[10px] text-muted-foreground">{lang === 'en' ? rpCat.name_en : (rpCat.name_bn || rpCat.name_en)}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
