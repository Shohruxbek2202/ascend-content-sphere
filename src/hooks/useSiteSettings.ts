import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  instagram_url: string;
  telegram_url: string;
  youtube_url: string;
  facebook_url: string;
  twitter_url: string;
  linkedin_url: string;
  ga4_measurement_id: string;
  gtm_container_id: string;
  meta_pixel_id: string;
  [key: string]: string;
}

const defaultSettings: SiteSettings = {
  instagram_url: '',
  telegram_url: '',
  youtube_url: '',
  facebook_url: '',
  twitter_url: '',
  linkedin_url: '',
  ga4_measurement_id: '',
  gtm_container_id: '',
  meta_pixel_id: '',
};

const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const { data } = await supabase.from('site_settings').select('*');
  if (!data) return defaultSettings;
  const map: Record<string, string> = {};
  data.forEach(item => { map[item.key] = item.value || ''; });
  return { ...defaultSettings, ...map };
};

export const useSiteSettings = () => {
  const { data: settings = defaultSettings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
    staleTime: 10 * 60 * 1000, // 10 min cache
    gcTime: 30 * 60 * 1000,
  });

  return { settings, isLoading };
};
