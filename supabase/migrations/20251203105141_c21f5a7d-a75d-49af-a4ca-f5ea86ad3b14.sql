-- =====================================================
-- BLOG PLATFORM DATABASE SCHEMA
-- 3-language support (Uzbek, Russian, English)
-- =====================================================

-- 1. Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Categories table (3 languages)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are public
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Posts table (3 languages)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  
  -- Multilingual content
  title_uz TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  title_en TEXT NOT NULL,
  
  excerpt_uz TEXT,
  excerpt_ru TEXT,
  excerpt_en TEXT,
  
  content_uz TEXT NOT NULL,
  content_ru TEXT NOT NULL,
  content_en TEXT NOT NULL,
  
  -- Metadata
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  featured_image TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Stats
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 5,
  
  -- Status
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Author
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Published posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all posts"
  ON public.posts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage posts"
  ON public.posts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Approved comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (approved = true);

CREATE POLICY "Admins can view all comments"
  ON public.comments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage comments"
  ON public.comments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Subscribers table
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  language TEXT DEFAULT 'uz' NOT NULL CHECK (language IN ('uz', 'ru', 'en')),
  active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  unsubscribed_at TIMESTAMPTZ
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Subscribers policies
CREATE POLICY "Anyone can subscribe"
  ON public.subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all subscribers"
  ON public.subscribers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscribers"
  ON public.subscribers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Analytics events table
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  language TEXT CHECK (language IN ('uz', 'ru', 'en')),
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON public.analytics_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Create indexes for performance
CREATE INDEX idx_posts_published ON public.posts(published, published_at DESC);
CREATE INDEX idx_posts_category ON public.posts(category_id);
CREATE INDEX idx_posts_featured ON public.posts(featured, published_at DESC);
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_comments_post ON public.comments(post_id, approved);
CREATE INDEX idx_analytics_post ON public.analytics_events(post_id, created_at DESC);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type, created_at DESC);

-- 8. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Apply updated_at triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Insert default categories
INSERT INTO public.categories (slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, icon, color) VALUES
  ('digital-marketing', 'Digital Marketing', 'Цифровой Маркетинг', 'Digital Marketing', 'Zamonaviy marketing strategiyalari', 'Современные маркетинговые стратегии', 'Modern marketing strategies', 'TrendingUp', '#3B82F6'),
  ('seo', 'SEO', 'SEO', 'SEO', 'Qidiruv tizimlarida optimizatsiya', 'Оптимизация поисковых систем', 'Search Engine Optimization', 'Search', '#10B981'),
  ('content-marketing', 'Content Marketing', 'Контент Маркетинг', 'Content Marketing', 'Samarali kontent yaratish', 'Эффективное создание контента', 'Effective content creation', 'FileText', '#F59E0B'),
  ('social-media', 'Social Media', 'Социальные Сети', 'Social Media', 'Ijtimoiy tarmoqlar strategiyasi', 'Стратегия социальных сетей', 'Social media strategy', 'Share2', '#8B5CF6'),
  ('personal-development', 'Shaxsiy Rivojlanish', 'Личное Развитие', 'Personal Development', 'Oz-ozini rivojlantirish', 'Саморазвитие', 'Self-improvement', 'Users', '#EF4444');

-- 11. Function to increment post views
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.posts SET views = views + 1 WHERE id = post_id;
$$;

-- 12. Function to increment post likes
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.posts SET likes = likes + 1 WHERE id = post_id;
$$;