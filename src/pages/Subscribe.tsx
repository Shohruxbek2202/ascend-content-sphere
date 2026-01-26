import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, CheckCircle, Mail, Sparkles, Gift, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Subscribe = () => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const content = {
    uz: {
      title: 'Yangiliklardan xabardor bo\'ling',
      subtitle: 'Har hafta eng sara maqolalar va foydali maslahatlar to\'g\'ridan-to\'g\'ri emailingizga!',
      benefits: [
        { icon: Sparkles, text: 'Yangi maqolalar haqida birinchi bo\'lib bilib oling' },
        { icon: Gift, text: 'Faqat obunachilarga maxsus materiallar' },
        { icon: Zap, text: 'Har hafta eng yaxshi 5ta maqola tavsiyasi' },
      ],
      placeholder: 'Email manzilingiz',
      button: 'Obuna bo\'lish',
      loading: 'Yuklanmoqda...',
      success: 'Tabriklaymiz!',
      successSubtitle: 'Siz muvaffaqiyatli obuna bo\'ldingiz. Tez orada yangiliklar emailingizga keladi.',
      error: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.',
      note: 'Istalgan vaqtda obunani bekor qilish mumkin'
    },
    ru: {
      title: 'Будьте в курсе новостей',
      subtitle: 'Лучшие статьи и полезные советы каждую неделю прямо на ваш email!',
      benefits: [
        { icon: Sparkles, text: 'Узнавайте о новых статьях первыми' },
        { icon: Gift, text: 'Эксклюзивные материалы только для подписчиков' },
        { icon: Zap, text: 'Топ-5 статей каждую неделю' },
      ],
      placeholder: 'Ваш email',
      button: 'Подписаться',
      loading: 'Загрузка...',
      success: 'Поздравляем!',
      successSubtitle: 'Вы успешно подписались. Скоро новости придут на ваш email.',
      error: 'Произошла ошибка. Попробуйте снова.',
      note: 'Отписаться можно в любой момент'
    },
    en: {
      title: 'Stay Updated',
      subtitle: 'Get the best articles and useful tips delivered to your inbox every week!',
      benefits: [
        { icon: Sparkles, text: 'Be the first to know about new articles' },
        { icon: Gift, text: 'Exclusive content for subscribers only' },
        { icon: Zap, text: 'Top 5 articles every week' },
      ],
      placeholder: 'Your email address',
      button: 'Subscribe',
      loading: 'Loading...',
      success: 'Congratulations!',
      successSubtitle: 'You have successfully subscribed. News will arrive in your email soon.',
      error: 'An error occurred. Please try again.',
      note: 'Unsubscribe anytime'
    }
  };

  const t = content[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert({ email, language });

      if (error) {
        if (error.code === '23505') {
          toast.error('Bu email allaqachon ro\'yxatdan o\'tgan');
        } else {
          toast.error(t.error);
        }
      } else {
        setIsSubscribed(true);
        toast.success(t.success);
      }
    } catch {
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative pt-20 pb-12">
        {/* Liquid Glass Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-secondary/20 via-secondary/5 to-transparent blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-bl from-primary/10 via-secondary/5 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto">
            {isSubscribed ? (
              /* Success State - Liquid Glass */
              <div className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-green-500/30 shadow-xl p-8 md:p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/30 to-green-500/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="font-display text-3xl font-bold mb-3">{t.success}</h1>
                <p className="text-muted-foreground text-lg">{t.successSubtitle}</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 shadow-lg shadow-secondary/20">
                    <Bell className="w-8 h-8 text-secondary" />
                  </div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{t.title}</h1>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">{t.subtitle}</p>
                </div>

                {/* Main Card - Liquid Glass */}
                <div className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl p-6 md:p-8">
                  {/* Benefits */}
                  <div className="space-y-4 mb-8">
                    {t.benefits.map((benefit, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 dark:bg-white/[0.02] border border-white/10"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="text-foreground/90">{benefit.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.placeholder}
                        className="pl-12 h-12 rounded-xl bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 backdrop-blur-sm focus:border-secondary/50"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold shadow-lg shadow-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/30"
                    >
                      {isLoading ? t.loading : t.button}
                    </Button>
                  </form>

                  {/* Note */}
                  <p className="text-center text-sm text-muted-foreground mt-4">{t.note}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Subscribe;
