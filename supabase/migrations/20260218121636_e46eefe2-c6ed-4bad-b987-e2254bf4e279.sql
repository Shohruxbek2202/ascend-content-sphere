-- Newsletter logs uchun keraksiz "WITH CHECK (true)" policy ni olib tashlash
-- Edge funksiyalar service_role key bilan RLS ni bypass qiladi,
-- bu policy hech kimga kerak emas va xavfli
DROP POLICY IF EXISTS "Service role can insert newsletter logs" ON public.newsletter_logs;

-- Unsubscribe funksiyasi ishlashi uchun email orqali o'z obunasini bekor qila olsin
-- (faqat active = false qila oladi, email orqali aniqlash)
CREATE POLICY "Anyone can unsubscribe by email"
  ON public.subscribers
  FOR UPDATE
  USING (true)
  WITH CHECK (active = false AND unsubscribed_at IS NOT NULL);