
-- Enable RLS on product_variant_images for authenticated users (was missing)
CREATE POLICY "Authenticated users can manage variant images"
ON public.product_variant_images
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add SKU column to product_variants if not exists
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS color_name text;

-- Create about_page table for rich about content
CREATE TABLE IF NOT EXISTS public.about_page (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_key text NOT NULL UNIQUE,
  content_en text NOT NULL DEFAULT '',
  content_bn text NOT NULL DEFAULT '',
  image_url text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read about page"
ON public.about_page FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage about page"
ON public.about_page FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Insert default about page sections
INSERT INTO public.about_page (field_key, content_en, content_bn) VALUES
  ('company_description', 'S.M. Trade International is a leading corporate gifts and promotional products company based in Bangladesh, serving clients across government, NGO, and private sectors with premium quality branded merchandise.', ''),
  ('mission', 'To deliver premium quality corporate gifts and promotional products that help organizations build lasting brand impressions and strengthen business relationships.', ''),
  ('vision', 'To become Bangladesh''s most trusted corporate merchandise partner, known for quality, reliability, and creative branding solutions.', ''),
  ('company_history', 'Founded with a vision to revolutionize corporate gifting in Bangladesh, S.M. Trade International has grown into a full-service promotional products company.', '')
ON CONFLICT (field_key) DO NOTHING;

-- Create seo_meta table for per-page SEO
CREATE TABLE IF NOT EXISTS public.seo_meta (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug text NOT NULL UNIQUE,
  meta_title_en text NOT NULL DEFAULT '',
  meta_title_bn text NOT NULL DEFAULT '',
  meta_description_en text NOT NULL DEFAULT '',
  meta_description_bn text NOT NULL DEFAULT '',
  keywords text NOT NULL DEFAULT '',
  og_image_url text,
  canonical_url text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read seo meta"
ON public.seo_meta FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage seo meta"
ON public.seo_meta FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Insert default SEO for key pages
INSERT INTO public.seo_meta (page_slug, meta_title_en, meta_description_en, keywords) VALUES
  ('home', 'S.M. Trade International | Premium Corporate Gifts Bangladesh', 'Bangladesh''s leading corporate gifts & promotional products company. Custom branded merchandise for businesses, NGOs and government organizations.', 'corporate gifts bangladesh, promotional products, branded merchandise, custom gifts'),
  ('catalog', 'Product Catalog | S.M. Trade International', 'Browse our extensive catalog of premium corporate gifts, ties, crystal awards, leather files, and more.', 'corporate gifts catalog, promotional items, branded products'),
  ('gallery', 'Project Gallery | S.M. Trade International', 'View our past work and delivered corporate gift projects for clients across Bangladesh.', 'corporate gifts gallery, past projects, client work'),
  ('about', 'About Us | S.M. Trade International', 'Learn about S.M. Trade International, our mission, vision and commitment to quality corporate gifts.', 'about sm trade international, corporate gifts company bangladesh')
ON CONFLICT (page_slug) DO NOTHING;
