import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Resize image using Canvas API (available in Deno)
async function resizeImage(
  imageData: Uint8Array,
  contentType: string,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<{ data: Uint8Array; width: number; height: number }> {
  // Use OffscreenCanvas for image processing
  const blob = new Blob([imageData], { type: contentType });
  const imageBitmap = await createImageBitmap(blob);

  let { width, height } = imageBitmap;

  // Calculate new dimensions maintaining aspect ratio
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  // Convert to WebP
  const webpBlob = await canvas.convertToBlob({
    type: "image/webp",
    quality: quality,
  });

  const arrayBuffer = await webpBlob.arrayBuffer();
  return {
    data: new Uint8Array(arrayBuffer),
    width,
    height,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = req.headers.get("content-type") || "";

    let imageData: Uint8Array;
    let originalName = "image";
    let sourceType = "upload";

    if (contentType.includes("application/json")) {
      // URL-based image
      const { url, maxWidth = 1200, maxHeight = 800, quality = 0.85 } = await req.json();

      if (!url) {
        return new Response(JSON.stringify({ error: "URL is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if already in our storage
      if (url.includes(supabaseUrl) && url.includes("/post-images/")) {
        // Already in storage, just return optimized version
        const pathMatch = url.match(/post-images\/(.+)$/);
        if (pathMatch) {
          const existingPath = pathMatch[1];
          // If already WebP, just return
          if (existingPath.endsWith(".webp")) {
            return new Response(
              JSON.stringify({
                url,
                optimized: false,
                message: "Already optimized WebP",
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        }
      }

      // Download external image
      console.log(`Downloading image from: ${url}`);
      const response = await fetch(url, {
        headers: {
          "User-Agent": "ShohruxDigital-ImageOptimizer/1.0",
        },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            error: `Failed to download image: ${response.status}`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      imageData = new Uint8Array(arrayBuffer);

      // Extract filename from URL
      try {
        const urlPath = new URL(url).pathname;
        originalName = urlPath.split("/").pop() || "image";
      } catch {
        originalName = "downloaded-image";
      }
      sourceType = "url";

      // Resize and convert to WebP
      const imgContentType =
        response.headers.get("content-type") || "image/jpeg";
      
      console.log(`Processing image: ${imageData.length} bytes, type: ${imgContentType}`);
      
      const result = await resizeImage(
        imageData,
        imgContentType,
        maxWidth,
        maxHeight,
        quality
      );

      // Generate filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `posts/${timestamp}-${randomStr}.webp`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, result.data, {
          contentType: "image/webp",
          cacheControl: "31536000", // 1 year cache
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(
          JSON.stringify({ error: "Upload failed: " + uploadError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(fileName);

      const savings = imageData.length - result.data.length;
      const savingsPercent = Math.round((savings / imageData.length) * 100);

      return new Response(
        JSON.stringify({
          url: publicUrl,
          optimized: true,
          source: sourceType,
          originalSize: imageData.length,
          optimizedSize: result.data.length,
          savings: `${savingsPercent}%`,
          width: result.width,
          height: result.height,
          format: "webp",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (contentType.includes("multipart/form-data")) {
      // File upload
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const maxWidth = parseInt(formData.get("maxWidth") as string) || 1200;
      const maxHeight = parseInt(formData.get("maxHeight") as string) || 800;
      const quality = parseFloat(formData.get("quality") as string) || 0.85;

      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const arrayBuffer = await file.arrayBuffer();
      imageData = new Uint8Array(arrayBuffer);
      originalName = file.name;

      console.log(`Processing upload: ${file.name}, ${imageData.length} bytes, type: ${file.type}`);

      // Resize and convert to WebP
      const result = await resizeImage(
        imageData,
        file.type,
        maxWidth,
        maxHeight,
        quality
      );

      // Generate filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `posts/${timestamp}-${randomStr}.webp`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, result.data, {
          contentType: "image/webp",
          cacheControl: "31536000", // 1 year cache
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(
          JSON.stringify({ error: "Upload failed: " + uploadError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(fileName);

      const savings = imageData.length - result.data.length;
      const savingsPercent = Math.round((savings / imageData.length) * 100);

      return new Response(
        JSON.stringify({
          url: publicUrl,
          optimized: true,
          source: "upload",
          originalSize: imageData.length,
          optimizedSize: result.data.length,
          savings: `${savingsPercent}%`,
          width: result.width,
          height: result.height,
          format: "webp",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported content type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Image optimization error:", error);
    return new Response(
      JSON.stringify({
        error: "Image processing failed",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
