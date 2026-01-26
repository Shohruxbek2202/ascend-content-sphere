import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
    <section className="py-24 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-background">
            {t.subscribe.title}
          </h2>

          <p className="text-background/70 text-lg leading-relaxed">
            {t.subscribe.description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mt-8"
          >
            <Input
              type="email"
              placeholder={t.subscribe.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-background border-0 text-foreground placeholder:text-muted-foreground h-12 rounded-full px-6"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium rounded-full px-8 h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                language === 'uz' ? 'Yuborilmoqda...' : 
                language === 'ru' ? 'Отправка...' : 'Sending...'
              ) : (
                <>
                  {t.subscribe.button}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-background/50 text-sm">
            {language === 'uz' ? 'Email manzilingiz xavfsiz saqlanadi' : 
                language === 'ru' ? 'Ваш email надёжно защищён' : 
                'Your email is securely protected'}
          </p>
        </div>
      </div>
    </section>
  );
};
