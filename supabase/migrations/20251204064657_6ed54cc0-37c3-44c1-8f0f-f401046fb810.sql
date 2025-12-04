-- Fix posts RLS policies - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.posts;

-- Create PERMISSIVE policies for posts
CREATE POLICY "Published posts are viewable by everyone" 
ON public.posts 
FOR SELECT 
USING (published = true);

CREATE POLICY "Admins can view all posts" 
ON public.posts 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts" 
ON public.posts 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts" 
ON public.posts 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix categories RLS policies - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;

-- Create PERMISSIVE policies for categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories" 
ON public.categories 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories" 
ON public.categories 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));