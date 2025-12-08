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
}: PostStructuredDataProps) => {
  const { language } = useLanguage();

  useEffect(() => {
    // Remove existing structured data
    const existing = document.querySelector('script[type="application/ld+json"][data-type="article"]');
    if (existing) {
      existing.remove();
    }

    // Create Article structured data
    const articleData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: description,
      image: image ? [image] : undefined,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: {
        '@type': 'Person',
        name: author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Shohruxbek Foziljonov',
        logo: {
          '@type': 'ImageObject',
          url: 'https://storage.googleapis.com/gpt-engineer-file-uploads/djz9LtjpIaVGLdxEpLax0XzS61m1/uploads/1764834702842-blog-3d-illustration-icon-png.webp',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      keywords: tags.join(', '),
      articleSection: category,
      inLanguage: language === 'uz' ? 'uz' : language === 'ru' ? 'ru' : 'en',
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-type', 'article');
    script.textContent = JSON.stringify(articleData);
    document.head.appendChild(script);

    // Create BreadcrumbList structured data
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: language === 'uz' ? 'Bosh sahifa' : language === 'ru' ? 'Главная' : 'Home',
          item: window.location.origin,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${window.location.origin}/blog`,
        },
        ...(category
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: category,
                item: `${window.location.origin}/categories`,
              },
            ]
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
    breadcrumbScript.setAttribute('data-type', 'breadcrumb');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(breadcrumbScript);

    return () => {
      const articleScript = document.querySelector('script[type="application/ld+json"][data-type="article"]');
      const breadcrumbScriptEl = document.querySelector('script[type="application/ld+json"][data-type="breadcrumb"]');
      if (articleScript) articleScript.remove();
      if (breadcrumbScriptEl) breadcrumbScriptEl.remove();
    };
  }, [title, description, image, publishedTime, modifiedTime, author, url, tags, category, language]);

  return null;
};

export default PostStructuredData;
