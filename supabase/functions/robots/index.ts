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

    // Fetch robots config from database
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'robots_config')
      .single();

    // Fetch all published posts for dynamic Allow rules
    const { data: posts } = await supabase
      .from('posts')
      .select('slug')
      .eq('published', true);

    // Default config if not found in database
    let config = {
      allowAll: true,
      disallowPaths: ['/admin', '/admin/*', '/auth', '/auth/*', '/api/', '/*.json$', '/*?*'],
      allowPaths: ['/post/*', '/blog', '/categories', '/about', '/contact'],
      crawlDelay: '1',
      customRules: ''
    };

    if (settingsData?.value) {
      try {
        config = JSON.parse(settingsData.value);
      } catch (e) {
        console.error('Failed to parse robots config:', e);
      }
    }

    // Build robots.txt content
    let robotsTxt = `# robots.txt for ShohruxDigital
# ${baseUrl}
# Generated dynamically from database
# Last updated: ${new Date().toISOString()}

`;

    // Add bot-specific rules (including AI crawlers)
    const bots = [
      { name: 'Googlebot', crawlDelay: config.crawlDelay },
      { name: 'Bingbot', crawlDelay: config.crawlDelay },
      { name: 'Twitterbot', crawlDelay: null },
      { name: 'facebookexternalhit', crawlDelay: null },
      { name: 'LinkedInBot', crawlDelay: null },
      { name: 'Yandex', crawlDelay: '2' },
      // AI crawlers - GEO/AIO optimization
      { name: 'GPTBot', crawlDelay: null },
      { name: 'Google-Extended', crawlDelay: null },
      { name: 'ClaudeBot', crawlDelay: null },
      { name: 'PerplexityBot', crawlDelay: null },
      { name: 'Bytespider', crawlDelay: '2' },
      { name: 'CCBot', crawlDelay: '2' },
      { name: 'anthropic-ai', crawlDelay: null },
      { name: 'Applebot-Extended', crawlDelay: null },
      { name: 'cohere-ai', crawlDelay: null },
    ];

    for (const bot of bots) {
      robotsTxt += `User-agent: ${bot.name}\n`;
      robotsTxt += `Allow: /\n`;
      if (bot.crawlDelay) {
        robotsTxt += `Crawl-delay: ${bot.crawlDelay}\n`;
      }
      robotsTxt += `\n`;
    }

    // Default rules for all bots
    robotsTxt += `User-agent: *\n`;
    if (config.allowAll) {
      robotsTxt += `Allow: /\n`;
    }

    // Add disallow paths
    for (const path of config.disallowPaths || []) {
      robotsTxt += `Disallow: ${path}\n`;
    }

    // Add allow paths
    for (const path of config.allowPaths || []) {
      robotsTxt += `Allow: ${path}\n`;
    }

    // Add dynamic post URLs
    if (posts && posts.length > 0) {
      robotsTxt += `\n# Dynamic post URLs (${posts.length} posts)\n`;
      for (const post of posts) {
        robotsTxt += `Allow: /post/${post.slug}\n`;
      }
    }

    robotsTxt += `\n# Crawl-delay for responsible crawling\n`;
    robotsTxt += `Crawl-delay: ${config.crawlDelay || '1'}\n`;

    // Add custom rules if any
    if (config.customRules) {
      robotsTxt += `\n# Custom rules\n${config.customRules}\n`;
    }

    // Add sitemap locations
    robotsTxt += `\n# Sitemap locations\n`;
    robotsTxt += `Sitemap: ${baseUrl}/sitemap.xml\n`;
    robotsTxt += `Sitemap: ${supabaseUrl}/functions/v1/sitemap\n`;

    // LLMs.txt for AI discoverability
    robotsTxt += `\n# AI/LLM content discovery\n`;
    robotsTxt += `# llms.txt: ${supabaseUrl}/functions/v1/llms-txt\n`;
    robotsTxt += `# Markdown content: ${supabaseUrl}/functions/v1/markdown-content\n`;

    // Add host directive
    robotsTxt += `\n# Host directive (for Yandex)\n`;
    robotsTxt += `Host: ${baseUrl}\n`;

    // Add clean params
    robotsTxt += `\n# Clean URLs\n`;
    robotsTxt += `Clean-param: utm_source&utm_medium&utm_campaign&utm_term&utm_content\n`;

    console.log(`Generated robots.txt with ${posts?.length || 0} dynamic post URLs`);

    return new Response(robotsTxt, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Robots.txt generation error:', error);
    return new Response(
      `User-agent: *\nAllow: /\nDisallow: /admin\n`,
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      }
    );
  }
});