import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LandingRenderer } from '@/components/landing/LandingRenderer';
import { mergeConfig } from '@/lib/landing';

const LandingPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['landing', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (data?.title) document.title = data.title;
  }, [data?.title]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
        <h1 className="text-2xl font-bold">Landing topilmadi</h1>
        <p className="text-muted-foreground">Bu havola noto‘g‘ri yoki sahifa e’lon qilinmagan.</p>
      </div>
    );
  }

  return (
    <LandingRenderer
      template={data.template}
      config={mergeConfig(data.config)}
      landingId={data.id}
      slug={data.slug}
    />
  );
};

export default LandingPage;
