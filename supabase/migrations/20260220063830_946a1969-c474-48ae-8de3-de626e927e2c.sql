
-- Phase 1: Upgrade product_images table with variant_id and image_type

-- Add variant_id (nullable FK with cascade delete)
ALTER TABLE public.product_images 
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE;

-- Add image_type for categorized views
ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS image_type TEXT DEFAULT 'main' CHECK (image_type IN ('main', 'front', 'back', 'left', 'right', 'gallery'));

-- Add color_name to product_variants if not already present (it exists, but ensure not null issue)
ALTER TABLE public.product_variants 
  ALTER COLUMN color_name SET DEFAULT NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS product_images_variant_id_idx ON public.product_images(variant_id);
CREATE INDEX IF NOT EXISTS product_images_product_id_type_idx ON public.product_images(product_id, image_type);

-- Cascade delete: when product deleted, delete all its images (already via product_id FK)
-- Ensure variant cascade is in place for product_images
-- Fix existing product_images rows to have image_type = 'main' if null
UPDATE public.product_images SET image_type = 'main' WHERE image_type IS NULL;

-- RLS for product_images (already exists, but ensure authenticated write)
DROP POLICY IF EXISTS "Authenticated users can manage product images" ON public.product_images;
CREATE POLICY "Authenticated users can manage product images"
ON public.product_images FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
