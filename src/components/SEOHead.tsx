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
  siteName?: string;
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
  siteName = 'ShohruxDigital',
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

    // Robots meta
    updateMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Open Graph - all required tags
    if (title) {
      updateMeta('og:title', title, true);
    }
    if (description) {
      updateMeta('og:description', description, true);
    }
    if (image) {
      updateMeta('og:image', image, true);
      updateMeta('og:image:width', '1200', true);
      updateMeta('og:image:height', '630', true);
      updateMeta('og:image:type', 'image/jpeg', true);
    }
    
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    if (currentUrl) {
      updateMeta('og:url', currentUrl, true);
    }
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', siteName, true);
    updateMeta('og:locale', language === 'uz' ? 'uz_UZ' : language === 'ru' ? 'ru_RU' : 'en_US', true);

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:site', '@F_Shohruxbek');
    updateMeta('twitter:creator', '@F_Shohruxbek');
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
    if (currentUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      // Clean URL for canonical (remove trailing slashes, query params for homepage)
      const cleanUrl = currentUrl.split('?')[0].replace(/\/$/, '') || currentUrl;
      canonical.setAttribute('href', cleanUrl);
    }

    // Language alternates
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // Remove existing alternates
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    
    ['uz', 'ru', 'en'].forEach((lang) => {
      const alternate = document.createElement('link');
      alternate.setAttribute('rel', 'alternate');
      alternate.setAttribute('hreflang', lang);
      // For homepage, just use base URL with language
      const langUrl = pathname === '/' || pathname === '' 
        ? `${baseUrl}/${lang}` 
        : `${baseUrl}/${lang}${pathname}`;
      alternate.setAttribute('href', langUrl);
      document.head.appendChild(alternate);
    });

    // x-default for language selector
    const xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', baseUrl);
    document.head.appendChild(xDefault);

  }, [title, description, keywords, image, url, type, publishedTime, author, section, tags, language, siteKeywords, siteName]);

  return null;
};

export default SEOHead;
