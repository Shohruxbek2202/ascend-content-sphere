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
    const { title, content, meta_description, slug, keywords } = await req.json();
    
    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing SEO for:', title);

    const systemPrompt = `You are an expert SEO analyst. Analyze the provided blog post content and provide detailed SEO recommendations.

Analyze the following aspects:
1. Title SEO (length, keyword placement, appeal)
2. Meta description (length, keyword inclusion, CTA)
3. Content structure (H1, H2, H3 usage, paragraph length)
4. Keyword optimization (density, placement, LSI keywords)
5. Readability (sentence length, passive voice, transition words)
6. Internal/External linking opportunities
7. Image optimization suggestions
8. Schema markup recommendations
9. URL slug optimization

Provide a score from 0-100 and specific actionable recommendations.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "score": 75,
  "grade": "B",
  "issues": [
    {
      "type": "error",
      "category": "title",
      "message": "Title is too long",
      "suggestion": "Shorten to under 60 characters"
    }
  ],
  "recommendations": [
    {
      "category": "keywords",
      "priority": "high",
      "title": "Add focus keyword to first paragraph",
      "description": "Include your primary keyword within the first 100 words"
    }
  ],
  "optimized": {
    "title": "Optimized title suggestion",
    "meta_description": "Optimized meta description",
    "slug": "optimized-slug"
  },
  "keywords": {
    "primary": "main keyword",
    "secondary": ["keyword2", "keyword3"],
    "lsi": ["related1", "related2"]
  },
  "readability": {
    "score": 65,
    "level": "Standard",
    "suggestions": ["Shorten some sentences", "Add more transition words"]
  },
  "contentAnalysis": {
    "wordCount": 1500,
    "paragraphCount": 15,
    "h2Count": 5,
    "h3Count": 8,
    "imagesSuggested": 3
  }
}`;

    const userPrompt = `Analyze this blog post for SEO:

Title: ${title}
Meta Description: ${meta_description || 'Not provided'}
URL Slug: ${slug || 'Not provided'}
Target Keywords: ${keywords || 'Not provided'}

Content:
${content.substring(0, 8000)}

Provide comprehensive SEO analysis with specific, actionable recommendations. Return ONLY the JSON object.`;

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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const analysisContent = aiData.choices?.[0]?.message?.content;

    if (!analysisContent) {
      throw new Error('No analysis generated');
    }

    console.log('Raw analysis:', analysisContent.substring(0, 500));

    // Parse JSON from response
    let analysisData;
    try {
      let jsonString = analysisContent.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      analysisData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse analysis response');
    }

    return new Response(
      JSON.stringify({ success: true, analysis: analysisData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in analyze-seo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
