import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const SEOHead = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  author,
  section,
  tags = [],
}: SEOHeadProps) => {
  const { language } = useLanguage();
  const [siteKeywords, setSiteKeywords] = useState<string[]>([]);

  useEffect(() => {
    const fetchKeywords = async () => {
      const { data } = await supabase
        .from('seo_keywords')
        .select('keyword')
        .eq('language', language)
        .order('priority', { ascending: false })
        .limit(20);

      if (data) {
        setSiteKeywords(data.map((k) => k.keyword));
      }
    };

    fetchKeywords();
  }, [language]);

  useEffect(() => {
    // Combine provided keywords with site keywords
    const allKeywords = [...new Set([...keywords, ...siteKeywords, ...tags])];
    
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    if (description) {
      updateMeta('description', description);
    }

    if (allKeywords.length > 0) {
      updateMeta('keywords', allKeywords.join(', '));
    }

    // Open Graph
    if (title) {
      updateMeta('og:title', title, true);
    }
    if (description) {
      updateMeta('og:description', description, true);
    }
    if (image) {
      updateMeta('og:image', image, true);
    }
    if (url) {
      updateMeta('og:url', url, true);
    }
    updateMeta('og:type', type, true);
    updateMeta('og:locale', language === 'uz' ? 'uz_UZ' : language === 'ru' ? 'ru_RU' : 'en_US', true);

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    if (title) {
      updateMeta('twitter:title', title);
    }
    if (description) {
      updateMeta('twitter:description', description);
    }
    if (image) {
      updateMeta('twitter:image', image);
    }

    // Article specific meta
    if (type === 'article') {
      if (publishedTime) {
        updateMeta('article:published_time', publishedTime, true);
      }
      if (author) {
        updateMeta('article:author', author, true);
      }
      if (section) {
        updateMeta('article:section', section, true);
      }
      tags.forEach((tag, index) => {
        updateMeta(`article:tag:${index}`, tag, true);
      });
    }

    // Canonical URL
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    // Language alternates
    const currentUrl = url || window.location.href;
    const baseUrl = currentUrl.replace(/\/(uz|ru|en)\//, '/');
    
    ['uz', 'ru', 'en'].forEach((lang) => {
      const hreflang = lang === 'uz' ? 'uz' : lang === 'ru' ? 'ru' : 'en';
      const langUrl = baseUrl.replace(/^(https?:\/\/[^\/]+)/, `$1/${lang}`);
      
      let alternate = document.querySelector(`link[hreflang="${hreflang}"]`);
      if (!alternate) {
        alternate = document.createElement('link');
        alternate.setAttribute('rel', 'alternate');
        alternate.setAttribute('hreflang', hreflang);
        document.head.appendChild(alternate);
      }
      alternate.setAttribute('href', langUrl);
    });

  }, [title, description, keywords, image, url, type, publishedTime, author, section, tags, language, siteKeywords]);

  return null; // This component doesn't render anything
};

export default SEOHead;
