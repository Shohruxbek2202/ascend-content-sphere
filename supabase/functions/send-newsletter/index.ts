import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const siteUrl = Deno.env.get("SITE_URL") || "https://ascend-content-sphere.lovable.app";

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Send emails to each subscriber
    for (const subscriber of subscribers) {
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
        const emailResponse = await resend.emails.send({
          from: "Shohrux Blog <noreply@shohruxdigital.uz>",
          to: [subscriber.email],
          subject: subjectText[lang as keyof typeof subjectText],
          html: html,
        });

        console.log(`Email sent to ${subscriber.email}:`, emailResponse);
        sentCount++;

        // Log successful send
        await supabase.from('newsletter_logs').insert({
          post_id: postId,
          subscriber_email: subscriber.email,
          subscriber_language: lang,
          status: 'sent'
        });
      } catch (emailError: unknown) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
        console.error(`Failed to send email to ${subscriber.email}:`, errorMessage);
        failedCount++;
        errors.push(`${subscriber.email}: ${errorMessage}`);

        // Log failed send
        await supabase.from('newsletter_logs').insert({
          post_id: postId,
          subscriber_email: subscriber.email,
          subscriber_language: lang,
          status: 'failed',
          error_message: errorMessage
        });
      }

      // Delay to respect rate limits (2 requests/second max for Resend)
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    console.log(`Newsletter completed: ${sentCount} sent, ${failedCount} failed out of ${subscribers.length} total`);

    return new Response(
      JSON.stringify({ 
        message: "Newsletter sending completed", 
        sent: sentCount,
        failed: failedCount,
        total: subscribers.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
