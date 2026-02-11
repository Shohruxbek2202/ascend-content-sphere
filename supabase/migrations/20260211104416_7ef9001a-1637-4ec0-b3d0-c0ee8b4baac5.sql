
-- FAQ table for service-specific FAQs
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_category TEXT NOT NULL DEFAULT 'general',
  question_uz TEXT NOT NULL,
  question_ru TEXT NOT NULL DEFAULT '',
  question_en TEXT NOT NULL DEFAULT '',
  answer_uz TEXT NOT NULL,
  answer_ru TEXT NOT NULL DEFAULT '',
  answer_en TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQs are viewable by everyone" ON public.faqs FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all FAQs" ON public.faqs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert FAQs" ON public.faqs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update FAQs" ON public.faqs FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete FAQs" ON public.faqs FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Case Studies table
CREATE TABLE public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_uz TEXT NOT NULL,
  title_ru TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  description_uz TEXT NOT NULL,
  description_ru TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  client_name TEXT,
  service_type TEXT NOT NULL DEFAULT 'digital-marketing',
  challenge_uz TEXT,
  challenge_ru TEXT,
  challenge_en TEXT,
  solution_uz TEXT,
  solution_ru TEXT,
  solution_en TEXT,
  results_uz TEXT,
  results_ru TEXT,
  results_en TEXT,
  metrics JSONB DEFAULT '[]'::jsonb,
  featured_image TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published case studies viewable by everyone" ON public.case_studies FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all case studies" ON public.case_studies FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert case studies" ON public.case_studies FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update case studies" ON public.case_studies FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete case studies" ON public.case_studies FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON public.case_studies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Topic clusters table for content clustering
CREATE TABLE public.topic_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  pillar_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.topic_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topic clusters viewable by everyone" ON public.topic_clusters FOR SELECT USING (true);
CREATE POLICY "Admins can manage topic clusters" ON public.topic_clusters FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_topic_clusters_updated_at BEFORE UPDATE ON public.topic_clusters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Cluster posts junction table
CREATE TABLE public.cluster_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_id UUID NOT NULL REFERENCES public.topic_clusters(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(cluster_id, post_id)
);

ALTER TABLE public.cluster_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cluster posts viewable by everyone" ON public.cluster_posts FOR SELECT USING (true);
CREATE POLICY "Admins can manage cluster posts" ON public.cluster_posts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
