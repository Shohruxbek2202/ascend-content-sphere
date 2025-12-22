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
    const { url, urls } = await req.json();
    
    const urlsToSubmit = urls || (url ? [url] : []);
    
    if (urlsToSubmit.length === 0) {
      return new Response(
        JSON.stringify({ error: 'URL(s) are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Pinging search engines for URLs:', urlsToSubmit);

    const results: { engine: string; status: string; message?: string }[] = [];
    const siteUrl = 'https://shohruxdigital.uz';

    // IndexNow for Bing, Yandex, and other supporting search engines
    // Generate a simple key for IndexNow (in production, you'd want a proper key file)
    const indexNowKey = 'shohruxdigital2024key';
    
    for (const pageUrl of urlsToSubmit) {
      // Ping Google (sitemap ping - deprecated but still works for some cases)
      try {
        const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(siteUrl + '/sitemap.xml')}`;
        const googleResponse = await fetch(googlePingUrl);
        results.push({
          engine: 'Google Sitemap Ping',
          status: googleResponse.ok ? 'success' : 'failed',
          message: `Status: ${googleResponse.status}`
        });
      } catch (error) {
        console.error('Google ping error:', error);
        results.push({
          engine: 'Google Sitemap Ping',
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // IndexNow API (Bing, Yandex, Seznam, Naver)
      try {
        const indexNowPayload = {
          host: 'shohruxdigital.uz',
          key: indexNowKey,
          keyLocation: `${siteUrl}/${indexNowKey}.txt`,
          urlList: [pageUrl]
        };

        const bingResponse = await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(indexNowPayload),
        });

        results.push({
          engine: 'IndexNow (Bing, Yandex)',
          status: bingResponse.ok || bingResponse.status === 202 ? 'success' : 'failed',
          message: `Status: ${bingResponse.status}`
        });
      } catch (error) {
        console.error('IndexNow error:', error);
        results.push({
          engine: 'IndexNow (Bing, Yandex)',
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Ping Yandex directly
      try {
        const yandexPingUrl = `https://webmaster.yandex.ru/ping?sitemap=${encodeURIComponent(siteUrl + '/sitemap.xml')}`;
        const yandexResponse = await fetch(yandexPingUrl);
        results.push({
          engine: 'Yandex Sitemap Ping',
          status: yandexResponse.ok ? 'success' : 'failed',
          message: `Status: ${yandexResponse.status}`
        });
      } catch (error) {
        console.error('Yandex ping error:', error);
        results.push({
          engine: 'Yandex Sitemap Ping',
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('Ping results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        submittedUrls: urlsToSubmit,
        message: 'URLs submitted to search engines for indexing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in ping-search-engines:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
