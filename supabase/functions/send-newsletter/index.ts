import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  postId: string;
  title: {
    uz: string;
    ru: string;
    en: string;
  };
  excerpt: {
    uz: string;
    ru: string;
    en: string;
  };
  slug: string;
  featuredImage?: string;
}

// SMTP Configuration
const SMTP_HOST = "mail.shohruxdigital.uz";
const SMTP_PORT = 465;
const SMTP_USERNAME = "shohruxbek@shohruxdigital.uz";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");

// Base64 encoding helper
function base64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// Parse SMTP response code
function parseSmtpResponse(response: string): { code: number; message: string } {
  const match = response.match(/^(\d{3})/);
  const code = match ? parseInt(match[1], 10) : 0;
  return { code, message: response.trim() };
}

// Check if SMTP response indicates success
function isSuccessResponse(code: number): boolean {
  return code >= 200 && code < 400;
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; details: string }> {
  const smtpLogs: string[] = [];
  
  // Create email content with Base64 encoding to avoid quoted-printable issues
  const boundary = `----=_Part_${Date.now()}`;
  const emailContent = [
    `From: Shohrux Blog <${SMTP_USERNAME}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${base64Encode(subject)}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    base64Encode(html),
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  let conn: Deno.TlsConn | null = null;
  
  try {
    // Connect to SMTP server
    conn = await Deno.connectTls({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    async function sendCommand(command: string): Promise<{ code: number; message: string }> {
      const displayCommand = command.startsWith('AUTH') || command === btoa(SMTP_USERNAME) || command === btoa(SMTP_PASSWORD!) 
        ? '[AUTH DATA]' 
        : command;
      smtpLogs.push(`C: ${displayCommand}`);
      
      await conn!.write(encoder.encode(command + '\r\n'));
      const buffer = new Uint8Array(2048);
      const n = await conn!.read(buffer);
      const response = decoder.decode(buffer.subarray(0, n || 0));
      
      const parsed = parseSmtpResponse(response);
      smtpLogs.push(`S: ${parsed.message}`);
      
      return parsed;
    }

    async function readResponse(): Promise<{ code: number; message: string }> {
      const buffer = new Uint8Array(2048);
      const n = await conn!.read(buffer);
      const response = decoder.decode(buffer.subarray(0, n || 0));
      const parsed = parseSmtpResponse(response);
      smtpLogs.push(`S: ${parsed.message}`);
      return parsed;
    }

    // Read greeting
    const greeting = await readResponse();
    if (!isSuccessResponse(greeting.code)) {
      throw new Error(`SMTP greeting failed: ${greeting.message}`);
    }
    
    // EHLO
    const ehlo = await sendCommand(`EHLO ${SMTP_HOST}`);
    if (!isSuccessResponse(ehlo.code)) {
      throw new Error(`EHLO failed: ${ehlo.message}`);
    }
    
    // AUTH LOGIN
    const authStart = await sendCommand('AUTH LOGIN');
    if (authStart.code !== 334) {
      throw new Error(`AUTH LOGIN failed: ${authStart.message}`);
    }
    
    const authUser = await sendCommand(btoa(SMTP_USERNAME));
    if (authUser.code !== 334) {
      throw new Error(`AUTH username failed: ${authUser.message}`);
    }
    
    const authPass = await sendCommand(btoa(SMTP_PASSWORD!));
    if (!isSuccessResponse(authPass.code)) {
      throw new Error(`AUTH password failed: ${authPass.message}`);
    }
    
    // MAIL FROM
    const mailFrom = await sendCommand(`MAIL FROM:<${SMTP_USERNAME}>`);
    if (!isSuccessResponse(mailFrom.code)) {
      throw new Error(`MAIL FROM failed: ${mailFrom.message}`);
    }
    
    // RCPT TO - This is where recipient rejection happens!
    const rcptTo = await sendCommand(`RCPT TO:<${to}>`);
    if (!isSuccessResponse(rcptTo.code)) {
      throw new Error(`RCPT TO failed (recipient rejected): ${rcptTo.message}`);
    }
    
    // DATA
    const dataStart = await sendCommand('DATA');
    if (dataStart.code !== 354) {
      throw new Error(`DATA command failed: ${dataStart.message}`);
    }
    
    // Send email content
    await conn.write(encoder.encode(emailContent + '\r\n.\r\n'));
    const dataEnd = await readResponse();
    if (!isSuccessResponse(dataEnd.code)) {
      throw new Error(`Email data rejected: ${dataEnd.message}`);
    }
    
    // QUIT
    await sendCommand('QUIT');
    
    console.log(`Email sent successfully to ${to}`);
    console.log(`SMTP session log:\n${smtpLogs.join('\n')}`);
    
    return { success: true, details: `Sent successfully. Server response: ${dataEnd.message}` };
    
  } catch (error: any) {
    console.error(`SMTP error for ${to}:`, error.message);
    console.error(`SMTP session log:\n${smtpLogs.join('\n')}`);
    return { success: false, details: `${error.message}. SMTP log: ${smtpLogs.slice(-3).join(' | ')}` };
  } finally {
    if (conn) {
      try {
        conn.close();
      } catch (_) {}
    }
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { postId, title, excerpt, slug, featuredImage }: NewsletterRequest = await req.json();

    console.log("Sending newsletter for post:", postId);

    // Get all active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("email, language")
      .eq("active", true);

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      throw subError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No active subscribers found");
      return new Response(
        JSON.stringify({ message: "No active subscribers", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${subscribers.length} active subscribers`);

    // Get site URL from environment or use default
    const siteUrl = Deno.env.get("SITE_URL") || "https://shfnpzfqtrfzdklnhatf.lovableproject.com";

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const successDetails: string[] = [];

    // Helper function to delay between emails
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Send emails to each subscriber with rate limiting
    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      const lang = subscriber.language || "uz";
      const postTitle = title[lang as keyof typeof title] || title.uz;
      const postExcerpt = excerpt[lang as keyof typeof excerpt] || excerpt.uz;

      const subjectText = {
        uz: `Yangi maqola: ${postTitle}`,
        ru: `Новая статья: ${postTitle}`,
        en: `New article: ${postTitle}`,
      };

      const buttonText = {
        uz: "O'qish",
        ru: "Читать",
        en: "Read",
      };

      const unsubscribeText = {
        uz: "Obunani bekor qilish",
        ru: "Отписаться",
        en: "Unsubscribe",
      };

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
<tr>
<td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
${featuredImage ? `<tr><td><img src="${featuredImage}" alt="${postTitle}" style="width: 100%; height: 250px; object-fit: cover;"></td></tr>` : ''}
<tr>
<td style="padding: 32px;">
<h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">${postTitle}</h1>
<p style="margin: 0 0 24px; color: #666; line-height: 1.6;">${postExcerpt}</p>
<a href="${siteUrl}/post/${slug}" style="display: inline-block; background: linear-gradient(135deg, #1E3A5F 0%, #F97316 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">${buttonText[lang as keyof typeof buttonText]}</a>
</td>
</tr>
<tr>
<td style="padding: 24px 32px; background: #f9fafb; text-align: center;">
<a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #999; font-size: 12px; text-decoration: underline;">${unsubscribeText[lang as keyof typeof unsubscribeText]}</a>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

      try {
        const result = await sendEmail(
          subscriber.email,
          subjectText[lang as keyof typeof subjectText],
          html
        );
        
        if (result.success) {
          sentCount++;
          successDetails.push(`${subscriber.email}: ${result.details}`);
          
          // Log successful send
          await supabase.from('newsletter_logs').insert({
            post_id: postId,
            subscriber_email: subscriber.email,
            subscriber_language: lang,
            status: 'sent'
          });
        } else {
          failedCount++;
          errors.push(`${subscriber.email}: ${result.details}`);
          
          // Log failed send with detailed error
          await supabase.from('newsletter_logs').insert({
            post_id: postId,
            subscriber_email: subscriber.email,
            subscriber_language: lang,
            status: 'failed',
            error_message: result.details
          });
        }
      } catch (emailError: any) {
        console.error(`Unexpected error sending email to ${subscriber.email}:`, emailError);
        failedCount++;
        errors.push(`${subscriber.email}: Unexpected error - ${emailError.message}`);
        
        // Log failed send
        await supabase.from('newsletter_logs').insert({
          post_id: postId,
          subscriber_email: subscriber.email,
          subscriber_language: lang,
          status: 'failed',
          error_message: emailError.message
        });
      }

      // Rate limiting: wait 1.5 seconds between emails
      if (i < subscribers.length - 1) {
        await delay(1500);
      }
    }

    console.log(`Newsletter completed: ${sentCount} sent, ${failedCount} failed out of ${subscribers.length} total`);
    if (errors.length > 0) {
      console.log(`Errors: ${errors.join('; ')}`);
    }

    return new Response(
      JSON.stringify({ 
        message: "Newsletter sending completed", 
        sent: sentCount,
        failed: failedCount,
        total: subscribers.length,
        errors: errors.length > 0 ? errors : undefined,
        successDetails: successDetails.length > 0 ? successDetails : undefined
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
