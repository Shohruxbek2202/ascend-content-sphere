CREATE TABLE public.strava_auth (
  id INTEGER PRIMARY KEY DEFAULT 1,
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  access_token_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.strava_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view strava auth"
ON public.strava_auth FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can manage strava auth"
ON public.strava_auth FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));