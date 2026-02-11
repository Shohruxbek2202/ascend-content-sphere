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
