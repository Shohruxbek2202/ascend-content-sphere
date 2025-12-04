-- Recreate public_comments view with approved filter and add RLS
DROP VIEW IF EXISTS public.public_comments;

CREATE VIEW public.public_comments 
WITH (security_invoker = true)
AS
SELECT 
  id,
  post_id,
  author_name,
  content,
  created_at,
  updated_at,
  approved
FROM public.comments
WHERE approved = true;

-- Grant access to the view
GRANT SELECT ON public.public_comments TO anon, authenticated;