import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, PenTool, FlaskConical, Factory, Truck } from 'lucide-react';

const steps = [
  { icon: MessageSquare, titleKey: 'process.1.title', descKey: 'process.1.desc' },
  { icon: PenTool, titleKey: 'process.2.title', descKey: 'process.2.desc' },
  { icon: FlaskConical, titleKey: 'process.3.title', descKey: 'process.3.desc' },
  { icon: Factory, titleKey: 'process.4.title', descKey: 'process.4.desc' },
  { icon: Truck, titleKey: 'process.5.title', descKey: 'process.5.desc' },
];

const ProcessSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('process.title')}</h2>
        <div className="w-16 h-1 bg-sm-gold mx-auto mb-14 rounded" />

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="w-20 h-20 rounded-full bg-background border-2 border-sm-red flex items-center justify-center mb-4 relative z-10 shadow-md">
                  <step.icon className="h-8 w-8 text-sm-red" />
                </div>
                <span className="text-xs font-bold text-sm-red mb-2 uppercase tracking-wider">
                  Step {i + 1}
                </span>
                <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: 'DM Sans, Noto Sans Bengali, sans-serif' }}>
                  {t(step.titleKey)}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
