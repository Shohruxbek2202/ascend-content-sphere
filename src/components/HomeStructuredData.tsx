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

    // Organization Schema (Enhanced Entity SEO)
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      alternateName: ['Shohrux Digital', 'ShohruxDigital.uz'],
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`,
        width: 512,
        height: 512,
      },
      description: description,
      foundingDate: '2024',
      founder: { '@type': 'Person', '@id': `${siteUrl}/#person` },
      sameAs: socialLinks.filter(Boolean),
      areaServed: {
        '@type': 'Country',
        name: 'Uzbekistan',
      },
      knowsAbout: [
        'Digital Marketing', 'SMM', 'SEO', 'Google Ads', 'Facebook Ads',
        'Content Marketing', 'Personal Development', 'Prompt Engineering',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['Uzbek', 'Russian', 'English'],
        url: `${siteUrl}/contact`,
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Digital Marketing Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SMM Strategy & Management' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SEO Optimization' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Google Ads Management' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Facebook/Meta Ads Management' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Content Marketing' } },
        ],
      },
    };

    // Person Schema (Enhanced Entity SEO)
    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Shohruxbek Foziljonov',
      givenName: 'Shohruxbek',
      familyName: 'Foziljonov',
      url: siteUrl,
      image: `${siteUrl}/favicon.ico`,
      jobTitle: 'Digital Marketing Specialist',
      worksFor: { '@type': 'Organization', '@id': `${siteUrl}/#organization` },
      alumniOf: { '@type': 'Organization', name: 'ShohruxDigital' },
      knowsAbout: [
        'Digital Marketing', 'Social Media Marketing', 'Search Engine Optimization',
        'Google Ads', 'Facebook Advertising', 'Content Strategy', 'Personal Development',
      ],
      knowsLanguage: ['uz', 'ru', 'en'],
      nationality: { '@type': 'Country', name: 'Uzbekistan' },
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

    // FAQ Schema for AI citations
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: language === 'uz' ? 'ShohruxDigital nima?' : language === 'ru' ? 'Что такое ShohruxDigital?' : 'What is ShohruxDigital?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: language === 'uz'
              ? 'ShohruxDigital — Shohruxbek Foziljonov tomonidan yaratilgan digital marketing, SMM, SEO va shaxsiy rivojlanish bo\'yicha professional blog platformasi.'
              : language === 'ru'
              ? 'ShohruxDigital — профессиональная блог-платформа по цифровому маркетингу, SMM, SEO и личностному развитию, созданная Шохрухбеком Фозилжоновым.'
              : 'ShohruxDigital is a professional blog platform about digital marketing, SMM, SEO, and personal development by Shohruxbek Foziljonov.',
          },
        },
        {
          '@type': 'Question',
          name: language === 'uz' ? 'Qanday xizmatlar ko\'rsatiladi?' : language === 'ru' ? 'Какие услуги предоставляются?' : 'What services are offered?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: language === 'uz'
              ? 'Digital marketing konsalting, SMM strategiya, SEO optimizatsiya, kontekstli reklama (Google Ads, Facebook Ads) va shaxsiy rivojlanish coaching xizmatlari.'
              : language === 'ru'
              ? 'Консалтинг по цифровому маркетингу, SMM-стратегия, SEO-оптимизация, контекстная реклама (Google Ads, Facebook Ads) и коучинг по личностному развитию.'
              : 'Digital marketing consulting, SMM strategy, SEO optimization, contextual advertising (Google Ads, Facebook Ads), and personal development coaching.',
          },
        },
        {
          '@type': 'Question',
          name: language === 'uz' ? 'Blog qaysi tillarda mavjud?' : language === 'ru' ? 'На каких языках доступен блог?' : 'What languages is the blog available in?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: language === 'uz'
              ? 'Blog o\'zbek, rus va ingliz tillarida mavjud.'
              : language === 'ru'
              ? 'Блог доступен на узбекском, русском и английском языках.'
              : 'The blog is available in Uzbek, Russian, and English.',
          },
        },
      ],
    };

    // Create and append scripts
    const schemas = [websiteSchema, organizationSchema, personSchema, breadcrumbSchema, faqSchema];
    
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
