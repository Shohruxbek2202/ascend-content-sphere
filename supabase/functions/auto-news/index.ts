import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RSS manbalari - Digital Marketing va AI yangiliklari
const RSS_FEEDS = [
  { url: 'https://searchengineland.com/feed', name: 'Search Engine Land' },
  { url: 'https://www.searchenginejournal.com/feed/', name: 'Search Engine Journal' },
  { url: 'https://feeds.feedburner.com/socialmediaexaminer', name: 'Social Media Examiner' },
  { url: 'https://blog.hubspot.com/marketing/rss.xml', name: 'HubSpot Marketing' },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', name: 'TechCrunch AI' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', name: 'The Verge AI' },
];

// Simple RSS XML parser
function parseRSSItems(xml: string): Array<{ title: string; link: string; description: string; pubDate: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const getTag = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 'is');
      const m = itemXml.match(r);
      return m ? m[1].trim() : '';
    };

    items.push({
      title: getTag('title'),
      link: getTag('link') || getTag('guid'),
      description: getTag('description').replace(/<[^>]*>/g, '').substring(0, 500),
      pubDate: getTag('pubDate'),
    });
  }

  return items;
}

// Fetch latest news from RSS feeds
async function fetchLatestNews(): Promise<Array<{ title: string; link: string; description: string; source: string }>> {
  const allNews: Array<{ title: string; link: string; description: string; source: string }> = [];
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  for (const feed of RSS_FEEDS) {
    try {
      const resp = await fetch(feed.url, {
        headers: { 'User-Agent': 'ShohruxDigital-NewsBot/1.0' },
      });
      if (!resp.ok) continue;
      const xml = await resp.text();
      const items = parseRSSItems(xml);

      for (const item of items.slice(0, 3)) {
        const pubDate = item.pubDate ? new Date(item.pubDate).getTime() : now;
        if (pubDate >= twentyFourHoursAgo) {
          allNews.push({
            title: item.title,
            link: item.link,
            description: item.description,
            source: feed.name,
          });
        }
      }
    } catch (e) {
      console.error(`Failed to fetch ${feed.name}:`, e);
    }
  }

  return allNews;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/^-+|-+$/g, '');
}

// Generate post content using OpenAI
async function generatePostFromNews(
  news: { title: string; link: string; description: string; source: string },
  openaiKey: string
): Promise<any> {
  const systemPrompt = `Sen professional digital marketing va AI sohasidagi blog yozuvchisisan. Berilgan yangilik asosida SEO-optimallashtirilgan blog post yoz. 

MUHIM QOIDALAR:
1. Har bir tilda original kontent yoz, tarjima qilma
2. O'zbek tilida asosiy kontent yoz, keyin rus va ingliz tillarida
3. HTML formatda yoz (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> teglaridan foydalan)
4. Kamida 800 so'z bo'lsin
5. SEO uchun kalit so'zlarni tabiiy ravishda joylashtir
6. Manba havolasini kontentga qo'sh

JSON formatda quyidagilarni qaytar:
{
  "title_uz": "O'zbek tilidagi sarlavha",
  "title_ru": "Русский заголовок",
  "title_en": "English title",
  "content_uz": "O'zbek tilidagi to'liq HTML kontent",
  "content_ru": "Полный HTML контент на русском",
  "content_en": "Full HTML content in English",
  "excerpt_uz": "Qisqa tavsif (160 belgi)",
  "excerpt_ru": "Краткое описание (160 символов)",
  "excerpt_en": "Short description (160 chars)",
  "meta_title_uz": "SEO sarlavha (60 belgi)",
  "meta_title_ru": "SEO заголовок (60 символов)",
  "meta_title_en": "SEO title (60 chars)",
  "meta_description_uz": "Meta tavsif (160 belgi)",
  "meta_description_ru": "Мета описание (160 символов)",
  "meta_description_en": "Meta description (160 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "focus_keywords": ["keyword1", "keyword2"],
  "reading_time": 5
}`;

  const userPrompt = `Yangilik: "${news.title}"
Manba: ${news.source}
Havola: ${news.link}
Qisqa tavsif: ${news.description}

Shu yangilik asosida professional blog post yoz.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error [${response.status}]: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  return JSON.parse(content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Optional: limit how many posts to generate per run
    let maxPosts = 2;
    try {
      const body = await req.json();
      if (body?.max_posts) maxPosts = Math.min(body.max_posts, 5);
    } catch { /* no body is fine */ }

    console.log('Fetching latest news...');
    const news = await fetchLatestNews();
    console.log(`Found ${news.length} news items`);

    if (news.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No new articles found', posts_created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check existing slugs to avoid duplicates
    const { data: existingPosts } = await supabase
      .from('posts')
      .select('slug')
      .order('created_at', { ascending: false })
      .limit(50);

    const existingSlugs = new Set((existingPosts || []).map((p: any) => p.slug));

    const createdPosts: string[] = [];

    for (const item of news.slice(0, maxPosts)) {
      try {
        const baseSlug = generateSlug(item.title);
        if (existingSlugs.has(baseSlug)) {
          console.log(`Skipping duplicate: ${baseSlug}`);
          continue;
        }

        console.log(`Generating post for: ${item.title}`);
        const post = await generatePostFromNews(item, OPENAI_API_KEY);

        const slug = baseSlug + '-' + Date.now().toString(36);

        const { data, error } = await supabase.from('posts').insert({
          title_uz: post.title_uz,
          title_ru: post.title_ru,
          title_en: post.title_en,
          content_uz: post.content_uz,
          content_ru: post.content_ru,
          content_en: post.content_en,
          excerpt_uz: post.excerpt_uz || null,
          excerpt_ru: post.excerpt_ru || null,
          excerpt_en: post.excerpt_en || null,
          meta_title_uz: post.meta_title_uz || null,
          meta_title_ru: post.meta_title_ru || null,
          meta_title_en: post.meta_title_en || null,
          meta_description_uz: post.meta_description_uz || null,
          meta_description_ru: post.meta_description_ru || null,
          meta_description_en: post.meta_description_en || null,
          slug,
          tags: post.tags || [],
          focus_keywords: post.focus_keywords || [],
          reading_time: post.reading_time || 5,
          published: true,
          published_at: new Date().toISOString(),
        }).select('id, slug').single();

        if (error) {
          console.error(`DB error for ${item.title}:`, error);
          continue;
        }

        existingSlugs.add(baseSlug);
        createdPosts.push(data.slug);
        console.log(`Post created: ${data.slug}`);

        // Small delay between API calls
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.error(`Failed to generate post for "${item.title}":`, e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${createdPosts.length} post(s) created`,
        posts_created: createdPosts.length,
        slugs: createdPosts,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auto-news error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
