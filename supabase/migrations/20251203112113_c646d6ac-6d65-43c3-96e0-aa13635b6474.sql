-- Create a secure view for public comment access that excludes author_email
CREATE OR REPLACE VIEW public.public_comments AS
SELECT 
  id,
  post_id,
  author_name,
  content,
  approved,
  created_at,
  updated_at
FROM public.comments
WHERE approved = true;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_comments TO anon;
GRANT SELECT ON public.public_comments TO authenticated;

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON public.comments;