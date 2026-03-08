import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RSS_FEEDS = [
  { url: 'https://searchengineland.com/feed', name: 'Search Engine Land' },
  { url: 'https://www.searchenginejournal.com/feed/', name: 'Search Engine Journal' },
  { url: 'https://feeds.feedburner.com/socialmediaexaminer', name: 'Social Media Examiner' },
  { url: 'https://blog.hubspot.com/marketing/rss.xml', name: 'HubSpot Marketing' },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', name: 'TechCrunch AI' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', name: 'The Verge AI' },
];

// Keywords that define our site's focus areas
const SITE_RELEVANT_KEYWORDS = [
  // SEO
  'seo', 'search engine', 'ranking', 'serp', 'backlink', 'indexing', 'crawl',
  'organic search', 'google search', 'keyword research', 'link building', 'disavow',
  'technical seo', 'on-page', 'off-page', 'core web vitals', 'sitemap',
  // Digital Marketing
  'digital marketing', 'ppc', 'google ads', 'meta ads', 'advertising', 'campaign',
  'conversion rate', 'roi', 'analytics', 'marketing strategy', 'lead generation',
  'email marketing', 'remarketing', 'retargeting', 'cpc', 'cpm', 'ctr',
  // AI in Marketing/Business
  'ai marketing', 'ai search', 'ai overview', 'ai mode', 'generative ai',
  'chatgpt', 'openai', 'gemini', 'llm', 'machine learning', 'ai content',
  'ai seo', 'ai advertising', 'ai analytics', 'prompt engineering',
  // Social Media Marketing
  'social media marketing', 'instagram marketing', 'facebook ads', 'tiktok ads',
  'telegram marketing', 'influencer marketing', 'social media strategy',
  // Content Marketing
  'content marketing', 'content strategy', 'blogging', 'copywriting',
  'content optimization', 'content creation',
  // E-commerce
  'ecommerce', 'e-commerce', 'online store', 'shopify', 'woocommerce',
  // Web Development (related)
  'web performance', 'page speed', 'mobile optimization', 'ux', 'user experience',
  // Local/Regional
  'uzbekistan', "o'zbekiston", 'central asia', 'markaziy osiyo',
];

// Topics to EXCLUDE — not relevant to our audience
const IRRELEVANT_KEYWORDS = [
  'stock price', 'ipo', 'quarterly earnings', 'lawsuit filed', 'court ruling',
  'celebrity', 'entertainment', 'sports score', 'movie review', 'gaming console',
  'cryptocurrency price', 'bitcoin price', 'nft drop', 'metaverse land',
  'recipe', 'travel destination', 'weather forecast', 'political election',
  'military conflict', 'healthcare policy', 'vaccine', 'space exploration',
];

function calculateRelevanceScore(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;
  let irrelevantHits = 0;

  // Check relevant keywords (each match = +2 points)
  for (const kw of SITE_RELEVANT_KEYWORDS) {
    if (text.includes(kw)) score += 2;
  }

  // Check irrelevant keywords (each match = -5 points)
  for (const kw of IRRELEVANT_KEYWORDS) {
    if (text.includes(kw)) {
      score -= 5;
      irrelevantHits++;
    }
  }

  // Bonus for highly relevant topics
  if (text.includes('seo') && (text.includes('google') || text.includes('search'))) score += 3;
  if (text.includes('ai') && (text.includes('marketing') || text.includes('search') || text.includes('ads'))) score += 3;
  if (text.includes('ppc') || text.includes('google ads') || text.includes('meta ads')) score += 3;

  // Penalty if mostly irrelevant
  if (irrelevantHits >= 2) score -= 10;

  return score;
}

function parseRSSItems(xml: string): Array<{ title: string; link: string; description: string; pubDate: string; image: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string; image: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const getTag = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 'is');
      const m = itemXml.match(r);
      return m ? m[1].trim() : '';
    };

    let image = '';
    const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
    if (mediaMatch) image = mediaMatch[1];
    if (!image) {
      const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
      if (thumbMatch) image = thumbMatch[1];
    }
    if (!image) {
      const encMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image\/[^"']+["']/i);
      if (encMatch) image = encMatch[1];
    }
    if (!image) {
      const content = getTag('content:encoded') || getTag('description');
      const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) image = imgMatch[1];
    }

    items.push({
      title: getTag('title'),
      link: getTag('link') || getTag('guid'),
      description: getTag('description').replace(/<[^>]*>/g, '').substring(0, 500),
      pubDate: getTag('pubDate'),
      image,
    });
  }

  return items;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSlugBase(slug: string): string {
  return slug.replace(/-[a-z0-9]{6,10}$/, '');
}

