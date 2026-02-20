/**
 * ProductImageManager
 * Handles 5-view image uploads (main, front, back, left, right) for a product or variant.
 * Used inside AdminProducts edit dialog.
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Loader2, ImageIcon } from 'lucide-react';

export type ImageType = 'main' | 'front' | 'back' | 'left' | 'right';

const IMAGE_VIEWS: { type: ImageType; label: string; description: string }[] = [
  { type: 'main', label: 'Main', description: 'Primary product image' },
  { type: 'front', label: 'Front', description: 'Front view' },
  { type: 'back', label: 'Back', description: 'Back view' },
  { type: 'left', label: 'Left', description: 'Left side view' },
  { type: 'right', label: 'Right', description: 'Right side view' },
];

interface ProductImageManagerProps {
  productId: string;
  variantId?: string | null;  // if set, images are scoped to this variant
}

interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  image_url: string;
  image_type: ImageType;
  sort_order: number;
}

const ProductImageManager = ({ productId, variantId = null }: ProductImageManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<ImageType | null>(null);

  const queryKey = ['product-view-images', productId, variantId];

  const { data: images = [] } = useQuery<ProductImage[]>({
    queryKey,
    queryFn: async () => {
      let q = supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order');

      if (variantId) {
        q = q.eq('variant_id', variantId);
      } else {
        q = q.is('variant_id', null);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data as ProductImage[]) ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_images').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['product-images', productId] });
      toast({ title: 'Image removed' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const handleUpload = async (file: File, imageType: ImageType) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB.', variant: 'destructive' });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast({ title: 'Invalid type', description: 'JPG, PNG, WebP, GIF only.', variant: 'destructive' });
      return;
    }

    setUploading(imageType);
    const ext = file.name.split('.').pop();
    const scope = variantId ? `variant-${variantId}` : `product-${productId}`;
    const path = `product-views/${scope}/${imageType}-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from('cms-images').upload(path, file);
    if (uploadErr) {
      toast({ title: 'Upload failed', description: uploadErr.message, variant: 'destructive' });
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from('cms-images').getPublicUrl(path);

    // Remove existing image of same type+scope if any
    const existing = images.find(img => img.image_type === imageType);
    if (existing) {
      await supabase.from('product_images').delete().eq('id', existing.id);
    }

    const insertPayload: any = {
      product_id: productId,
      variant_id: variantId,
      image_url: urlData.publicUrl,
      image_type: imageType,
      sort_order: IMAGE_VIEWS.findIndex(v => v.type === imageType),
    };

    const { error: insertErr } = await supabase.from('product_images').insert(insertPayload);
    if (insertErr) {
      toast({ title: 'Save failed', description: insertErr.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['product-images', productId] });
      toast({ title: `${imageType.charAt(0).toUpperCase() + imageType.slice(1)} image uploaded` });
    }

    setUploading(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {variantId ? 'Variant Images' : 'Product View Images'}
      </p>
      <div className="grid grid-cols-5 gap-2">
        {IMAGE_VIEWS.map(view => {
          const img = images.find(i => i.image_type === view.type);
          const isUploading = uploading === view.type;

          return (
            <div key={view.type} className="flex flex-col gap-1">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-border/40 bg-muted/30 group hover:border-border transition-colors">
                {img ? (
                  <>
                    <img
                      src={img.image_url}
                      alt={view.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <label className="cursor-pointer p-1 bg-white/90 rounded-full hover:bg-white transition-colors" title="Replace">
                        <Upload className="h-3 w-3 text-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], view.type); }}
                        />
                      </label>
                      <button
                        onClick={() => deleteMutation.mutate(img.id)}
                        className="p-1 bg-red-500/90 rounded-full hover:bg-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-muted/60 transition-colors">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                        <Upload className="h-3 w-3 text-muted-foreground/30" />
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], view.type); }}
                    />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-center text-muted-foreground font-medium">{view.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductImageManager;
