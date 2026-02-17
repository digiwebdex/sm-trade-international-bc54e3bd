
-- Create product variants table for colors, designs, and pricing
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_label_en TEXT NOT NULL DEFAULT '',
  variant_label_bn TEXT NOT NULL DEFAULT '',
  color_hex TEXT DEFAULT NULL,
  design_type TEXT DEFAULT NULL,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 1,
  image_url TEXT DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read active variants"
ON public.product_variants FOR SELECT USING (true);

-- Admin manage
CREATE POLICY "Authenticated users can manage variants"
ON public.product_variants FOR ALL USING (true) WITH CHECK (true);

-- Index for fast lookup
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);

-- Timestamp trigger
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
