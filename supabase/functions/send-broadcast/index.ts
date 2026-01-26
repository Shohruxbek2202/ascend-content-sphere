import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// SMTP Helper Functions
function parseSmtpResponse(response: string): { code: number; message: string } {
  const match = response.match(/^(\d{3})\s/);
  if (match) {
    return { code: parseInt(match[1], 10), message: response };
  }
  const multilineMatch = response.match(/^(\d{3})-/);
  if (multilineMatch) {
    return { code: parseInt(multilineMatch[1], 10), message: response };
  }
  return { code: 0, message: response };
}

function isSuccessResponse(code: number): boolean {
  return code >= 200 && code < 400;
}

async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; error?: string }> {
  const SMTP_HOST = 'mail.shohruxdigital.uz';
  const SMTP_PORT = 465;
  const SMTP_USER = 'shohruxbek@shohruxdigital.uz';
  const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD');

  if (!SMTP_PASSWORD) {
    return { success: false, error: 'SMTP_PASSWORD not configured' };
  }

  try {
    const conn = await Deno.connectTls({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const read = async (): Promise<string> => {
      const buffer = new Uint8Array(4096);
      const n = await conn.read(buffer);
      if (n === null) return '';
      return decoder.decode(buffer.subarray(0, n));
    };

    const write = async (data: string): Promise<void> => {
      await conn.write(encoder.encode(data + '\r\n'));
    };

    // Read greeting
    const greeting = await read();
    console.log(`SMTP Greeting: ${greeting.trim()}`);
    const greetingParsed = parseSmtpResponse(greeting);
    if (!isSuccessResponse(greetingParsed.code)) {
      conn.close();
      return { success: false, error: `SMTP greeting failed: ${greeting.trim()}` };
    }

    // EHLO
    await write(`EHLO ${SMTP_HOST}`);
    const ehloResponse = await read();
    console.log(`EHLO Response: ${ehloResponse.trim()}`);
    const ehloParsed = parseSmtpResponse(ehloResponse);
    if (!isSuccessResponse(ehloParsed.code)) {
      conn.close();
      return { success: false, error: `EHLO failed: ${ehloResponse.trim()}` };
    }

    // AUTH LOGIN
    await write('AUTH LOGIN');
    const authResponse = await read();
    console.log(`AUTH Response: ${authResponse.trim()}`);

    // Send username (base64)
    await write(btoa(SMTP_USER));
    const userResponse = await read();
    console.log(`User Response: ${userResponse.trim()}`);

    // Send password (base64)
    await write(btoa(SMTP_PASSWORD));
    const passResponse = await read();
    console.log(`Pass Response code: ${parseSmtpResponse(passResponse).code}`);
    const passParsed = parseSmtpResponse(passResponse);
    if (!isSuccessResponse(passParsed.code)) {
      conn.close();
      return { success: false, error: `Authentication failed: ${passResponse.trim()}` };
    }

    // MAIL FROM
    await write(`MAIL FROM:<${SMTP_USER}>`);
    const mailFromResponse = await read();
    console.log(`MAIL FROM Response: ${mailFromResponse.trim()}`);
    const mailFromParsed = parseSmtpResponse(mailFromResponse);
    if (!isSuccessResponse(mailFromParsed.code)) {
      conn.close();
      return { success: false, error: `MAIL FROM failed: ${mailFromResponse.trim()}` };
    }

    // RCPT TO
    await write(`RCPT TO:<${to}>`);
    const rcptResponse = await read();
    console.log(`RCPT TO Response: ${rcptResponse.trim()}`);
    const rcptParsed = parseSmtpResponse(rcptResponse);
    if (!isSuccessResponse(rcptParsed.code)) {
      conn.close();
      return { success: false, error: `RCPT TO failed for ${to}: ${rcptResponse.trim()}` };
    }

    // DATA
    await write('DATA');
    const dataResponse = await read();
    console.log(`DATA Response: ${dataResponse.trim()}`);
    const dataParsed = parseSmtpResponse(dataResponse);
    if (dataParsed.code !== 354 && !isSuccessResponse(dataParsed.code)) {
      conn.close();
      return { success: false, error: `DATA command failed: ${dataResponse.trim()}` };
    }

    // Email headers and body
    const boundary = `boundary_${Date.now()}`;
    const emailContent = [
      `From: Shohrux Blog <${SMTP_USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      `Date: ${new Date().toUTCString()}`,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      htmlContent,
      ``,
      `--${boundary}--`,
      `.`,
    ].join('\r\n');

    await conn.write(encoder.encode(emailContent + '\r\n'));
    const sendResponse = await read();
    console.log(`Send Response: ${sendResponse.trim()}`);
    const sendParsed = parseSmtpResponse(sendResponse);
    if (!isSuccessResponse(sendParsed.code)) {
      conn.close();
      return { success: false, error: `Email send failed: ${sendResponse.trim()}` };
    }

    // QUIT
    await write('QUIT');
    conn.close();

    console.log(`Email successfully sent to ${to}`);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown SMTP error';
    console.error(`SMTP Error for ${to}:`, error);
    return { success: false, error: errorMessage };
  }
}

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

    // Rate limiting: 50ms delay between emails
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
      const result = await sendEmail(subscriber.email, subject, htmlContent);

      // Log to newsletter_logs
      await adminClient.from('newsletter_logs').insert({
        subscriber_email: subscriber.email,
        subscriber_language: lang,
        status: result.success ? 'sent' : 'failed',
        error_message: result.error || null,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        console.error(`Failed to send to ${subscriber.email}: ${result.error}`);
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 50));
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
