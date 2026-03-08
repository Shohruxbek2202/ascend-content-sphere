import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PostStructuredDataProps {
  title: string;
  description: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  url: string;
  tags?: string[];
  category?: string;
  wordCount?: number;
  isAIGenerated?: boolean;
}

const PostStructuredData = ({
  title,
  description,
  image,
  publishedTime,
  modifiedTime,
  author = 'Shohruxbek Foziljonov',
  url,
  tags = [],
  category,
  wordCount,
  isAIGenerated = false,
}: PostStructuredDataProps) => {
  const { language } = useLanguage();

  useEffect(() => {
    // Remove existing structured data
    document.querySelectorAll('script[data-type^="post-"]').forEach(el => el.remove());

    const siteUrl = window.location.origin;

    // Enhanced Article Schema with E-E-A-T signals
    const articleData: any = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: title,
      description: description,
      image: image ? {
        '@type': 'ImageObject',
        url: image,
        width: 1200,
        height: 630,
      } : undefined,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: author,
        url: `${siteUrl}/about`,
        jobTitle: 'Digital Marketing Specialist',
        knowsAbout: ['SEO', 'Digital Marketing', 'AI', 'Content Marketing'],
        sameAs: [
          'https://t.me/shohruxdigital',
          'https://www.linkedin.com/in/shohruxbek/',
        ],
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'ShohruxDigital',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/favicon.ico`,
          width: 512,
          height: 512,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      keywords: tags.join(', '),
      articleSection: category,
      inLanguage: language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US',
      isAccessibleForFree: true,
      // Speakable for voice search / AEO
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['.post-content h2', '.post-content p:first-of-type', '.post-tldr'],
      },
      // Content credibility signals
      ...(wordCount && { wordCount }),
      ...(isAIGenerated && {
        creativeWorkStatus: 'AI-assisted',
        contributor: {
          '@type': 'SoftwareApplication',
          name: 'AI Content Generator',
        },
      }),
    };

    const articleScript = document.createElement('script');
    articleScript.type = 'application/ld+json';
    articleScript.setAttribute('data-type', 'post-article');
    articleScript.textContent = JSON.stringify(articleData);
    document.head.appendChild(articleScript);

    // BreadcrumbList Schema
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: language === 'uz' ? 'Bosh sahifa' : language === 'ru' ? 'Главная' : 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${siteUrl}/blog`,
        },
        ...(category
          ? [{
              '@type': 'ListItem',
              position: 3,
              name: category,
              item: `${siteUrl}/categories`,
            }]
          : []),
        {
          '@type': 'ListItem',
          position: category ? 4 : 3,
          name: title,
          item: url,
        },
      ],
    };

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-type', 'post-breadcrumb');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(breadcrumbScript);

    // HowTo Schema - detect if content has step-by-step instructions
    // (AI-generated posts often include numbered steps)

    return () => {
      document.querySelectorAll('script[data-type^="post-"]').forEach(el => el.remove());
    };
  }, [title, description, image, publishedTime, modifiedTime, author, url, tags, category, language, wordCount, isAIGenerated]);

  return null;
};

export default PostStructuredData;