async function fetchLatestNews(): Promise<Array<{ title: string; link: string; description: string; source: string; image: string; relevanceScore: number }>> {
  const allNews: Array<{ title: string; link: string; description: string; source: string; image: string; relevanceScore: number }> = [];
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
  const seenTitles = new Set<string>();

  for (const feed of RSS_FEEDS) {
    try {
      const resp = await fetch(feed.url, {
        headers: { 'User-Agent': 'ShohruxDigital-NewsBot/1.0' },
      });
      if (!resp.ok) continue;
      const xml = await resp.text();
      const items = parseRSSItems(xml);

      for (const item of items.slice(0, 5)) {
        const pubDate = item.pubDate ? new Date(item.pubDate).getTime() : now;
        const normalized = normalizeTitle(item.title);
        
        if (pubDate >= twentyFourHoursAgo && !seenTitles.has(normalized)) {
          const relevanceScore = calculateRelevanceScore(item.title, item.description);
          
          // Only include if relevance score >= 2 (at least one strong keyword match)
          if (relevanceScore >= 2) {
            seenTitles.add(normalized);
            allNews.push({
              title: item.title,
              link: item.link,
              description: item.description,
              source: feed.name,
              image: item.image,
              relevanceScore,
            });
          } else {
            console.log(`Skipping irrelevant (score=${relevanceScore}): ${item.title}`);
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch ${feed.name}:`, e);
    }
  }

  // Sort by relevance score (highest first)
  allNews.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return allNews;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/^-+|-+$/g, '');
}

// Generate AI image when no feed image available
async function generateAIImage(
  title: string,
  supabase: any
): Promise<string | null> {
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.log('No LOVABLE_API_KEY, skipping AI image generation');
      return null;
    }

    const imagePrompt = `Create a professional, modern blog header image for an article titled: "${title}". 
Style: Clean, corporate tech illustration with subtle gradients. 
Colors: Use deep blues, teals, and accent oranges. 
No text in the image. No watermarks. 
The image should feel professional, suitable for a digital marketing and SEO blog.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: imagePrompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      console.error(`AI image generation failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData || !imageData.startsWith('data:image')) {
      console.log('No valid image data returned');
      return null;
    }

    // Extract base64 and upload to storage
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) return null;

    const ext = base64Match[1] === 'jpeg' ? 'jpg' : base64Match[1];
    const base64Content = base64Match[2];
    const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    
    const fileName = `ai-generated/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, binaryData, {
        contentType: `image/${base64Match[1]}`,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    console.log(`AI image generated and uploaded: ${publicUrl.publicUrl}`);
    return publicUrl.publicUrl;
  } catch (e) {
    console.error('AI image generation error:', e);
    return null;
  }
}

async function generatePostFromNews(
  news: { title: string; link: string; description: string; source: string; image: string },
  apiKey: string
): Promise<any> {
  const systemPrompt = `Sen professional digital marketing, SEO va AI sohasidagi ekspert blog yozuvchisisan. Berilgan yangilik asosida GEO (Generative Engine Optimization) va AEO (Answer Engine Optimization) formatida blog post yoz.

MUHIM — GEO/AEO STRATEGIYA (2026):
Bu yangilikni O'ZBEKISTON va MARKAZIY OSIYO auditoriyasi uchun yoz.

KONTENT ARXITEKTURASI (Answer-First formati):
1. Sarlavha: Foydalanuvchi savoli formatida (masalan: "Google AI Rejimi nima va u SEO'ga qanday ta'sir qiladi?")
2. TL;DR blok: Dastlab 2-3 gaplik aniq, ensiklopedik javob — AI tizimlar oson ajratib olishi uchun
3. Asosiy qism: H2 bo'limlarga ajratilgan chuqur tahlil
4. Har bir bo'limda: Tushuntirish → Statistika/raqam → O'zbekiston konteksti → Amaliy tavsiya
5. FAQ bo'lim: Kamida 3 ta savol-javob (H3 sarlavhali, <strong>Savol:</strong> formatda)
6. Xulosa: Asosiy xulosalar ro'yxati (numbered list)
7. CTA: Harakatga chaqirish

E-E-A-T SIGNALLARI:
- Manba havolalarini <a href="..." target="_blank" rel="noopener"> bilan qo'sh
- Statistikalar va raqamlarni ko'p ishlat (masalan: "60% foydalanuvchilar...", "40% o'sish...")
- Ekspert fikrlarini blockquote bilan ajrat
- O'zbekiston bozoriga oid ma'lumotlar qo'sh

TEXNIK QOIDALAR:
1. HTML formatda yoz: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <a>, <hr>, <table>, <thead>, <tbody>, <tr>, <th>, <td>
2. <h1> ISHLATMA
3. Inline style ISHLATMA
4. Kamida 1000 so'z
5. Emoji va stiker ISHLATMA — professional, jiddiy ton
6. Jadval (comparison table) qo'sh — AI tizimlar jadvallarni yaxshi ko'radi
7. Marokli faktlar va "Bilasizmi?" bloklari qo'sh

MASHHUR FORMAT NAMUNASI:
<p><strong>Qisqa javob:</strong> [2-3 gaplik to'g'ridan-to'g'ri javob]</p>
<h2>Batafsil tahlil</h2>
...
<h2>O'zbekiston uchun ahamiyati</h2>
...
<h2>Ko'p so'raladigan savollar</h2>
<h3>Savol: [savol matni]?</h3>
<p>[javob]</p>

JSON formatda quyidagilarni qaytar:
{
  "title_uz": "Savol formatidagi sarlavha (emoji yoq)",
  "title_ru": "Заголовок в формате вопроса (без эмодзи)",
  "title_en": "Question format title (no emoji)",
  "content_uz": "GEO/AEO formatidagi to'liq HTML kontent (answer-first, FAQ, jadvallar)",
  "content_ru": "Полный HTML в GEO/AEO формате (answer-first, FAQ, таблицы)",
  "content_en": "Full GEO/AEO HTML (answer-first, FAQ, tables)",
  "excerpt_uz": "Qisqa javob formati (160 belgi)",
  "excerpt_ru": "Краткий ответ (160 символов)",
  "excerpt_en": "Brief answer (160 chars)",
  "meta_title_uz": "SEO sarlavha (60 belgi, savol formati)",
  "meta_title_ru": "SEO заголовок (60 символов)",
  "meta_title_en": "SEO title (60 chars)",
  "meta_description_uz": "Meta tavsif — javob formati (160 belgi)",
  "meta_description_ru": "Мета описание — формат ответа (160 символов)",
  "meta_description_en": "Meta description — answer format (160 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "focus_keywords": ["keyword1", "keyword2"],
  "reading_time": 7,
  "faq": [
    {"question_uz": "...", "answer_uz": "...", "question_ru": "...", "answer_ru": "...", "question_en": "...", "answer_en": "..."},
    {"question_uz": "...", "answer_uz": "...", "question_ru": "...", "answer_ru": "...", "question_en": "...", "answer_en": "..."},
    {"question_uz": "...", "answer_uz": "...", "question_ru": "...", "answer_ru": "...", "question_en": "...", "answer_en": "..."}
  ]
}`;

  const userPrompt = `Yangilik: "${news.title}"
Manba: ${news.source}
Havola: ${news.link}
Qisqa tavsif: ${news.description}

Shu yangilik asosida GEO/AEO formatida professional blog post yoz. Answer-first arxitektura, FAQ bo'lim, jadval va statistikalar bilan. O'zbekiston auditoriyasi uchun moslashtir. Emoji ishlatma.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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

// Auto-assign category based on title, description and tags
async function autoAssignCategory(
  supabase: any,
  title: string,
  description: string,
  tags: string[]
): Promise<string | null> {
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_en');

  if (!categories || categories.length === 0) return null;

  const text = `${title} ${description} ${tags.join(' ')}`.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    'seo': ['seo', 'search engine', 'ranking', 'serp', 'backlink', 'indexing', 'crawl', 'organic search', 'google search', 'keyword', 'link building', 'disavow', 'sitemap', 'core web vitals'],
    'digital-marketing': ['marketing', 'ads', 'advertising', 'ppc', 'campaign', 'brand', 'analytics', 'conversion', 'roi', 'google ads', 'meta ads', 'ceo', 'company', 'business', 'ecommerce'],
    'social-media': ['social media', 'instagram', 'facebook', 'twitter', 'tiktok', 'linkedin', 'telegram', 'social network', 'influencer'],
    'content-marketing': ['content', 'blog', 'writing', 'copywriting', 'grammarly', 'editorial', 'article', 'content strategy'],
    'prompt-engineering': ['prompt', 'chatgpt', 'openai', 'llm', 'gpt', 'ai model', 'gemini', 'claude', 'ai tool'],
    'personal-development': ['personal', 'career', 'growth', 'motivation', 'productivity'],
  };

  let bestCategory: string | null = null;
  let bestScore = 0;

  for (const cat of categories) {
    const keywords = categoryKeywords[cat.slug] || [];
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat.id;
    }
  }

  if (!bestCategory) {
    const dm = categories.find((c: any) => c.slug === 'digital-marketing');
    bestCategory = dm?.id || categories[0].id;
  }

  return bestCategory;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if admin has set a custom key in site_settings
    const { data: keyData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'openai_api_key')
      .single();
    if (keyData?.value) {
      OPENAI_API_KEY = keyData.value;
    }

    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

    let maxPosts = 2;
    try {
      const body = await req.json();
      if (body?.max_posts) maxPosts = Math.min(body.max_posts, 5);
    } catch { /* no body is fine */ }

    console.log('Fetching latest news...');
    const news = await fetchLatestNews();
    console.log(`Found ${news.length} relevant news items (filtered by relevance)`);

    if (news.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No relevant articles found', posts_created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced deduplication: check slugs, slug bases, and normalized titles
    const { data: existingPosts } = await supabase
      .from('posts')
      .select('slug, title_en')
      .order('created_at', { ascending: false })
      .limit(200);

    const existingSlugs = new Set((existingPosts || []).map((p: any) => p.slug));
    const existingSlugBases = new Set((existingPosts || []).map((p: any) => getSlugBase(p.slug)));
    const existingTitles = new Set(
      (existingPosts || []).map((p: any) => normalizeTitle(p.title_en || ''))
    );

    const createdPosts: string[] = [];
    const skippedPosts: Array<{ title: string; reason: string }> = [];

    for (const item of news.slice(0, maxPosts + 3)) { // Fetch a few extra in case some are duplicates
      if (createdPosts.length >= maxPosts) break;

      try {
        const baseSlug = generateSlug(item.title);
        const normalizedNewsTitle = normalizeTitle(item.title);

        // Check slug
        if (existingSlugs.has(baseSlug)) {
          skippedPosts.push({ title: item.title, reason: 'duplicate slug' });
          console.log(`Skipping duplicate slug: ${baseSlug}`);
          continue;
        }

        // Check slug base (catches variations like slug-mmXXXXXX)
        if (existingSlugBases.has(baseSlug)) {
          skippedPosts.push({ title: item.title, reason: 'duplicate slug base' });
          console.log(`Skipping duplicate slug base: ${baseSlug}`);
          continue;
        }

        // Check title similarity
        let isDuplicate = false;
        for (const existing of existingTitles) {
          if (existing === normalizedNewsTitle) {
            isDuplicate = true;
            break;
          }
          const newsWords = normalizedNewsTitle.split(' ').filter(w => w.length >= 4);
          const existWords = existing.split(' ').filter(w => w.length >= 4);
          if (newsWords.length > 3 && existWords.length > 3) {
            const common = newsWords.filter(w => existWords.includes(w)).length;
            const similarity = common / Math.min(newsWords.length, existWords.length);
            if (similarity > 0.6) {
              isDuplicate = true;
              break;
            }
          }
        }

        if (isDuplicate) {
          skippedPosts.push({ title: item.title, reason: 'similar title exists' });
          console.log(`Skipping similar title: ${item.title}`);
          continue;
        }

        console.log(`Generating post (relevance=${item.relevanceScore}): ${item.title}`);
        const post = await generatePostFromNews(item, LOVABLE_API_KEY);

        const slug = baseSlug + '-' + Date.now().toString(36);
        const tags = [...(post.tags || []), 'ai-generated'];
        const categoryId = await autoAssignCategory(supabase, item.title, item.description, post.tags || []);

        // Get image: use feed image, or generate with AI
        let featuredImage = item.image || null;
        if (!featuredImage) {
          console.log('No feed image, generating AI image...');
          featuredImage = await generateAIImage(post.title_en || item.title, supabase);
        }

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
          tags,
          focus_keywords: post.focus_keywords || [],
          reading_time: post.reading_time || 5,
          featured_image: featuredImage,
          category_id: categoryId,
          published: true,
          published_at: new Date().toISOString(),
        }).select('id, slug').single();

        if (error) {
          console.error(`DB error for ${item.title}:`, error);
          continue;
        }

        existingSlugs.add(baseSlug);
        existingSlugBases.add(baseSlug);
        existingTitles.add(normalizedNewsTitle);
        createdPosts.push(data.slug);
        console.log(`Post created: ${data.slug} (with ${featuredImage ? 'image' : 'no image'})`);

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
        skipped: skippedPosts,
        total_relevant_news: news.length,
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
