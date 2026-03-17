import { Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const TopBar = () => {
  const { lang, setLang } = useLanguage();
  const { get } = useSiteSettings();

  const phone = get('contact', 'phone', '+8801867666888');
  const email = get('contact', 'email', 'smtrade.int94@gmail.com');
  const whatsapp = get('contact', 'whatsapp_number', '8801867666888');
  const badge = get('branding', 'topbar_badge', '1st Class Govt. Contractor, Supplier & Importer');

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '') || '8801867666888';

  const langOptions: { code: 'en' | 'bn' | 'zh'; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'bn', label: 'বাং' },
    { code: 'zh', label: '中文' },
  ];

  return (
    <div className="bg-primary text-primary-foreground py-2 text-sm">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <a href={`tel:${cleanPhone}`} className="flex items-center gap-1.5 hover:text-sm-red transition-colors">
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{phone}</span>
          </a>
          <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-sm-red transition-colors">
            <Mail className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{email}</span>
          </a>
          <a
            href={`https://wa.me/${cleanWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-sm-red transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.556-1.466A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.822-6.34-2.2l-.144-.112-3.392 1.092 1.113-3.33-.122-.152A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[hsl(var(--sm-gold))] font-medium text-xs">
            {badge}
          </span>
          <div className="flex items-center gap-1">
            {langOptions.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLang(opt.code)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  lang === opt.code
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'border border-primary-foreground/30 hover:bg-primary-foreground/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
