import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const SubscribeSection = () => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error(language === 'uz' ? 'Iltimos, to\'g\'ri email kiriting' : 
                  language === 'ru' ? 'Пожалуйста, введите правильный email' : 
                  'Please enter a valid email');
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('subscribers')
        .select('id, active')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        if (existing.active) {
          toast.info(language === 'uz' ? 'Bu email allaqachon obuna bo\'lgan' : 
                     language === 'ru' ? 'Этот email уже подписан' : 
                     'This email is already subscribed');
        } else {
          // Reactivate subscription
          await supabase
            .from('subscribers')
            .update({ active: true, unsubscribed_at: null })
            .eq('id', existing.id);
          toast.success(t.subscribe.success);
        }
      } else {
        // Insert new subscriber
        const { error } = await supabase
          .from('subscribers')
          .insert({ email, language, active: true });

        if (error) throw error;
        toast.success(t.subscribe.success);
      }

      setEmail('');
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 
                  language === 'ru' ? 'Произошла ошибка' : 
                  'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            {t.subscribe.title}
          </h2>

          <p className="text-white/90 text-lg">
            {t.subscribe.description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-8"
          >
            <Input
              type="email"
              placeholder={t.subscribe.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                language === 'uz' ? 'Yuborilmoqda...' : 
                language === 'ru' ? 'Отправка...' : 'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t.subscribe.button}
                </>
              )}
            </Button>
          </form>

          <p className="text-white/60 text-sm">
            🔒 {language === 'uz' ? 'Email manzilingiz xavfsiz saqlanadi' : 
                language === 'ru' ? 'Ваш email надёжно защищён' : 
                'Your email is securely protected'}
          </p>
        </div>
      </div>
    </section>
  );
};