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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://shohruxdigital.uz';

  // Fetch data
  const [postsRes, categoriesRes, faqsRes, caseStudiesRes, clustersRes] = await Promise.all([
    supabase.from('posts').select('id, slug, title_en, excerpt_en, tags, published_at').eq('published', true),
    supabase.from('categories').select('slug, name_en, description_en'),
    supabase.from('faqs').select('id, service_category, question_en, answer_en').eq('published', true),
    supabase.from('case_studies').select('id, slug, title_en, description_en, service_type').eq('published', true),
    supabase.from('topic_clusters').select('id, slug, name_en, description_en'),
  ]);

  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'ShohruxDigital API',
      description: 'Public API for ShohruxDigital — Digital Marketing, SMM, SEO blog platform by Shohruxbek Foziljonov.',
      version: '1.0.0',
      contact: { name: 'Shohruxbek Foziljonov', url: baseUrl, email: 'info@shohruxdigital.uz' },
    },
    servers: [{ url: supabaseUrl, description: 'API Server' }],
    paths: {
      '/rest/v1/posts': {
        get: {
          summary: 'Get published blog posts',
          description: 'Returns all published blog posts with multilingual content.',
          parameters: [
            { name: 'select', in: 'query', schema: { type: 'string' }, example: 'id,slug,title_en,excerpt_en,published_at,tags' },
            { name: 'published', in: 'query', schema: { type: 'string' }, example: 'eq.true' },
          ],
          responses: { '200': { description: 'List of posts' } },
        },
      },
      '/rest/v1/categories': {
        get: {
          summary: 'Get all categories',
          description: 'Returns blog categories in Uzbek, Russian and English.',
          responses: { '200': { description: 'List of categories' } },
        },
      },
      '/rest/v1/faqs': {
        get: {
          summary: 'Get FAQs',
          description: 'Frequently asked questions organized by service category.',
          parameters: [
            { name: 'service_category', in: 'query', schema: { type: 'string' }, example: 'eq.seo' },
          ],
          responses: { '200': { description: 'List of FAQs' } },
        },
      },
      '/rest/v1/case_studies': {
        get: {
          summary: 'Get case studies',
          description: 'Real client results and case studies.',
          responses: { '200': { description: 'List of case studies' } },
        },
      },
      '/rest/v1/topic_clusters': {
        get: {
          summary: 'Get topic clusters',
          description: 'Content clusters with pillar posts and related articles.',
          responses: { '200': { description: 'List of topic clusters' } },
        },
      },
      '/functions/v1/llms-txt': {
        get: {
          summary: 'LLMs.txt content',
          description: 'AI-friendly site overview in plain text format.',
          responses: { '200': { description: 'Plain text site info for AI systems' } },
        },
      },
      '/functions/v1/markdown-content': {
        get: {
          summary: 'Markdown content',
          description: 'Pages and posts in clean markdown format for AI consumption.',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'string', enum: ['about', 'services', 'faq'] } },
            { name: 'slug', in: 'query', schema: { type: 'string' }, description: 'Blog post slug' },
            { name: 'lang', in: 'query', schema: { type: 'string', enum: ['uz', 'ru', 'en'] } },
          ],
          responses: { '200': { description: 'Markdown content' } },
        },
      },
    },
    components: {
      schemas: {
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            title_en: { type: 'string' },
            excerpt_en: { type: 'string' },
            published_at: { type: 'string', format: 'date-time' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    'x-ai-data': {
      posts_count: postsRes.data?.length || 0,
      categories: categoriesRes.data?.map(c => c.name_en) || [],
      faq_categories: [...new Set(faqsRes.data?.map(f => f.service_category) || [])],
      case_studies_count: caseStudiesRes.data?.length || 0,
      topic_clusters: clustersRes.data?.map(c => c.name_en) || [],
    },
  };

  return new Response(JSON.stringify(spec, null, 2), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});
