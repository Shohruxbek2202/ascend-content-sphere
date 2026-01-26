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

    // Fetch sitemap config from database
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'sitemap_config')
      .single();

    // Fetch published posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at, title_uz, featured_image')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (postsError) {
      console.error('Posts error:', postsError);
      throw postsError;
    }

    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at, name_uz');

    if (categoriesError) {
      console.error('Categories error:', categoriesError);
      throw categoriesError;
    }

    // Parse sitemap config or use defaults
    let staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily', enabled: true },
      { loc: '/blog', priority: '0.9', changefreq: 'daily', enabled: true },
      { loc: '/categories', priority: '0.8', changefreq: 'weekly', enabled: true },
      { loc: '/about', priority: '0.7', changefreq: 'monthly', enabled: true },
      { loc: '/contact', priority: '0.7', changefreq: 'monthly', enabled: true },
      { loc: '/subscribe', priority: '0.6', changefreq: 'monthly', enabled: true },
      { loc: '/privacy', priority: '0.3', changefreq: 'yearly', enabled: true },
      { loc: '/terms', priority: '0.3', changefreq: 'yearly', enabled: true },
    ];

    if (settingsData?.value) {
      try {
        const parsedConfig = JSON.parse(settingsData.value);
        // Filter only static pages (not post URLs)
        staticPages = parsedConfig.filter((p: any) => 
          p.enabled && !p.loc.includes('/post/') && !p.loc.includes('/blog/')
        );
      } catch (e) {
        console.error('Failed to parse sitemap config:', e);
      }
    }

    const today = new Date().toISOString().split('T')[0];

    // Build XML with enhanced schema
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
<!-- Generated dynamically from database -->
<!-- Last updated: ${new Date().toISOString()} -->
<!-- Total posts: ${posts?.length || 0} -->
<!-- Total categories: ${categories?.length || 0} -->

`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${escapeXml(baseUrl + page.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add categories with dynamic lastmod
    for (const category of (categories || [])) {
      const lastmod = category.updated_at 
        ? new Date(category.updated_at).toISOString().split('T')[0] 
        : today;
      xml += `  <url>
    <loc>${escapeXml(baseUrl + '/blog?category=' + category.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Add posts with image support
    for (const post of (posts || [])) {
      const lastmod = post.updated_at 
        ? new Date(post.updated_at).toISOString().split('T')[0] 
        : today;
      
    xml += `  <url>
    <loc>${escapeXml(baseUrl + '/blog/' + post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
      
      // Add image if available
      if (post.featured_image) {
        xml += `
    <image:image>
      <image:loc>${escapeXml(post.featured_image)}</image:loc>
      <image:title>${escapeXml(post.title_uz || '')}</image:title>
    </image:image>`;
      }
      
      xml += `
  </url>
`;
    }

    xml += `</urlset>`;

    console.log(`Generated sitemap with ${staticPages.length} static pages, ${categories?.length || 0} categories, and ${posts?.length || 0} posts`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sitemap generation error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
