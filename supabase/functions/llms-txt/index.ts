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

    // Fetch published posts
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, title_uz, title_en, title_ru, excerpt_uz, excerpt_en, published_at, tags')
      .eq('published', true)
      .order('published_at', { ascending: false });

    // Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('name_uz, name_en, slug, description_uz, description_en');

    let llmsTxt = `# ShohruxDigital
> Digital marketing, SMM, SEO va shaxsiy rivojlanish bo'yicha professional blog

## Haqida (About)
ShohruxDigital — Shohruxbek Foziljonov tomonidan yaratilgan digital marketing va shaxsiy rivojlanish bo'yicha blog platformasi. Sayt O'zbekiston bozori uchun digital marketing, SMM strategiyalar, SEO optimizatsiya, kontekstli reklama va shaxsiy rivojlanish bo'yicha amaliy maslahatlar taqdim etadi.

## Muallif (Author)
- Ism: Shohruxbek Foziljonov
- Kasb: Digital Marketing Specialist
- Sayt: ${baseUrl}
- Tillar: O'zbek, Rus, Ingliz

## Xizmatlar (Services)
- Digital Marketing Konsalting
- SMM Strategiya va Boshqaruv
- SEO Optimizatsiya
- Kontekstli Reklama (Google Ads, Facebook Ads)
- Shaxsiy Rivojlanish Coaching

## Asosiy Sahifalar (Key Pages)
- Bosh sahifa: ${baseUrl}
- Blog: ${baseUrl}/blog
- Kategoriyalar: ${baseUrl}/categories
- Haqida: ${baseUrl}/about
- Aloqa: ${baseUrl}/contact
- Obuna: ${baseUrl}/subscribe

## Kategoriyalar (Categories)
`;

    if (categories && categories.length > 0) {
      for (const cat of categories) {
        llmsTxt += `- [${cat.name_en}](${baseUrl}/categories?cat=${cat.slug}): ${cat.description_en || cat.description_uz || ''}\n`;
      }
    }

    llmsTxt += `\n## So'nggi Maqolalar (Recent Posts)\n`;

    if (posts && posts.length > 0) {
      for (const post of posts.slice(0, 30)) {
        const date = post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : '';
        const tags = post.tags ? ` [${post.tags.join(', ')}]` : '';
        llmsTxt += `- [${post.title_en || post.title_uz}](${baseUrl}/post/${post.slug}) (${date})${tags}\n`;
        if (post.excerpt_en || post.excerpt_uz) {
          llmsTxt += `  > ${(post.excerpt_en || post.excerpt_uz || '').substring(0, 150)}\n`;
        }
      }
    }

    llmsTxt += `
## Texnik Ma'lumot (Technical Info)
- Tillar: uz, ru, en
- Sitemap: ${baseUrl}/sitemap.xml
- RSS: ${baseUrl}/blog (structured data available)
- Aloqa: ${baseUrl}/contact
- Schema.org: Organization, Person, Article, FAQPage, BreadcrumbList

## Optional
- Markdown sahifalar: ${supabaseUrl}/functions/v1/markdown-content?page=about
- llms.txt: ${baseUrl}/llms.txt
`;

    console.log(`Generated llms.txt with ${posts?.length || 0} posts`);

    return new Response(llmsTxt, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('llms.txt generation error:', error);
    return new Response(
      `# ShohruxDigital\n> Digital marketing blog\nURL: https://shohruxdigital.uz\n`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
    );
  }
});
