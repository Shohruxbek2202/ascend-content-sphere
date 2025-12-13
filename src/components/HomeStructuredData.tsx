import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HomeStructuredDataProps {
  siteName: string;
  siteUrl: string;
  description: string;
  socialLinks?: string[];
}

const HomeStructuredData = ({
  siteName,
  siteUrl,
  description,
  socialLinks = [],
}: HomeStructuredDataProps) => {
  const { language } = useLanguage();

  useEffect(() => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[data-structured-data]');
    existingScripts.forEach((script) => script.remove());

    // Website Schema
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      description: description,
      inLanguage: language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/blog?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    // Organization Schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/favicon.ico`,
      description: description,
      sameAs: socialLinks.filter(Boolean),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['Uzbek', 'Russian', 'English'],
      },
    };

    // Person Schema (for personal brand)
    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Shohruxbek Foziljonov',
      url: siteUrl,
      jobTitle: 'Digital Marketing Specialist',
      description: language === 'uz' 
        ? 'Digital marketing mutaxassisi va shaxsiy rivojlanish bo\'yicha blogger'
        : language === 'ru'
        ? 'Специалист по цифровому маркетингу и блогер по личностному развитию'
        : 'Digital marketing specialist and personal development blogger',
      sameAs: socialLinks.filter(Boolean),
    };

    // BreadcrumbList Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: language === 'uz' ? 'Bosh sahifa' : language === 'ru' ? 'Главная' : 'Home',
          item: siteUrl,
        },
      ],
    };

    // Create and append scripts
    const schemas = [websiteSchema, organizationSchema, personSchema, breadcrumbSchema];
    
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-structured-data', `home-${index}`);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      const scripts = document.querySelectorAll('script[data-structured-data^="home-"]');
      scripts.forEach((script) => script.remove());
    };
  }, [siteName, siteUrl, description, socialLinks, language]);

  return null;
};

export default HomeStructuredData;
