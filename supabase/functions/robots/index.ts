import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = 'https://shohruxdigital.uz';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    const robotsTxt = `# robots.txt for ShohruxDigital
# https://shohruxdigital.uz
# Generated dynamically

User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: Yandex
Allow: /
Crawl-delay: 2

User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /auth
Disallow: /auth/*
Disallow: /api/
Disallow: /*.json$
Disallow: /*?*
Allow: /post/*
Allow: /blog
Allow: /categories
Allow: /about
Allow: /contact

# Crawl-delay for responsible crawling
Crawl-delay: 1

# Sitemap locations
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${supabaseUrl}/functions/v1/sitemap

# Host directive (for Yandex)
Host: ${baseUrl}

# Clean URLs
Clean-param: utm_source&utm_medium&utm_campaign&utm_term&utm_content
`;

    console.log('Generated robots.txt');

    return new Response(robotsTxt, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
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
