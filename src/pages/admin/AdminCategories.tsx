import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plus, Pencil, Trash2, GripVertical, Package, Gift, Tag, Star, Briefcase,
  BookOpen, Pen, Globe, Award, Shirt, Coffee, Layers, Search, Eye, EyeOff,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// --- Icon registry ---
const ICONS: Record<string, React.ElementType> = {
  Package, Gift, Tag, Star, Briefcase, BookOpen, Pen, Globe, Award,
  Shirt, Coffee, Layers,
};

const ICON_NAMES = Object.keys(ICONS);

interface CategoryForm {
  name_en: string;
  name_bn: string;
  description_en: string;
  description_bn: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

const emptyForm: CategoryForm = {
  name_en: '', name_bn: '', description_en: '', description_bn: '',
  icon: 'Package', is_active: true, sort_order: 0,
};

// --- Mini live preview card ---
const CategoryPreviewCard = ({ form }: { form: CategoryForm }) => {
  const Icon = ICONS[form.icon] ?? Package;
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm truncate">{form.name_en || <span className="text-muted-foreground">English name…</span>}</p>
        <p className="text-xs text-muted-foreground truncate">{form.name_bn || 'বাংলা নাম…'}</p>
        {form.description_en && (
          <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{form.description_en}</p>
        )}
        <div className="flex gap-1.5 mt-2">
          <Badge variant={form.is_active ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
            {form.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">Order: {form.sort_order}</Badge>
        </div>
      </div>
    </div>
  );
};

// --- Icon picker ---
const IconPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [q, setQ] = useState('');
  const filtered = ICON_NAMES.filter(n => n.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search icons…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>
      <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-0.5">
        {filtered.map(name => {
          const Icon = ICONS[name];
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => onChange(name)}
              className={cn(
                'flex flex-col items-center gap-0.5 p-1.5 rounded-lg border text-[9px] transition-all',
                value === name
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/40 hover:bg-muted text-muted-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate w-full text-center">{name}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-6 text-center text-xs text-muted-foreground py-3">No icons match</p>
        )}
      </div>
    </div>
  );
};

// ===================== Main Component =====================
const AdminCategories = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string } | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [searchQ, setSearchQ] = useState('');

  // --- Queries ---
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // product counts per category
  const { data: productCounts = {} } = useQuery({
    queryKey: ['admin-categories-product-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach(p => {
        if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
      });
      return counts;
    },
  });

  const filtered = useMemo(() => {
    if (!searchQ.trim()) return categories;
    const q = searchQ.toLowerCase();
    return categories.filter(c =>
      c.name_en.toLowerCase().includes(q) ||
      (c.name_bn ?? '').includes(q) ||
      (c.description_en ?? '').toLowerCase().includes(q)
    );
  }, [categories, searchQ]);

  // --- Mutations ---
  const upsert = useMutation({
    mutationFn: async (payload: CategoryForm & { id?: string }) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from('categories').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['public-categories'] });
      toast.success(editing ? 'Category updated' : 'Category created');
      closeDialog();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['public-categories'] });
      toast.success('Category deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('categories').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['public-categories'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const idx = categories.findIndex(c => c.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= categories.length) return;
      const curr = categories[idx];
      const swap = categories[swapIdx];
      await Promise.all([
        supabase.from('categories').update({ sort_order: swap.sort_order }).eq('id', curr.id),
        supabase.from('categories').update({ sort_order: curr.sort_order }).eq('id', swap.id),
      ]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  // --- Dialog helpers ---
  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: categories.length });
    setDialogOpen(true);
  };

  const openEdit = (cat: typeof categories[0]) => {
    setEditing({ id: cat.id });
    setForm({
      name_en: cat.name_en,
      name_bn: cat.name_bn ?? '',
      description_en: cat.description_en ?? '',
      description_bn: cat.description_bn ?? '',
      icon: cat.icon ?? 'Package',
      is_active: cat.is_active,
      sort_order: cat.sort_order,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_en.trim()) { toast.error('English name is required'); return; }
    upsert.mutate(editing ? { ...form, id: editing.id } : form);
  };

  const sf = (patch: Partial<CategoryForm>) => setForm(f => ({ ...f, ...patch }));

  // Stats
  const activeCount = categories.filter(c => c.is_active).length;
  const totalProducts = Object.values(productCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Product Categories</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">{categories.length} categories</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm text-muted-foreground">{activeCount} active</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm text-muted-foreground">{totalProducts} products assigned</span>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories…"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          {searchQ ? 'No categories match your search.' : 'No categories yet — click "Add Category" to create one.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((cat, idx) => {
            const Icon = ICONS[cat.icon ?? 'Package'] ?? Package;
            const count = productCounts[cat.id] ?? 0;
            return (
              <div
                key={cat.id}
                className={cn(
                  'group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all hover:shadow-md',
                  !cat.is_active && 'opacity-55 bg-muted/40'
                )}
              >
                {/* Drag handle / order buttons */}
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => reorder.mutate({ id: cat.id, direction: 'up' })}
                    disabled={idx === 0 || reorder.isPending}
                    className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30" />
                  <button
                    type="button"
                    onClick={() => reorder.mutate({ id: cat.id, direction: 'down' })}
                    disabled={idx === filtered.length - 1 || reorder.isPending}
                    className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                {/* Names */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{cat.name_en}</p>
                    {cat.name_bn && (
                      <span className="text-xs text-muted-foreground font-normal">{cat.name_bn}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {cat.description_en && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{cat.description_en}</p>
                    )}
                    {cat.description_bn && (
                      <p className="text-xs text-muted-foreground/60 truncate max-w-xs">{cat.description_bn}</p>
                    )}
                  </div>
                </div>

                {/* Product count badge */}
                <Badge variant="secondary" className="text-xs shrink-0 gap-1">
                  <Package className="w-3 h-3" />
                  {count} {count === 1 ? 'product' : 'products'}
                </Badge>

                {/* Active toggle */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {cat.is_active ? (
                    <Eye className="w-3.5 h-3.5 text-muted-foreground/40" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground/40" />
                  )}
                  <Switch
                    checked={cat.is_active}
                    onCheckedChange={v => toggleActive.mutate({ id: cat.id, is_active: v })}
                    className="scale-90"
                  />
                </div>

                {/* Edit / Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={count > 0}
                    title={count > 0 ? 'Remove products first' : 'Delete category'}
                    onClick={() => { if (confirm(`Delete "${cat.name_en}"?`)) remove.mutate(cat.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== Dialog ===================== */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editing ? <><Pencil className="w-4 h-4" /> Edit Category</> : <><Plus className="w-4 h-4" /> New Category</>}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Live preview */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Preview</p>
              <CategoryPreviewCard form={form} />
            </div>

            {/* Bilingual name + description tabs */}
            <Tabs defaultValue="en">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Content</p>
                <TabsList className="h-7 text-xs">
                  <TabsTrigger value="en" className="text-xs px-3 h-6">🇬🇧 English</TabsTrigger>
                  <TabsTrigger value="bn" className="text-xs px-3 h-6">🇧🇩 বাংলা</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="en" className="space-y-3 mt-0">
                <div>
                  <Label>Name (English) <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.name_en}
                    onChange={e => sf({ name_en: e.target.value })}
                    placeholder="e.g. Corporate Gifts"
                    required
                  />
                </div>
                <div>
                  <Label>Description (English)</Label>
                  <Textarea
                    value={form.description_en}
                    onChange={e => sf({ description_en: e.target.value })}
                    placeholder="Brief description visible on the catalog page…"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="bn" className="space-y-3 mt-0">
                <div>
                  <Label>নাম (বাংলা)</Label>
                  <Input
                    value={form.name_bn}
                    onChange={e => sf({ name_bn: e.target.value })}
                    placeholder="যেমন: কর্পোরেট গিফট"
                  />
                  {!form.name_bn && form.name_en && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Fallback: <span className="italic">{form.name_en}</span>
                    </p>
                  )}
                </div>
                <div>
                  <Label>বিবরণ (বাংলা)</Label>
                  <Textarea
                    value={form.description_bn}
                    onChange={e => sf({ description_bn: e.target.value })}
                    placeholder="ক্যাটালগ পেজে দৃশ্যমান সংক্ষিপ্ত বিবরণ…"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Icon picker */}
            <div>
              <Label className="mb-2 block">Icon</Label>
              <IconPicker value={form.icon} onChange={v => sf({ icon: v })} />
            </div>

            {/* Sort order + Active */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={e => sf({ sort_order: parseInt(e.target.value) || 0 })}
                  min={0}
                />
                <p className="text-[11px] text-muted-foreground mt-1">Lower = appears first</p>
              </div>
              <div className="flex flex-col justify-center gap-2 pt-4">
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_active} onCheckedChange={v => sf({ is_active: v })} />
                  <Label>{form.is_active ? 'Active (visible to public)' : 'Inactive (hidden)'}</Label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={upsert.isPending}>
                {upsert.isPending ? 'Saving…' : editing ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
