import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateImage(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('Generating image for prompt:', prompt);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { 
            role: 'user', 
            content: `Generate a professional, high-quality blog post featured image for this topic: "${prompt}". 
            The image should be:
            - Modern and visually appealing
            - Suitable for a professional blog
            - 16:9 aspect ratio
            - Clean and not too busy
            - No text in the image`
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      console.error('Image generation failed:', response.status);
      return null;
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      console.log('No image in response');
      return null;
    }

    console.log('Image generated successfully');
    return imageData;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

async function uploadImageToStorage(base64Data: string, supabaseUrl: string, serviceKey: string): Promise<string | null> {
  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    
    // Extract base64 content
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    
    const fileName = `ai-generated/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    console.log('Image uploaded:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, keywords, language = 'uz', generateImage: shouldGenerateImage = true } = await req.json();
    
    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating post for topic:', topic);

    const systemPrompt = `You are an expert SEO content writer and digital marketing specialist. You create SEO-optimized blog posts.

Rules:
- Follow the requested language exactly.
- Output must be complete (no truncation, no "...", no placeholders).
- Use semantic HTML: <article>, <section>, <h2>, <h3>, <p>, <ul>, <ol>, <strong>.
- Do not wrap responses in markdown code fences unless explicitly asked.`;

    const callAI = async (payload: Record<string, unknown>) => {
      const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          ...payload,
        }),
      });

      if (!r.ok) {
        const t = await r.text();
        console.error('AI API error:', r.status, t);
        throw new Error(`AI API error: ${r.status}`);
      }

      return await r.json();
    };

    // 1) Generate compact structured metadata via tool-calling (keeps response small and parse-safe)
    const metaPrompt = `Create blog post metadata for topic: "${topic}"
${keywords ? `Primary keywords: ${keywords}` : ''}
Return values for Uzbek, Russian, English where applicable.

Requirements:
- Title: compelling, ~50-60 chars, include primary keyword when possible
- Meta title: ~50-60 chars
- Meta description: 150-160 chars
- Excerpt: 2-3 sentences
- Slug: short, descriptive, keyword-rich, latin lowercase with hyphens
- Tags: 5-7 tags
- Focus keywords: 3-5
- Reading time: integer minutes (estimate)
- image_prompt: detailed prompt for 16:9 featured image, no text

Important: return ONLY via the tool call arguments.`;

    const metaRes = await callAI({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: metaPrompt },
      ],
      max_tokens: 2500,
      tools: [
        {
          type: 'function',
          function: {
            name: 'create_post_meta',
            description: 'Return blog post meta fields for three languages.',
            parameters: {
              type: 'object',
              additionalProperties: false,
              required: [
                'title_uz',
                'title_ru',
                'title_en',
                'meta_title_uz',
                'meta_title_ru',
                'meta_title_en',
                'meta_description_uz',
                'meta_description_ru',
                'meta_description_en',
                'excerpt_uz',
                'excerpt_ru',
                'excerpt_en',
                'slug',
                'tags',
                'reading_time',
                'focus_keywords',
                'image_prompt',
              ],
              properties: {
                title_uz: { type: 'string' },
                title_ru: { type: 'string' },
                title_en: { type: 'string' },
                meta_title_uz: { type: 'string' },
                meta_title_ru: { type: 'string' },
                meta_title_en: { type: 'string' },
                meta_description_uz: { type: 'string' },
                meta_description_ru: { type: 'string' },
                meta_description_en: { type: 'string' },
                excerpt_uz: { type: 'string' },
                excerpt_ru: { type: 'string' },
                excerpt_en: { type: 'string' },
                slug: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                reading_time: { type: 'number' },
                focus_keywords: { type: 'array', items: { type: 'string' } },
                image_prompt: { type: 'string' },
              },
            },
          },
        },
      ],
      tool_choice: { type: 'function', function: { name: 'create_post_meta' } },
    });

    const toolArgs =
      metaRes?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ??
      metaRes?.choices?.[0]?.message?.function_call?.arguments;
    if (!toolArgs) {
      console.error('Tool call missing. Raw:', JSON.stringify(metaRes)?.substring(0, 1500));
      throw new Error('AI did not return structured metadata. Please try again.');
    }

    const postData = JSON.parse(toolArgs);

    // 2) Generate FULL HTML content per language in separate calls to avoid truncation
    const contentPrompt = (langLabel: 'Uzbek' | 'Russian' | 'English', title: string) => `Write the FULL blog post in ${langLabel} for topic: "${topic}".
Use this title: "${title}".
${keywords ? `Primary keywords: ${keywords}` : ''}

Structure requirements:
- Return ONLY valid HTML wrapped in a single <article>...</article>
- Include: intro 100-150 words, 4-6 H2 sections each with at least one H3, short paragraphs, lists, examples, conclusion with CTA 100-150 words
- No markdown fences.
- Must be complete and not truncated.`;

    const uzRes = await callAI({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contentPrompt('Uzbek', postData.title_uz) },
      ],
      max_tokens: 5000,
    });
    const ruRes = await callAI({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contentPrompt('Russian', postData.title_ru) },
      ],
      max_tokens: 5000,
    });
    const enRes = await callAI({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contentPrompt('English', postData.title_en) },
      ],
      max_tokens: 5000,
    });

    const content_uz = uzRes?.choices?.[0]?.message?.content;
    const content_ru = ruRes?.choices?.[0]?.message?.content;
    const content_en = enRes?.choices?.[0]?.message?.content;

    if (!content_uz || !content_ru || !content_en) {
      throw new Error('AI did not return full content. Please try again.');
    }

    // Remove accidental code fences if any
    const stripFences = (s: string) => s.trim().replace(/^```html\s*\n?/, '').replace(/^```\s*\n?/, '').replace(/\n?\s*```\s*$/, '').trim();

    postData.content_uz = stripFences(content_uz);
    postData.content_ru = stripFences(content_ru);
    postData.content_en = stripFences(content_en);

    console.log('Generated post data:', Object.keys(postData));

    // Generate image if requested
    let featuredImageUrl = null;
    if (shouldGenerateImage) {
      const imagePrompt = postData.image_prompt || topic;
      const base64Image = await generateImage(imagePrompt, LOVABLE_API_KEY);
      
      if (base64Image) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        featuredImageUrl = await uploadImageToStorage(base64Image, supabaseUrl, supabaseServiceKey);
      }
    }

    // Add featured image to post data
    if (featuredImageUrl) {
      postData.featured_image = featuredImageUrl;
    }

    // Clean up internal field
    delete postData.image_prompt;

    console.log('Generated post data:', Object.keys(postData));

    return new Response(
      JSON.stringify({ success: true, post: postData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in generate-post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
