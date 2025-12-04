-- Fix subscribers RLS policies - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can view all subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;

-- Create PERMISSIVE policies for subscribers
CREATE POLICY "Admins can view all subscribers" 
ON public.subscribers 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can subscribe" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update subscribers" 
ON public.subscribers 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscribers" 
ON public.subscribers 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));