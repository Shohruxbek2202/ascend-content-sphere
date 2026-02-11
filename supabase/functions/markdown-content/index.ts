import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const baseUrl = 'https://shohruxdigital.uz';

    const url = new URL(req.url);
    const page = url.searchParams.get('page');
    const lang = url.searchParams.get('lang') || 'en';
    const slug = url.searchParams.get('slug');

    let markdown = '';

    if (page === 'about') {
      markdown = `# About ShohruxDigital

## Shohruxbek Foziljonov
**Digital Marketing Specialist | Blogger | Educator**

ShohruxDigital is a professional blog platform dedicated to digital marketing, SMM strategies, SEO optimization, and personal development — focused on the Uzbekistan market.

### Expertise
- Digital Marketing Strategy
- Social Media Marketing (SMM)
- Search Engine Optimization (SEO)
- Google Ads & Facebook Ads
- Content Marketing
- Personal Development

### Mission
To provide practical, actionable digital marketing knowledge in Uzbek, Russian, and English languages for professionals and entrepreneurs in Central Asia.

### Contact
- Website: ${baseUrl}
- Contact page: ${baseUrl}/contact
`;
    } else if (page === 'services') {
      markdown = `# Services — ShohruxDigital

## Digital Marketing Services

### 1. SMM Strategy & Management
Complete social media strategy development and execution for Instagram, Facebook, Telegram, and other platforms.

### 2. SEO Optimization
Technical and content SEO to improve search engine rankings and organic traffic.

### 3. Contextual Advertising
Google Ads and Facebook Ads campaign setup, management, and optimization.

### 4. Content Marketing
Strategic content creation for blogs, social media, and email marketing.

### 5. Personal Development Coaching
One-on-one coaching for professional growth and career development.

### Contact
Reach out at ${baseUrl}/contact for consultations.
`;
    } else if (page === 'faq') {
      markdown = `# FAQ — ShohruxDigital

## Frequently Asked Questions

### What is ShohruxDigital?
ShohruxDigital is a digital marketing and personal development blog by Shohruxbek Foziljonov, providing practical tips and strategies for the Uzbekistan market.

### What topics do you cover?
We cover digital marketing, SMM, SEO, contextual advertising (Google Ads, Facebook Ads), and personal development.

### What languages is the content available in?
Content is available in Uzbek, Russian, and English.

### How can I subscribe to the newsletter?
Visit ${baseUrl}/subscribe to sign up for our newsletter.

### How can I contact you?
Use the contact form at ${baseUrl}/contact.
`;
    } else if (slug) {
      // Serve a specific post as markdown
      const titleField = lang === 'uz' ? 'title_uz' : lang === 'ru' ? 'title_ru' : 'title_en';
      const contentField = lang === 'uz' ? 'content_uz' : lang === 'ru' ? 'content_ru' : 'content_en';
      const excerptField = lang === 'uz' ? 'excerpt_uz' : lang === 'ru' ? 'excerpt_ru' : 'excerpt_en';

      const { data: post } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (post) {
        const date = post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : '';
        const tags = post.tags ? post.tags.join(', ') : '';
        // Strip HTML tags for clean markdown
        const cleanContent = (post[contentField] || post.content_en || '')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');

        markdown = `# ${post[titleField] || post.title_en}

**Author:** Shohruxbek Foziljonov  
**Date:** ${date}  
**Tags:** ${tags}  
**URL:** ${baseUrl}/post/${post.slug}

---

${post[excerptField] || post.excerpt_en ? `> ${post[excerptField] || post.excerpt_en}\n\n---\n\n` : ''}${cleanContent}
`;
      } else {
        return new Response('Post not found', { status: 404, headers: corsHeaders });
      }
    } else {
      // Index of available markdown pages
      const { data: posts } = await supabase
        .from('posts')
        .select('slug, title_en, title_uz, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(50);

      markdown = `# ShohruxDigital — Markdown Content Index

## Available Pages
- [About](${supabaseUrl}/functions/v1/markdown-content?page=about)
- [Services](${supabaseUrl}/functions/v1/markdown-content?page=services)
- [FAQ](${supabaseUrl}/functions/v1/markdown-content?page=faq)

## Blog Posts
`;
      if (posts) {
        for (const post of posts) {
          markdown += `- [${post.title_en || post.title_uz}](${supabaseUrl}/functions/v1/markdown-content?slug=${post.slug})\n`;
        }
      }
    }

    return new Response(markdown, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Markdown content error:', error);
    return new Response('# Error\nContent not available.', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/markdown' },
    });
  }
});
