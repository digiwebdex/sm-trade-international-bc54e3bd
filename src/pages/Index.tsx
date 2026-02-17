import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import ProcessSection from '@/components/ProcessSection';
import ProductsSection from '@/components/ProductsSection';
import ClientsSection from '@/components/ClientsSection';
import BulkOrderCalculator from '@/components/BulkOrderCalculator';
import QuoteRequestForm from '@/components/QuoteRequestForm';
import ContactSection from '@/components/ContactSection';

const sectionComponents: Record<string, React.ComponentType> = {
  hero: HeroSection,
  about: AboutSection,
  services: ServicesSection,
  process: ProcessSection,
  products: ProductsSection,
  clients: ClientsSection,
  calculator: BulkOrderCalculator,
  quote: QuoteRequestForm,
  contact: ContactSection,
};

const defaultOrder = ['hero', 'about', 'services', 'process', 'products', 'clients', 'calculator', 'quote', 'contact'];

const Index = () => {
  const { data: config } = useQuery({
    queryKey: ['site-settings-home-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'home_sections')
        .maybeSingle();
      if (error) throw error;
      return data?.setting_value as { order?: string[]; hidden?: string[] } | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const order = config?.order?.length ? config.order : defaultOrder;
  const hidden = new Set(config?.hidden ?? []);

  return (
    <main>
      {order.map(id => {
        if (hidden.has(id)) return null;
        const Component = sectionComponents[id];
        return Component ? <Component key={id} /> : null;
      })}
    </main>
  );
};

export default Index;
