import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Row {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SuggestRequest {
  queries: Row[];
  pages: Row[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', claimsData.claims.sub)
      .eq('role', 'admin')
      .single();
    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY topilmadi' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: SuggestRequest = await req.json();
    const queries = (body.queries || []).slice(0, 30);
    const pages = (body.pages || []).slice(0, 15);

    const systemPrompt = `Sen O'zbekiston bozori uchun ekspert SEO maslahatchisisan. Foydalanuvchi Google Search Console ma'lumotlarini taqdim qildi. Real ma'lumotlar asosida AMALIY tavsiyalar ber.

Diqqat qaratish:
1. "Tez g'alabalar" — pozitsiyasi 4-20 oraliqdagi so'zlar (page 1 ga ko'tarish oson)
2. Past CTR (impressions yuqori, lekin clicks past) — title/meta ni yaxshilash kerak
3. Yangi kontent g'oyalari — ko'rinayotgan, lekin sahifa yo'q so'zlar
4. Eng yaxshi sahifalarni kengaytirish
5. Internal linking imkoniyatlari

JSON format qaytar (faqat JSON, boshqa matn yo'q):
{
  "summary": "2-3 jumla umumiy holat",
  "quick_wins": [
    {"keyword": "...", "current_position": 12, "action": "Aniq nima qilish kerak (1 jumla)", "priority": "high|medium|low"}
  ],
  "ctr_fixes": [
    {"keyword": "...", "impressions": 500, "ctr_percent": 0.8, "new_title_suggestion": "Yangi sarlavha taklifi"}
  ],
  "new_content_ideas": [
    {"topic": "Mavzu", "target_keyword": "kalit so'z", "why": "Nima uchun"}
  ],
  "top_page_improvements": [
    {"page": "/blog/...", "action": "Nima qo'shish kerak"}
  ]
}`;

    const userPrompt = `So'rovlar (top kalit so'zlar):\n${JSON.stringify(queries, null, 2)}\n\nSahifalar:\n${JSON.stringify(pages, null, 2)}`;

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Juda ko\'p so\'rov yuborildi, biroz kuting.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI kreditlar tugagan. Workspace usage sahifasiga o\'ting.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const t = await aiResp.text();
      throw new Error(`AI gateway xato [${aiResp.status}]: ${t.slice(0, 200)}`);
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';

    let suggestions;
    try {
      suggestions = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      suggestions = match ? JSON.parse(match[0]) : { summary: content };
    }

    return new Response(JSON.stringify(suggestions), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('gsc-ai-suggestions error:', e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
