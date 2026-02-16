import React, { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'bn' | 'en';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  'nav.home': { en: 'Home', bn: 'হোম' },
  'nav.about': { en: 'About', bn: 'আমাদের সম্পর্কে' },
  'nav.services': { en: 'Services', bn: 'সেবাসমূহ' },
  'nav.products': { en: 'Products', bn: 'পণ্যসমূহ' },
  'nav.contact': { en: 'Contact', bn: 'যোগাযোগ' },
  'nav.catalog': { en: 'Catalog', bn: 'ক্যাটালগ' },
  'nav.gallery': { en: 'Gallery', bn: 'গ্যালারি' },
  'nav.configurator': { en: 'Configure', bn: 'কনফিগার' },
  'nav.3dpreview': { en: '3D Preview', bn: '3D প্রিভিউ' },
  // Hero
  'hero.title': { en: 'Premium Customized Corporate Gifts & Promotional Products', bn: 'প্রিমিয়াম কাস্টমাইজড কর্পোরেট গিফট ও প্রমোশনাল পণ্য' },
  'hero.subtitle': { en: 'We customize your brand identity with quality, precision and professionalism.', bn: 'আমরা আপনার ব্র্যান্ড পরিচয় মানসম্মতভাবে, নির্ভুলতার সাথে এবং পেশাদারিত্বের মাধ্যমে কাস্টমাইজ করি।' },
  'hero.cta': { en: 'Get a Quote', bn: 'কোটেশন নিন' },
  'hero.contact': { en: 'View Products', bn: 'পণ্য দেখুন' },
  // About
  'about.title': { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
  'about.desc': { en: 'S. M. Trade International is a leading trading company specializing in customized promotional and corporate gift items. We serve both government and private sector organizations, delivering high-quality branded products with precision and care.', bn: 'এস. এম. ট্রেড ইন্টারন্যাশনাল একটি শীর্ষস্থানীয় ট্রেডিং কোম্পানি যা কাস্টমাইজড প্রমোশনাল ও কর্পোরেট গিফট আইটেমে বিশেষজ্ঞ। আমরা সরকারি ও বেসরকারি উভয় প্রতিষ্ঠানে সেবা প্রদান করি, নির্ভুলতা ও যত্নের সাথে উচ্চমানের ব্র্যান্ডেড পণ্য সরবরাহ করি।' },
  'about.stat1.label': { en: 'Years Experience', bn: 'বছরের অভিজ্ঞতা' },
  'about.stat2.label': { en: 'Happy Clients', bn: 'সন্তুষ্ট ক্লায়েন্ট' },
  'about.stat3.label': { en: 'Products Delivered', bn: 'পণ্য সরবরাহ' },
  'about.stat4.label': { en: 'Categories', bn: 'ক্যাটাগরি' },
  // Product Categories (was Services)
  'categories.title': { en: 'Our Product Categories', bn: 'আমাদের পণ্য ক্যাটাগরি' },
  'categories.1.title': { en: 'Corporate Gift Items', bn: 'কর্পোরেট গিফট আইটেম' },
  'categories.1.desc': { en: 'Tie, Crystal, Pen, Key Ring and more — custom-branded for your organization.', bn: 'টাই, ক্রিস্টাল, কলম, কী-রিং এবং আরও অনেক কিছু — আপনার প্রতিষ্ঠানের ব্র্যান্ডে কাস্টমাইজড।' },
  'categories.2.title': { en: 'Office Accessories', bn: 'অফিস আনুষাঙ্গিক' },
  'categories.2.desc': { en: 'Wooden Tissue Box, Desk Organizer, Pen Holder — elegant office essentials.', bn: 'কাঠের টিস্যু বক্স, ডেস্ক অর্গানাইজার, পেন হোল্ডার — মার্জিত অফিস সামগ্রী।' },
  'categories.3.title': { en: 'Leather Products', bn: 'লেদার পণ্য' },
  'categories.3.desc': { en: 'Executive File, Document Folder — premium leather craftsmanship.', bn: 'এক্সিকিউটিভ ফাইল, ডকুমেন্ট ফোল্ডার — প্রিমিয়াম লেদার কারুশিল্প।' },
  'categories.4.title': { en: 'Customized Glass & Crystal', bn: 'কাস্টমাইজড গ্লাস ও ক্রিস্টাল' },
  'categories.4.desc': { en: 'Award trophies, souvenirs and decorative crystal pieces with custom engraving.', bn: 'অ্যাওয়ার্ড ট্রফি, স্মারক ও কাস্টম খোদাই সহ সজ্জিত ক্রিস্টাল পিস।' },
  // Customization Process
  'process.title': { en: 'Our Customization Process', bn: 'আমাদের কাস্টমাইজেশন প্রক্রিয়া' },
  'process.1.title': { en: 'Requirement Discussion', bn: 'চাহিদা আলোচনা' },
  'process.1.desc': { en: 'We understand your needs and brand guidelines.', bn: 'আমরা আপনার চাহিদা ও ব্র্যান্ড নির্দেশিকা বুঝি।' },
  'process.2.title': { en: 'Design Approval', bn: 'ডিজাইন অনুমোদন' },
  'process.2.desc': { en: 'We share mockups for your review and approval.', bn: 'আমরা আপনার পর্যালোচনা ও অনুমোদনের জন্য মকআপ শেয়ার করি।' },
  'process.3.title': { en: 'Sample Production', bn: 'নমুনা উৎপাদন' },
  'process.3.desc': { en: 'A sample is produced for quality check.', bn: 'মান যাচাইয়ের জন্য একটি নমুনা তৈরি করা হয়।' },
  'process.4.title': { en: 'Bulk Production', bn: 'বাল্ক উৎপাদন' },
  'process.4.desc': { en: 'Full-scale production with strict quality control.', bn: 'কঠোর মান নিয়ন্ত্রণ সহ পূর্ণ-মাত্রায় উৎপাদন।' },
  'process.5.title': { en: 'Delivery', bn: 'ডেলিভারি' },
  'process.5.desc': { en: 'Timely delivery across Bangladesh.', bn: 'সারা বাংলাদেশে সময়মতো ডেলিভারি।' },
  // Products
  'products.title': { en: 'Our Products', bn: 'আমাদের পণ্যসমূহ' },
  'products.all': { en: 'All', bn: 'সব' },
  'products.corporate': { en: 'Corporate', bn: 'কর্পোরেট' },
  'products.souvenir': { en: 'Souvenir', bn: 'স্মারক' },
  'products.stationery': { en: 'Stationery', bn: 'স্টেশনারি' },
  // Clients
  'clients.title': { en: 'Our Trusted Clients', bn: 'আমাদের বিশ্বস্ত ক্লায়েন্ট' },
  'clients.subtitle': { en: 'We are proud to have served prestigious government and private organizations', bn: 'আমরা গর্বের সাথে বিভিন্ন সরকারি ও বেসরকারি প্রতিষ্ঠানে সেবা প্রদান করেছি' },
  // Contact
  'contact.title': { en: 'Contact Us', bn: 'যোগাযোগ করুন' },
  'contact.name': { en: 'Your Name', bn: 'আপনার নাম' },
  'contact.email': { en: 'Your Email', bn: 'আপনার ইমেইল' },
  'contact.phone': { en: 'Your Phone', bn: 'আপনার ফোন' },
  'contact.message': { en: 'Your Message', bn: 'আপনার মেসেজ' },
  'contact.send': { en: 'Send Message', bn: 'মেসেজ পাঠান' },
  'contact.whatsapp': { en: 'Chat on WhatsApp', bn: 'WhatsApp এ চ্যাট করুন' },
  'contact.address': { en: 'Address', bn: 'ঠিকানা' },
  'contact.addressValue': { en: 'Dhaka, Bangladesh', bn: 'ঢাকা, বাংলাদেশ' },
  // Quote Request
  'quote.title': { en: 'Request a Quote', bn: 'কোটেশন অনুরোধ করুন' },
  'quote.subtitle': { en: 'Need customized corporate gifts in bulk? Fill out the form below and we\'ll get back to you with a detailed quote.', bn: 'বাল্কে কাস্টমাইজড কর্পোরেট গিফট প্রয়োজন? নিচের ফর্মটি পূরণ করুন এবং আমরা আপনাকে বিস্তারিত কোটেশন পাঠাব।' },
  'quote.companyName': { en: 'Company / Organization Name', bn: 'কোম্পানি / প্রতিষ্ঠানের নাম' },
  'quote.contactPerson': { en: 'Contact Person', bn: 'যোগাযোগকারী ব্যক্তি' },
  'quote.email': { en: 'Email Address', bn: 'ইমেইল ঠিকানা' },
  'quote.phone': { en: 'Phone Number', bn: 'ফোন নম্বর' },
  'quote.productInterest': { en: 'Product Interest (e.g. Crystal, Tie)', bn: 'পণ্যের আগ্রহ (যেমন ক্রিস্টাল, টাই)' },
  'quote.quantity': { en: 'Estimated Quantity', bn: 'আনুমানিক পরিমাণ' },
  'quote.message': { en: 'Describe your requirements', bn: 'আপনার চাহিদা বর্ণনা করুন' },
  'quote.uploadLogo': { en: 'Upload Company Logo', bn: 'কোম্পানির লোগো আপলোড করুন' },
  'quote.uploadHint': { en: 'PNG, JPG, SVG or PDF — Max 5MB', bn: 'PNG, JPG, SVG বা PDF — সর্বোচ্চ ৫MB' },
  'quote.submit': { en: 'Submit Quote Request', bn: 'কোটেশন অনুরোধ জমা দিন' },
  'quote.submitting': { en: 'Submitting...', bn: 'জমা হচ্ছে...' },
  'quote.success': { en: 'Quote request submitted successfully! We\'ll contact you soon.', bn: 'কোটেশন অনুরোধ সফলভাবে জমা হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।' },
  'quote.error': { en: 'Failed to submit. Please try again.', bn: 'জমা দিতে ব্যর্থ। আবার চেষ্টা করুন।' },
  'quote.requiredError': { en: 'Please fill in all required fields.', bn: 'সকল আবশ্যক ক্ষেত্র পূরণ করুন।' },
  'quote.fileTypeError': { en: 'Only PNG, JPG, SVG or PDF files allowed.', bn: 'শুধুমাত্র PNG, JPG, SVG বা PDF ফাইল অনুমোদিত।' },
  'quote.fileSizeError': { en: 'File must be under 5MB.', bn: 'ফাইল ৫MB এর কম হতে হবে।' },
  // Footer
  'footer.rights': { en: 'All rights reserved.', bn: 'সর্বস্বত্ব সংরক্ষিত।' },
  'footer.desc': { en: 'Your trusted partner for customized corporate gifts & promotional products.', bn: 'কাস্টমাইজড কর্পোরেট গিফট ও প্রমোশনাল পণ্যের আপনার বিশ্বস্ত অংশীদার।' },
  'footer.quicklinks': { en: 'Quick Links', bn: 'দ্রুত লিংক' },
  'footer.contactinfo': { en: 'Contact Info', bn: 'যোগাযোগ তথ্য' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>('en');
  const toggleLang = () => setLang(l => l === 'en' ? 'bn' : 'en');
  const t = (key: string) => translations[key]?.[lang] ?? key;
  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
