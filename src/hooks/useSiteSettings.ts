import { useState, useEffect } from 'react';
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
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    instagram_url: '',
    telegram_url: '',
    youtube_url: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    ga4_measurement_id: '',
    gtm_container_id: '',
    meta_pixel_id: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*');

      if (data) {
        const settingsMap: any = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value || '';
        });
        setSettings(settingsMap as SiteSettings);
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  return { settings, isLoading };
};