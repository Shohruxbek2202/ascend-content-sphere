import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Support both API key auth (external) and JWT auth (admin panel)
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('LOVABLE_API_KEY');
    const authHeader = req.headers.get('Authorization');

    let isAuthorized = false;

    // Method 1: API key for external integrations
    if (apiKey && apiKey === expectedApiKey) {
      isAuthorized = true;
    }

    // Method 2: JWT + admin role check
    if (!isAuthorized && authHeader?.startsWith('Bearer ')) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);

      if (!claimsError && claimsData?.claims) {
        const userId = claimsData.claims.sub;
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: roleData } = await adminClient
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();

        if (roleData) isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    console.log('Received post data:', JSON.stringify(body, null, 2));

    const requiredFields = ['title_uz', 'title_ru', 'title_en', 'content_uz', 'content_ru', 'content_en', 'slug'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const postData = {
      title_uz: body.title_uz,
      title_ru: body.title_ru,
      title_en: body.title_en,
      content_uz: body.content_uz,
      content_ru: body.content_ru,
      content_en: body.content_en,
      slug: body.slug,
      excerpt_uz: body.excerpt_uz || null,
      excerpt_ru: body.excerpt_ru || null,
      excerpt_en: body.excerpt_en || null,
      category_id: body.category_id || null,
      featured_image: body.featured_image || null,
      tags: body.tags || [],
      reading_time: body.reading_time || 5,
      published: body.published ?? false,
      featured: body.featured ?? false,
      published_at: body.published ? new Date().toISOString() : null,
      meta_title_uz: body.meta_title_uz || null,
      meta_title_ru: body.meta_title_ru || null,
      meta_title_en: body.meta_title_en || null,
      meta_description_uz: body.meta_description_uz || null,
      meta_description_ru: body.meta_description_ru || null,
      meta_description_en: body.meta_description_en || null,
      focus_keywords: body.focus_keywords || [],
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create post', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Post created successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Post created successfully',
        post: {
          id: data.id,
          slug: data.slug,
          published: data.published,
          url: `https://shohruxdigital.uz/post/${data.slug}`
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in create-post function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
