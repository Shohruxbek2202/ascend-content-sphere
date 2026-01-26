import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BroadcastRequest {
  subject_uz: string;
  subject_ru: string;
  subject_en: string;
  message_uz: string;
  message_ru: string;
  message_en: string;
  target_language: 'all' | 'uz' | 'ru' | 'en';
  include_inactive: boolean;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function generateEmailHtml(message: string, language: string): string {
  const unsubscribeText = {
    uz: "Obunani bekor qilish",
    ru: "Отписаться",
    en: "Unsubscribe"
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Shohrux Blog</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="color: #333333; font-size: 16px; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Shohrux Blog
              </p>
              <p style="margin: 10px 0 0 0;">
                <a href="https://shohruxdigital.uz/unsubscribe" style="color: #999999; font-size: 12px; text-decoration: underline;">
                  ${unsubscribeText[language as keyof typeof unsubscribeText] || unsubscribeText.en}
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify user is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: BroadcastRequest = await req.json();
    const {
      subject_uz,
      subject_ru,
      subject_en,
      message_uz,
      message_ru,
      message_en,
      target_language,
      include_inactive
    } = body;

    // Fetch subscribers based on filters
    let query = adminClient.from('subscribers').select('*');
    
    if (!include_inactive) {
      query = query.eq('active', true);
    }
    
    if (target_language !== 'all') {
      query = query.eq('language', target_language);
    }

    const { data: subscribers, error: subsError } = await query;

    if (subsError) {
      throw new Error(`Failed to fetch subscribers: ${subsError.message}`);
    }

    console.log(`Found ${subscribers?.length || 0} subscribers to send broadcast`);

    let sent = 0;
    let failed = 0;

    // Send emails using Resend API
    for (const subscriber of subscribers || []) {
      const lang = subscriber.language || 'uz';
      
      let subject = subject_uz;
      let message = message_uz;
      
      if (lang === 'ru' && subject_ru) {
        subject = subject_ru;
        message = message_ru;
      } else if (lang === 'en' && subject_en) {
        subject = subject_en;
        message = message_en;
      }

      const htmlContent = generateEmailHtml(message, lang);
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Shohrux Blog <noreply@shohruxdigital.uz>",
          to: [subscriber.email],
          subject: subject,
          html: htmlContent,
        });

        console.log(`Email sent to ${subscriber.email}:`, emailResponse);

        // Log to newsletter_logs
        await adminClient.from('newsletter_logs').insert({
          subscriber_email: subscriber.email,
          subscriber_language: lang,
          status: 'sent',
          error_message: null,
        });

        sent++;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to send to ${subscriber.email}:`, errorMessage);
        
        // Log failed send
        await adminClient.from('newsletter_logs').insert({
          subscriber_email: subscriber.email,
          subscriber_language: lang,
          status: 'failed',
          error_message: errorMessage,
        });

        failed++;
      }

      // Delay to respect rate limits (2 requests/second max for Resend)
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    console.log(`Broadcast complete: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ success: true, sent, failed, total: subscribers?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Broadcast error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
