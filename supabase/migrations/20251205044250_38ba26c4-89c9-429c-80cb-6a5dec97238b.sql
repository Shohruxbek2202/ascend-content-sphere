-- Create site_settings table for social media links and analytics
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage site settings"
ON public.site_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
('instagram_url', ''),
('telegram_url', ''),
('youtube_url', ''),
('facebook_url', ''),
('twitter_url', ''),
('linkedin_url', ''),
('ga4_measurement_id', ''),
('gtm_container_id', ''),
('meta_pixel_id', '');

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Storage policies for post images
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Admins can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update post images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'post-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete post images"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();