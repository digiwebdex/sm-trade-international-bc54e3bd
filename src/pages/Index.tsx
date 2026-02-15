import { lazy, Suspense } from 'react';
import TopBar from '@/components/TopBar';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import MobileBottomBar from '@/components/MobileBottomBar';

// Lazy-load below-fold sections
const AboutSection = lazy(() => import('@/components/AboutSection'));
const ServicesSection = lazy(() => import('@/components/ServicesSection'));
const ProcessSection = lazy(() => import('@/components/ProcessSection'));
const ProductsSection = lazy(() => import('@/components/ProductsSection'));
const ClientsSection = lazy(() => import('@/components/ClientsSection'));
const QuoteRequestForm = lazy(() => import('@/components/QuoteRequestForm'));
const ContactSection = lazy(() => import('@/components/ContactSection'));
const Footer = lazy(() => import('@/components/Footer'));

const SectionFallback = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen pb-14 md:pb-0">
      <TopBar />
      <Navbar />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <AboutSection />
          <ServicesSection />
          <ProcessSection />
          <ProductsSection />
          <ClientsSection />
          <QuoteRequestForm />
          <ContactSection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <WhatsAppFloat />
      <MobileBottomBar />
    </div>
  );
};

export default Index;
