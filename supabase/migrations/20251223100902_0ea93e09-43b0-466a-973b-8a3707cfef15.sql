-- Create newsletter_logs table to track sent emails
CREATE TABLE public.newsletter_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  subscriber_language TEXT DEFAULT 'uz',
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view newsletter logs"
ON public.newsletter_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert logs
CREATE POLICY "Admins can insert newsletter logs"
ON public.newsletter_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert (for edge functions)
CREATE POLICY "Service role can insert newsletter logs"
ON public.newsletter_logs
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_newsletter_logs_post_id ON public.newsletter_logs(post_id);
CREATE INDEX idx_newsletter_logs_sent_at ON public.newsletter_logs(sent_at DESC);