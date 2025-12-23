import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SMTP Configuration
const SMTP_HOST = "mail.shohruxdigital.uz";
const SMTP_PORT = 465;
const SMTP_USERNAME = "shohruxbek@shohruxdigital.uz";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");

interface ReplyRequest {
  to: string;
  toName: string;
  subject: string;
  message: string;
  originalMessage: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, toName, subject, message, originalMessage }: ReplyRequest = await req.json();

    console.log(`Sending reply to ${to}`);

    if (!SMTP_PASSWORD) {
      throw new Error("SMTP_PASSWORD is not configured");
    }

    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: true,
        auth: {
          username: SMTP_USERNAME,
          password: SMTP_PASSWORD,
        },
      },
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Shohrux Blog</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Assalomu alaykum, ${toName}!
              </p>
              
              <div style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 20px; white-space: pre-wrap;">
${message}
              </div>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; margin-top: 20px;">
                <p style="font-size: 12px; color: #666; margin: 0 0 10px 0; font-weight: bold;">Sizning xabaringiz:</p>
                <p style="font-size: 13px; color: #555; margin: 0; white-space: pre-wrap;">${originalMessage}</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #888; margin: 0;">
                Hurmat bilan,<br>
                <strong style="color: #667eea;">Shohruxbek</strong>
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Shohrux Blog. Barcha huquqlar himoyalangan.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await client.send({
        from: `Shohrux Blog <${SMTP_USERNAME}>`,
        to: to,
        subject: subject,
        content: "auto",
        html: html,
      });
      console.log(`Reply sent successfully to ${to}`);
    } finally {
      await client.close();
    }

    return new Response(
      JSON.stringify({ success: true, message: "Reply sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending reply:", error);
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
