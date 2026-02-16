import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Award, Users, Package, Layers } from 'lucide-react';

const icons = [Award, Users, Package, Layers];

const AboutSection = () => {
  const { t } = useLanguage();
  const { get } = useSiteSettings();

  const title = get('about', 'title', t('about.title'));
  const desc = get('about', 'description', t('about.desc'));

  const stats = [
    { icon: icons[0], value: get('about', 'stat1_value', '10+'), label: get('about', 'stat1_label', t('about.stat1.label')) },
    { icon: icons[1], value: get('about', 'stat2_value', '200+'), label: get('about', 'stat2_label', t('about.stat2.label')) },
    { icon: icons[2], value: get('about', 'stat3_value', '5000+'), label: get('about', 'stat3_label', t('about.stat3.label')) },
    { icon: icons[3], value: get('about', 'stat4_value', '50+'), label: get('about', 'stat4_label', t('about.stat4.label')) },
  ];

  return (
    <section id="about" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{title}</h2>
        <div className="w-16 h-1 bg-sm-gold mx-auto mb-8 rounded" />
        <p className="text-muted-foreground text-center max-w-3xl mx-auto text-lg mb-12 leading-relaxed">
          {desc}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-background rounded-xl p-6 text-center shadow-md hover:shadow-lg hover-lift transition-shadow duration-300">
              <s.icon className="h-8 w-8 mx-auto mb-3 text-sm-red" />
              <div className="text-3xl font-bold mb-1">{s.value}</div>
              <div className="text-muted-foreground text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
