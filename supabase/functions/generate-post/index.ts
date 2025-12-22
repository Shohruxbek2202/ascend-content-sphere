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

    const systemPrompt = `You are an expert SEO content writer and digital marketing specialist. Create comprehensive, SEO-optimized blog posts in multiple languages.

Your task is to generate a complete blog post with the following structure:
1. Title (compelling, 50-60 characters, include primary keyword)
2. Meta title (50-60 characters)
3. Meta description (150-160 characters, compelling, include keyword)
4. Excerpt (2-3 sentences summary)
5. Full content in HTML format with:
   - Introduction with hook (100-150 words)
   - 4-6 H2 sections with H3 subsections
   - Short paragraphs (2-3 sentences)
   - Bullet points and numbered lists
   - Statistics and examples where applicable
   - Conclusion with CTA (100-150 words)
6. URL slug (short, descriptive, keyword-rich)
7. Tags (5-7 relevant tags)
8. Reading time estimate
9. Focus keywords (3-5 keywords)

Content Quality Requirements:
- Write for humans first, search engines second
- Use transition words for readability
- Include actionable tips and takeaways
- Focus on E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- Flesch Reading Ease: 60+
- Active voice preferred

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "title_uz": "O'zbek sarlavha",
  "title_ru": "Русский заголовок",
  "title_en": "English title",
  "meta_title_uz": "Meta sarlavha",
  "meta_title_ru": "Мета заголовок",
  "meta_title_en": "Meta title",
  "meta_description_uz": "Meta tavsif",
  "meta_description_ru": "Мета описание",
  "meta_description_en": "Meta description",
  "excerpt_uz": "Qisqa tavsif",
  "excerpt_ru": "Краткое описание",
  "excerpt_en": "Short description",
  "content_uz": "<article>HTML kontent</article>",
  "content_ru": "<article>HTML контент</article>",
  "content_en": "<article>HTML content</article>",
  "slug": "url-slug",
  "tags": ["tag1", "tag2"],
  "reading_time": 5,
  "focus_keywords": ["keyword1", "keyword2"],
  "image_prompt": "A detailed description for generating the featured image"
}`;

    const userPrompt = `Create a comprehensive SEO-optimized blog post about: "${topic}"
${keywords ? `Primary keywords to focus on: ${keywords}` : ''}
Primary language: ${language}

Generate the content in all three languages (Uzbek, Russian, English). Make sure the content is:
1. Well-researched and informative
2. SEO-optimized with proper keyword placement
3. Engaging and readable
4. Properly formatted with HTML tags (h2, h3, p, ul, ol, strong, etc.)

Also provide an "image_prompt" field with a detailed description for generating a professional featured image for this blog post.

Return ONLY the JSON object, no markdown code blocks or explanations.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    console.log('Raw AI response:', content.substring(0, 500));

    // Parse JSON from response (handle markdown code blocks)
    let postData;
    try {
      let jsonString = content.trim();
      // Remove markdown code blocks if present
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      postData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

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
