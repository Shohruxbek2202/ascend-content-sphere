-- Recreate the view with SECURITY INVOKER (safer default)
DROP VIEW IF EXISTS public.public_comments;

CREATE VIEW public.public_comments 
WITH (security_invoker = true)
AS
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