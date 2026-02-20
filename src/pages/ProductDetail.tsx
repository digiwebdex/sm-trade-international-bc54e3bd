import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuoteBasket } from '@/contexts/QuoteBasketContext';
import {
  ArrowLeft, ShoppingBag, MessageCircle, Share2,
  ChevronRight, Minus, Plus, Calculator, Package, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductImageGallery, { TypedImage } from '@/components/product/ProductImageGallery';
import OptimizedImage from '@/components/OptimizedImage';
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

  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // ─── Data Fetching ───────────────────────────────────────────────────
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

  // All product-level typed images (variant_id IS NULL)
  const { data: productImages = [] } = useQuery({
    queryKey: ['product-images', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id!)
        .is('variant_id', null)
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

  // ─── Variant Logic ────────────────────────────────────────────────────
  const uniqueDesigns = useMemo(() => {
    const seen = new Set<string>();
    return variants.filter(v => v.design_type && !seen.has(v.design_type) && seen.add(v.design_type));
  }, [variants]);

  const uniqueColors = useMemo(() => {
    const seen = new Set<string>();
    return variants.filter(v => v.color_name && !seen.has(v.color_name) && seen.add(v.color_name));
  }, [variants]);

  const activeVariant = useMemo(() => {
    if (!variants.length) return null;
    if (selectedDesign && selectedColor) {
      const match = variants.find(v => v.design_type === selectedDesign && v.color_name === selectedColor);
      if (match) return match;
    }
    if (selectedDesign) return variants.find(v => v.design_type === selectedDesign) ?? variants[0];
    if (selectedColor) return variants.find(v => v.color_name === selectedColor) ?? variants[0];
    return variants[0];
  }, [variants, selectedDesign, selectedColor]);

  // Variant-specific images (if any)
  const { data: variantImages = [] } = useQuery({
    queryKey: ['product-view-images', id, activeVariant?.id ?? null],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id!)
        .eq('variant_id', activeVariant!.id)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!activeVariant?.id,
  });

  // ─── Build typed image list for gallery ───────────────────────────────
  const galleryImages = useMemo((): TypedImage[] => {
    const result: TypedImage[] = [];
    const seen = new Set<string>();
    const add = (img: TypedImage) => {
      if (!img.url || seen.has(img.url)) return;
      seen.add(img.url);
      result.push(img);
    };

    // 1. Variant images first (if selected variant has images)
    (variantImages as any[]).forEach(img => add({
      id: img.id,
      url: img.image_url,
      image_type: img.image_type ?? 'main',
      variant_id: img.variant_id,
    }));

    // 2. Fallback to product-level typed images
    (productImages as any[]).forEach(img => add({
      id: img.id,
      url: img.image_url,
      image_type: img.image_type ?? 'main',
      variant_id: null,
    }));

    // 3. Fallback to variant's single image_url
    if (activeVariant?.image_url) {
      add({ url: activeVariant.image_url, image_type: 'main', variant_id: activeVariant.id });
    }

    // 4. Final fallback: product main image_url
    if (product?.image_url) {
      add({ url: product.image_url, image_type: 'main' });
    }

    return result;
  }, [variantImages, productImages, activeVariant, product]);

  // ─── Pricing ──────────────────────────────────────────────────────────
  const unitPrice = activeVariant?.unit_price ? Number(activeVariant.unit_price) : 0;
  const currentTier = BULK_TIERS.find(t => quantity >= t.min && quantity <= t.max) ?? BULK_TIERS[0];
  const discountedPrice = unitPrice > 0 ? unitPrice * (1 - currentTier.discount / 100) : 0;
  const totalPrice = discountedPrice * quantity;
  const savings = unitPrice > 0 ? (unitPrice - discountedPrice) * quantity : 0;

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleDesignSelect = (design: string) => {
    setSelectedDesign(design === selectedDesign ? null : design);
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName === selectedColor ? null : colorName);
  };

  const handleAddToQuote = () => {
    if (!product) return;
    const displayImg = galleryImages[0]?.url ?? '';
    addItem({
      id: product.id,
      titleEn: product.name_en,
      titleBn: product.name_bn || '',
      src: displayImg,
      category: product.category_id || '',
    });
    toast.success(lang === 'en' ? 'Added to quote basket' : 'কোটেশন বাস্কেটে যোগ হয়েছে');
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const variantInfo = activeVariant
      ? ` (${activeVariant.variant_label_en})`
      : '';
    const msg = encodeURIComponent(
      `Hi, I'm interested in: ${product.name_en}${variantInfo}, Qty: ${quantity}. Please share price & availability.`
    );
    window.open(`https://wa.me/8801867666888?text=${msg}`, '_blank');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product?.name_en ?? '', url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(lang === 'en' ? 'Link copied!' : 'লিংক কপি হয়েছে!');
    }
  };

  // ─── Loading / Not found ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Skeleton className="h-5 w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-40" />
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
            <ArrowLeft className="mr-2 h-4 w-4" /> {lang === 'en' ? 'Go Back' : 'ফিরে যান'}
          </Button>
        </div>
      </div>
    );
  }

  const cat = (product as any).categories;
  const title = lang === 'en' ? product.name_en : (product.name_bn || product.name_en);
  const desc = lang === 'en' ? (product.description_en ?? '') : (product.description_bn ?? product.description_en ?? '');
  const categoryLabel = cat ? (lang === 'en' ? cat.name_en : (cat.name_bn || cat.name_en)) : '';
  const stock = activeVariant ? (activeVariant as any).stock ?? null : null;

  return (
    <div className="min-h-screen bg-background pt-4 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">{lang === 'en' ? 'Home' : 'হোম'}</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-foreground transition-colors">{lang === 'en' ? 'Products' : 'পণ্য'}</Link>
          {categoryLabel && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link to={`/catalog?category=${product.category_id}`} className="hover:text-foreground transition-colors">{categoryLabel}</Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
        </nav>

        {/* ─── Main Layout ───────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">

          {/* LEFT — Image gallery */}
          <div className="md:sticky md:top-20">
            <ProductImageGallery
              images={galleryImages}
              selectedVariantId={activeVariant?.id ?? null}
              title={title}
            />
          </div>

          {/* RIGHT — Product details */}
          <div className="flex flex-col gap-5">

            {/* Category + availability */}
            <div className="flex items-center gap-2 flex-wrap">
              {categoryLabel && (
                <Badge variant="outline" className="text-xs">{categoryLabel}</Badge>
              )}
              {product.is_active ? (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {lang === 'en' ? 'In Stock' : 'স্টকে আছে'}
                </span>
              ) : (
                <Badge variant="secondary" className="text-xs">{lang === 'en' ? 'Currently Unavailable' : 'অনুপলব্ধ'}</Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{title}</h1>

            {/* Product code / SKU */}
            {(activeVariant as any)?.sku ? (
              <div className="flex items-center gap-2 py-1.5 px-3 bg-muted/50 rounded-lg border border-border/40 w-fit">
                <span className="text-xs text-muted-foreground">{lang === 'en' ? 'SKU' : 'পণ্য কোড'}:</span>
                <code className="text-xs font-mono font-bold text-foreground">{(activeVariant as any).sku}</code>
              </div>
            ) : (product as any).product_code ? (
              <div className="flex items-center gap-2 py-1.5 px-3 bg-muted/50 rounded-lg border border-border/40 w-fit">
                <span className="text-xs text-muted-foreground">Code:</span>
                <code className="text-xs font-mono font-bold text-foreground">{(product as any).product_code}</code>
              </div>
            ) : null}

            {/* Price */}
            {unitPrice > 0 && (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[hsl(var(--sm-gold))]">
                  ৳{discountedPrice.toFixed(0)}
                </span>
                {currentTier.discount > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">৳{unitPrice.toFixed(0)}</span>
                    <Badge className="bg-green-600 text-white">{currentTier.discount}% OFF</Badge>
                  </>
                )}
                <span className="text-xs text-muted-foreground">/ {lang === 'en' ? 'unit' : 'পিস'}</span>
              </div>
            )}

            {/* Description */}
            {desc && (
              <p className="text-muted-foreground leading-relaxed text-[15px]">{desc}</p>
            )}

            <div className="h-px bg-border/50" />

            {/* ─── Design Selector ─── */}
            {uniqueDesigns.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{lang === 'en' ? 'Design' : 'ডিজাইন'}</h3>
                  {selectedDesign && (
                    <span className="text-xs text-muted-foreground">{selectedDesign}</span>
                  )}
                </div>
                <Select
                  value={selectedDesign ?? ''}
                  onValueChange={v => handleDesignSelect(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={lang === 'en' ? 'Select design…' : 'ডিজাইন বেছে নিন…'} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueDesigns.map(v => (
                      <SelectItem key={v.design_type!} value={v.design_type!}>
                        {v.design_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ─── Color Swatch Selector ─── */}
            {uniqueColors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{lang === 'en' ? 'Color' : 'রঙ'}</h3>
                  {selectedColor && (
                    <span className="text-xs text-muted-foreground">{selectedColor}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {uniqueColors.map(v => {
                    const isActive = selectedColor === v.color_name;
                    const hex = v.color_hex ?? '#999';
                    return (
                      <button
                        key={v.color_name}
                        onClick={() => handleColorSelect(v.color_name!)}
                        title={v.color_name ?? hex}
                        className={`
                          relative w-9 h-9 rounded-full border-2 transition-all duration-200
                          hover:scale-110 focus:outline-none
                          ${isActive
                            ? 'border-[hsl(var(--sm-gold))] ring-2 ring-[hsl(var(--sm-gold))]/40 scale-110 shadow-md'
                            : 'border-border/50 hover:border-border'
                          }
                        `}
                        style={{ backgroundColor: hex }}
                      >
                        {isActive && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Color name label strip */}
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map(v => (
                    <button
                      key={`label-${v.color_name}`}
                      onClick={() => handleColorSelect(v.color_name!)}
                      className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                        selectedColor === v.color_name
                          ? 'border-[hsl(var(--sm-gold))] bg-[hsl(var(--sm-gold))]/10 text-foreground font-semibold'
                          : 'border-border/40 text-muted-foreground hover:border-border'
                      }`}
                    >
                      {v.color_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            {stock !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{lang === 'en' ? 'Stock' : 'স্টক'}:</span>
                <span className={`font-semibold ${stock > 10 ? 'text-green-600' : stock > 0 ? 'text-amber-600' : 'text-destructive'}`}>
                  {stock > 10
                    ? (lang === 'en' ? 'Available' : 'পাওয়া যাচ্ছে')
                    : stock > 0
                    ? (lang === 'en' ? `Only ${stock} left` : `মাত্র ${stock}টি বাকি`)
                    : (lang === 'en' ? 'Out of stock' : 'স্টক নেই')}
                </span>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">{lang === 'en' ? 'Quantity' : 'পরিমাণ'}</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-xl overflow-hidden shadow-sm">
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

            {/* Bulk pricing */}
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
                          ? 'bg-[hsl(var(--sm-gold))]/15 border border-[hsl(var(--sm-gold))]/40 font-semibold'
                          : 'bg-background border border-border/50 text-muted-foreground hover:border-border'
                      }`}
                    >
                      <div className="font-medium">{tier.label}</div>
                      <div className="text-[10px]">{tier.discount > 0 ? `${tier.discount}% off` : (lang === 'en' ? 'Base' : 'বেস')}</div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30 text-sm">
                  <span className="text-muted-foreground">{quantity} × ৳{discountedPrice.toFixed(0)}</span>
                  <div className="text-right">
                    <span className="font-bold text-lg">৳{totalPrice.toFixed(0)}</span>
                    {savings > 0 && (
                      <span className="block text-xs text-green-600">
                        {lang === 'en' ? `You save ৳${savings.toFixed(0)}` : `সঞ্চয় ৳${savings.toFixed(0)}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleAddToQuote}
                className="bg-[hsl(var(--sm-gold))] hover:bg-[hsl(var(--sm-gold))]/90 text-white gap-2 rounded-xl flex-1"
              >
                <ShoppingBag className="h-5 w-5" />
                {lang === 'en' ? 'Add to Quote Basket' : 'কোটেশন বাস্কেটে যোগ করুন'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWhatsApp}
                className="gap-2 rounded-xl"
              >
                <MessageCircle className="h-5 w-5" />
                {lang === 'en' ? 'WhatsApp' : 'হোয়াটসঅ্যাপ'}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={handleShare}
                className="gap-2 rounded-xl"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Highlights */}
            <div className="border-t border-border pt-4 space-y-2">
              {[
                lang === 'en' ? 'Custom branding & logo engraving available' : 'কাস্টম ব্র্যান্ডিং ও লোগো খোদাই উপলব্ধ',
                lang === 'en' ? 'Bulk order discounts for 50+ units' : '৫০+ ইউনিটে বাল্ক অর্ডার ডিসকাউন্ট',
                lang === 'en' ? 'Premium quality materials & craftsmanship' : 'প্রিমিয়াম মানের উপকরণ ও কারুশিল্প',
              ].map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--sm-gold))] shrink-0" />
                  {h}
                </div>
              ))}
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
                        <span className="text-[10px] text-muted-foreground">
                          {lang === 'en' ? rpCat.name_en : (rpCat.name_bn || rpCat.name_en)}
                        </span>
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
