DROP POLICY IF EXISTS "Anyone can count active subscribers" ON public.subscribers;

CREATE OR REPLACE FUNCTION public.get_active_subscriber_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.subscribers WHERE active = true;
$$;