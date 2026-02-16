import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileUp, X, Send, Building2 } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'];

const QuoteRequestForm = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    product_interest: '',
    quantity: '',
    message: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast({ title: t('quote.fileTypeError'), variant: 'destructive' });
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast({ title: t('quote.fileSizeError'), variant: 'destructive' });
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_person || !form.email || !form.message) {
      toast({ title: t('quote.requiredError'), variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      let logo_url: string | null = null;

      if (file) {
        const ext = file.name.split('.').pop();
        const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('quote-attachments')
          .upload(path, file);
        if (uploadErr) throw uploadErr;
        logo_url = path;
      }

      const { error } = await supabase.from('quote_requests').insert({
        company_name: form.company_name.trim(),
        contact_person: form.contact_person.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        product_interest: form.product_interest.trim() || null,
        quantity: form.quantity ? parseInt(form.quantity, 10) : null,
        message: form.message.trim(),
        logo_url,
      });

      if (error) throw error;

      toast({ title: t('quote.success') });
      setForm({ company_name: '', contact_person: '', email: '', phone: '', product_interest: '', quantity: '', message: '' });
      setFile(null);
    } catch (err) {
      console.error(err);
      toast({ title: t('quote.error'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "bg-background border-border/50 shadow-sm focus:shadow-md transition-shadow";

  return (
    <section id="quote" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Building2 className="h-8 w-8 text-sm-red" />
          <h2 className="text-3xl md:text-4xl font-bold text-center">{t('quote.title')}</h2>
        </div>
        <p className="text-center text-muted-foreground mb-2 max-w-2xl mx-auto">{t('quote.subtitle')}</p>
        <div className="w-16 h-1 bg-sm-gold mx-auto mb-12 rounded" />

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder={t('quote.companyName') + ' *'} value={form.company_name} onChange={set('company_name')} className={inputClass} required />
            <Input placeholder={t('quote.contactPerson') + ' *'} value={form.contact_person} onChange={set('contact_person')} className={inputClass} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input type="email" placeholder={t('quote.email') + ' *'} value={form.email} onChange={set('email')} className={inputClass} required />
            <Input type="tel" placeholder={t('quote.phone')} value={form.phone} onChange={set('phone')} className={inputClass} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder={t('quote.productInterest')} value={form.product_interest} onChange={set('product_interest')} className={inputClass} />
            <Input type="number" min="1" placeholder={t('quote.quantity')} value={form.quantity} onChange={set('quantity')} className={inputClass} />
          </div>
          <Textarea placeholder={t('quote.message') + ' *'} value={form.message} onChange={set('message')} rows={5} className={inputClass} required />

          {/* File upload */}
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.svg,.pdf" onChange={handleFile} className="hidden" />
            <Button type="button" variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
              <FileUp className="h-4 w-4" />
              {t('quote.uploadLogo')}
            </Button>
            <p className="text-xs text-muted-foreground">{t('quote.uploadHint')}</p>
            {file && (
              <div className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded-md w-fit">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-sm-red hover:bg-[hsl(var(--sm-red-dark))] text-white gap-2">
            <Send className="h-4 w-4" />
            {submitting ? t('quote.submitting') : t('quote.submit')}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default QuoteRequestForm;
