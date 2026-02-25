import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

const BreadcrumbJsonLd = ({ items }: BreadcrumbJsonLdProps) => {
  const { language } = useLanguage();

  useEffect(() => {
    // Remove existing breadcrumb schema
    const existing = document.querySelector('script[data-type="breadcrumb-page"]');
    if (existing) existing.remove();

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shohruxdigital.uz';
    const homeName = language === 'uz' ? 'Bosh sahifa' : language === 'ru' ? 'Главная' : 'Home';

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: homeName,
          item: siteUrl,
        },
        ...items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 2,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
        })),
      ],
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-type', 'breadcrumb-page');
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      const el = document.querySelector('script[data-type="breadcrumb-page"]');
      if (el) el.remove();
    };
  }, [items, language]);

  return null;
};

export default BreadcrumbJsonLd;
