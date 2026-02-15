import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, PackagePlus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import BulkUploadZone, { type FileItem } from '@/components/admin/BulkUploadZone';

interface ProductForm {
  name_en: string;
  name_bn: string;
  description_en: string;
  description_bn: string;
  category_id: string;
  image_url: string;
  is_active: boolean;
}

const emptyForm: ProductForm = {
  name_en: '', name_bn: '', description_en: '', description_bn: '',
  category_id: '', image_url: '', is_active: true,
};

const AdminProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Bulk state
  const [bulkFiles, setBulkFiles] = useState<FileItem[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name_en)')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('cms-images').upload(path, file);
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('cms-images').getPublicUrl(path);
    setForm(f => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, category_id: form.category_id || null };
      if (editId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert({ ...payload, sort_order: products.length + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: editId ? 'Product updated' : 'Product created' });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Product deleted' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const openEdit = (prod: typeof products[0]) => {
    setEditId(prod.id);
    setForm({
      name_en: prod.name_en, name_bn: prod.name_bn,
      description_en: prod.description_en ?? '', description_bn: prod.description_bn ?? '',
      category_id: prod.category_id ?? '', image_url: prod.image_url ?? '', is_active: prod.is_active,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditId(null); setForm(emptyForm); };

  // Bulk import handler
  const handleBulkImport = useCallback(async () => {
    const pending = bulkFiles.filter(f => f.status === 'pending');
    if (pending.length === 0) return;
    setBulkImporting(true);

    const updated = [...bulkFiles];
    let successCount = 0;
    const baseOrder = products.length + 1;

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== 'pending') continue;
      updated[i] = { ...updated[i], status: 'uploading' };
      setBulkFiles([...updated]);

      try {
        // Upload image
        const ext = updated[i].file.name.split('.').pop();
        const path = `products/${Date.now()}-${i}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('cms-images').upload(path, updated[i].file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('cms-images').getPublicUrl(path);

        // Derive product name from filename
        const name = updated[i].file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        // Insert product
        const { error: insertErr } = await supabase.from('products').insert({
          name_en: name,
          name_bn: '',
          image_url: urlData.publicUrl,
          category_id: bulkCategory || null,
          is_active: true,
          sort_order: baseOrder + successCount,
        });
        if (insertErr) throw insertErr;

        updated[i] = { ...updated[i], status: 'done', url: urlData.publicUrl };
        successCount++;
      } catch (err: any) {
        updated[i] = { ...updated[i], status: 'error', error: err.message };
      }
      setBulkFiles([...updated]);
    }

    setBulkImporting(false);
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    toast({ title: `${successCount} products added`, description: `From ${pending.length} images.` });
  }, [bulkFiles, bulkCategory, products.length, queryClient, toast]);

  const closeBulk = () => {
    setBulkOpen(false);
    setBulkFiles([]);
    setBulkCategory('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-muted-foreground text-sm">{products.length} products</p>
        <div className="flex gap-2">
          {/* Bulk Add */}
          <Dialog open={bulkOpen} onOpenChange={v => { if (!v) closeBulk(); else setBulkOpen(true); }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PackagePlus className="h-4 w-4 mr-2" /> Bulk Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Add Products</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Drop multiple images to create products instantly. Product names will be derived from filenames.
                </p>
                <div>
                  <label className="text-sm font-medium">Category (optional)</label>
                  <Select value={bulkCategory} onValueChange={setBulkCategory}>
                    <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <BulkUploadZone files={bulkFiles} onFilesChange={setBulkFiles} disabled={bulkImporting} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeBulk} disabled={bulkImporting}>Cancel</Button>
                  <Button
                    onClick={handleBulkImport}
                    disabled={bulkImporting || bulkFiles.filter(f => f.status === 'pending').length === 0}
                    className="bg-sm-red hover:bg-[hsl(var(--sm-red-dark))] text-white"
                  >
                    {bulkImporting ? 'Importing...' : `Add ${bulkFiles.filter(f => f.status === 'pending').length} Products`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Single Add */}
          <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); else setDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="bg-sm-red hover:bg-[hsl(var(--sm-red-dark))] text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editId ? 'Edit Product' : 'Add Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name (English)</label>
                    <Input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name (বাংলা)</label>
                    <Input value={form.name_bn} onChange={e => setForm(f => ({ ...f, name_bn: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Description (English)</label>
                    <Textarea value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} rows={3} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description (বাংলা)</label>
                    <Textarea value={form.description_bn} onChange={e => setForm(f => ({ ...f, description_bn: e.target.value }))} rows={3} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Product Image</label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
                  {form.image_url ? (
                    <div className="relative mt-2">
                      <img src={form.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <Button type="button" size="sm" variant="secondary" className="absolute bottom-2 right-2"
                        onClick={() => fileRef.current?.click()}>Change</Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="w-full mt-2 h-32 flex-col gap-2"
                      onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <span className="text-sm">Uploading...</span> : (
                        <><Upload className="h-6 w-6 text-muted-foreground" /><span className="text-sm text-muted-foreground">Click to upload image</span></>
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                  <label className="text-sm">Active</label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button type="submit" className="bg-sm-red hover:bg-[hsl(var(--sm-red-dark))] text-white" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="h-48" /></Card>)}
        </div>
      ) : products.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No products yet. Add your first product.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(prod => (
            <Card key={prod.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-muted relative">
                {prod.image_url ? (
                  <img src={prod.image_url} alt={prod.name_en} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${prod.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {prod.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <CardContent className="p-4">
                <p className="font-medium text-sm mb-1">{prod.name_en}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {(prod as any).categories?.name_en ?? 'Uncategorized'}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(prod)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(prod.id); }}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
