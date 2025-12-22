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
    const { topic, keywords, language = 'uz' } = await req.json();
    
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
  "focus_keywords": ["keyword1", "keyword2"]
}`;

    const userPrompt = `Create a comprehensive SEO-optimized blog post about: "${topic}"
${keywords ? `Primary keywords to focus on: ${keywords}` : ''}
Primary language: ${language}

Generate the content in all three languages (Uzbek, Russian, English). Make sure the content is:
1. Well-researched and informative
2. SEO-optimized with proper keyword placement
3. Engaging and readable
4. Properly formatted with HTML tags (h2, h3, p, ul, ol, strong, etc.)

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
