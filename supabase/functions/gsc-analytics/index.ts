import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_BASE = 'https://connector-gateway.lovable.dev/google_search_console';
const SITE_URL = 'sc-domain:shohruxdigital.uz';

interface AnalyticsRequest {
  startDate?: string;
  endDate?: string;
  dimension?: 'query' | 'page' | 'country' | 'device';
  rowLimit?: number;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
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
    const GSC_KEY = Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY');
    if (!LOVABLE_API_KEY || !GSC_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google Search Console ulanmagan. Iltimos Connectors orqali ulang.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: AnalyticsRequest = await req.json().catch(() => ({}));
    const startDate = body.startDate || daysAgo(28);
    const endDate = body.endDate || daysAgo(1);
    const dimension = body.dimension || 'query';
    const rowLimit = Math.min(body.rowLimit || 25, 100);

    const gatewayHeaders = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': GSC_KEY,
      'Content-Type': 'application/json',
    };

    // Try domain property first; fall back to URL-prefix property
    const tryFetch = async (siteUrl: string) => {
      const encodedSite = encodeURIComponent(siteUrl);
      const url = `${GATEWAY_BASE}/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: gatewayHeaders,
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: [dimension],
          rowLimit,
          dataState: 'final',
        }),
      });
      return resp;
    };

    let resp = await tryFetch(SITE_URL);
    let usedSite = SITE_URL;
    if (!resp.ok) {
      const fallback = 'https://shohruxdigital.uz/';
      const resp2 = await tryFetch(fallback);
      if (resp2.ok) {
        resp = resp2;
        usedSite = fallback;
      } else {
        const text = await resp.text();
        console.error('GSC error:', resp.status, text);
        return new Response(
          JSON.stringify({ error: `GSC API xato [${resp.status}]: ${text.slice(0, 300)}` }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const data = await resp.json();
    const rows = (data.rows || []).map((r: any) => ({
      key: r.keys?.[0] ?? '',
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0,
    }));

    // Totals
    const totals = rows.reduce(
      (acc: any, r: any) => {
        acc.clicks += r.clicks;
        acc.impressions += r.impressions;
        return acc;
      },
      { clicks: 0, impressions: 0 }
    );
    const avgCtr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
    const avgPos =
      rows.length > 0
        ? rows.reduce((s: number, r: any) => s + r.position, 0) / rows.length
        : 0;

    return new Response(
      JSON.stringify({
        site: usedSite,
        startDate,
        endDate,
        dimension,
        rows,
        totals: {
          clicks: totals.clicks,
          impressions: totals.impressions,
          ctr: avgCtr,
          position: avgPos,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('gsc-analytics error:', e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
