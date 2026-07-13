
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT jobid, jobname FROM cron.job WHERE command ILIKE '%auto-news%' OR jobname ILIKE '%auto%news%' LOOP
    PERFORM cron.unschedule(r.jobid);
  END LOOP;
END $$;

DELETE FROM public.comments WHERE post_id IN (SELECT id FROM public.posts WHERE 'ai-generated' = ANY(tags));
DELETE FROM public.cluster_posts WHERE post_id IN (SELECT id FROM public.posts WHERE 'ai-generated' = ANY(tags));
DELETE FROM public.posts WHERE 'ai-generated' = ANY(tags);
