import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { post_id } = await req.json();
    if (!post_id) throw new Error('post_id is required');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post_id)
      .single();

    if (error || !post) throw new Error('Post not found');

    const systemPrompt = `Sen SEO va GEO (Generative Engine Optimization) ekspertisan. Berilgan blog postni 2026-yil GEO/AEO standartlariga mos ravishda qayta formatlash kerak.

QAYTA FORMATLASH QOIDALARI:
1. ANSWER-FIRST: Birinchi paragrafda "Qisqa javob:" bilan boshlanadigan 2-3 gaplik to'g'ridan-to'g'ri javob qo'sh
2. H2 bo'limlar: Har bir bo'lim aniq mavzuni yoritsin
3. FAQ BO'LIM: Postning oxirida kamida 3 ta savol-javob qo'sh (H3 sarlavhali)
4. JADVAL: Kamida 1 ta taqqoslash jadvali (<table>) qo'sh — AI tizimlar jadvallarni sevadi
5. STATISTIKA: Postga tegishli raqamlar va statistikalar qo'sh (masalan: "60% foydalanuvchilar...")
6. BLOCKQUOTE: Muhim ekspert fikrlarini <blockquote> ichida ko'rsat
7. AMALIY TAVSIYALAR: O'zbekiston biznes auditoriyasi uchun amaliy maslahatlar
8. INTERNAL LINKING: Boshqa blog postlarga havolalar qo'sh (/blog/ prefiksi bilan)

TEXNIK:
- Faqat HTML ishlatib, mavjud kontentni yaxshila va kengaytir
- <h1> ISHLATMA
- Inline style ISHLATMA
- Emoji ISHLATMA
- Mavjud ma'lumotlarni o'chirma — faqat yaxshila va qo'sh
- Teglar: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <a>, <hr>, <table>, <thead>, <tbody>, <tr>, <th>, <td>

JSON formatda qaytar:
{
  "content_uz": "Yangilangan HTML kontent",
  "content_ru": "Обновленный HTML контент",
  "content_en": "Updated HTML content",
  "excerpt_uz": "Yangi qisqa tavsif (160 belgi)",
  "excerpt_ru": "Новое описание (160 символов)",
  "excerpt_en": "New excerpt (160 chars)"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Postni GEO formatga o'tkaz:

Sarlavha (UZ): ${post.title_uz}
Sarlavha (RU): ${post.title_ru}
Sarlavha (EN): ${post.title_en}

Kontent (UZ): ${post.content_uz?.substring(0, 6000)}

Kontent (RU): ${post.content_ru?.substring(0, 6000)}

Kontent (EN): ${post.content_en?.substring(0, 6000)}`,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, try again later' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await response.text();
      throw new Error(`AI error: ${response.status} - ${errText}`);
    }

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices?.[0]?.message?.content || '{}');

    if (!result.content_uz) throw new Error('AI returned empty content');

    // Update the post
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        content_uz: result.content_uz,
        content_ru: result.content_ru || post.content_ru,
        content_en: result.content_en || post.content_en,
        excerpt_uz: result.excerpt_uz || post.excerpt_uz,
        excerpt_ru: result.excerpt_ru || post.excerpt_ru,
        excerpt_en: result.excerpt_en || post.excerpt_en,
        updated_at: new Date().toISOString(),
      })
      .eq('id', post_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, message: 'Post GEO formatga o\'tkazildi' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('GEO reformat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
