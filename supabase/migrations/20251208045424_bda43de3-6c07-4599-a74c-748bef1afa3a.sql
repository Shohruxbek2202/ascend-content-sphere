-- Create SEO keywords table for managing site-wide SEO keywords
CREATE TABLE public.seo_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  keyword_group TEXT DEFAULT 'general',
  url TEXT,
  language TEXT DEFAULT 'uz',
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;

-- Anyone can view SEO keywords (for meta tags)
CREATE POLICY "SEO keywords are viewable by everyone" 
ON public.seo_keywords 
FOR SELECT 
USING (true);

-- Only admins can manage SEO keywords
CREATE POLICY "Admins can insert SEO keywords" 
ON public.seo_keywords 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update SEO keywords" 
ON public.seo_keywords 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete SEO keywords" 
ON public.seo_keywords 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add SEO fields to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS meta_title_uz TEXT,
ADD COLUMN IF NOT EXISTS meta_title_ru TEXT,
ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
ADD COLUMN IF NOT EXISTS meta_description_uz TEXT,
ADD COLUMN IF NOT EXISTS meta_description_ru TEXT,
ADD COLUMN IF NOT EXISTS meta_description_en TEXT,
ADD COLUMN IF NOT EXISTS focus_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Create trigger for updated_at
CREATE TRIGGER update_seo_keywords_updated_at
BEFORE UPDATE ON public.seo_keywords
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();