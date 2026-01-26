-- Add policy to allow public count of active subscribers
CREATE POLICY "Anyone can count active subscribers"
ON public.subscribers
FOR SELECT
USING (active = true);
