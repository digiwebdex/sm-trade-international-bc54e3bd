import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import logo from '@/assets/logo.jpeg';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();
  const { get } = useSiteSettings();

  const desc = get('footer', 'description', t('footer.desc'));
  const copyright = get('footer', 'copyright', t('footer.rights'));
  const phone = get('contact', 'phone', '+88 01867666888');
  const email = get('contact', 'email', 'smtrade.int94@gmail.com');
  const address = get('contact', 'address', t('contact.addressValue'));

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Logo" className="h-10 rounded" />
              <span className="font-bold text-lg">S. M. Trade International</span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">{desc}</p>
          </div>

          <div>
            <h4 className="font-bold mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('footer.quicklinks')}</h4>
            <div className="space-y-2">
              {['nav.home', 'nav.about', 'nav.services', 'nav.products', 'nav.contact'].map(k => (
                <a key={k} href={`#${k.split('.')[1]}`} className="block text-primary-foreground/60 hover:text-[hsl(var(--sm-gold))] text-sm transition-colors">
                  {t(k)}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('footer.contactinfo')}</h4>
            <div className="space-y-3 text-sm text-primary-foreground/60">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{address}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" />{phone}</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" />{email}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-primary-foreground/40 text-sm">
          © {new Date().getFullYear()} S. M. Trade International. {copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
