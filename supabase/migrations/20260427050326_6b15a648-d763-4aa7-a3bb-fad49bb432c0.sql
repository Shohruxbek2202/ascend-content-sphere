-- Strava activities cache
CREATE TABLE public.strava_activities (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  sport_type TEXT,
  distance NUMERIC NOT NULL DEFAULT 0,
  moving_time INTEGER NOT NULL DEFAULT 0,
  elapsed_time INTEGER NOT NULL DEFAULT 0,
  total_elevation_gain NUMERIC NOT NULL DEFAULT 0,
  average_speed NUMERIC,
  max_speed NUMERIC,
  average_heartrate NUMERIC,
  max_heartrate NUMERIC,
  start_date TIMESTAMPTZ NOT NULL,
  start_date_local TIMESTAMPTZ NOT NULL,
  timezone TEXT,
  location_city TEXT,
  location_country TEXT,
  kudos_count INTEGER DEFAULT 0,
  achievement_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_strava_activities_start_date ON public.strava_activities(start_date DESC);
CREATE INDEX idx_strava_activities_type ON public.strava_activities(type);

ALTER TABLE public.strava_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view strava activities"
ON public.strava_activities FOR SELECT
USING (true);

CREATE POLICY "Admins can manage strava activities"
ON public.strava_activities FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Strava summary (aggregated stats + athlete info)
CREATE TABLE public.strava_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id BIGINT NOT NULL UNIQUE,
  firstname TEXT,
  lastname TEXT,
  profile_url TEXT,
  city TEXT,
  country TEXT,
  -- Recent (last 4 weeks)
  recent_run_count INTEGER DEFAULT 0,
  recent_run_distance NUMERIC DEFAULT 0,
  recent_run_moving_time INTEGER DEFAULT 0,
  recent_ride_count INTEGER DEFAULT 0,
  recent_ride_distance NUMERIC DEFAULT 0,
  recent_ride_moving_time INTEGER DEFAULT 0,
  -- YTD
  ytd_run_count INTEGER DEFAULT 0,
  ytd_run_distance NUMERIC DEFAULT 0,
  ytd_run_moving_time INTEGER DEFAULT 0,
  ytd_ride_count INTEGER DEFAULT 0,
  ytd_ride_distance NUMERIC DEFAULT 0,
  ytd_ride_moving_time INTEGER DEFAULT 0,
  -- All time
  all_run_count INTEGER DEFAULT 0,
  all_run_distance NUMERIC DEFAULT 0,
  all_ride_count INTEGER DEFAULT 0,
  all_ride_distance NUMERIC DEFAULT 0,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.strava_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view strava summary"
ON public.strava_summary FOR SELECT
USING (true);

CREATE POLICY "Admins can manage strava summary"
ON public.strava_summary FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger
CREATE TRIGGER update_strava_activities_updated_at
BEFORE UPDATE ON public.strava_activities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strava_summary_updated_at
BEFORE UPDATE ON public.strava_summary
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();