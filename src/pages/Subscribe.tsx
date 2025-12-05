import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCircle, Mail } from 'lucide-react';
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
        'Yangi maqolalar haqida birinchi bo\'lib bilib oling',
        'Faqat obunachilarga maxsus materiallar',
        'Har hafta eng yaxshi 5ta maqola tavsiyasi',
        'Istalgan vaqtda obunani bekor qilish mumkin'
      ],
      placeholder: 'Email manzilingiz',
      button: 'Obuna bo\'lish',
      loading: 'Yuklanmoqda...',
      success: 'Tabriklaymiz! Siz muvaffaqiyatli obuna bo\'ldingiz.',
      successSubtitle: 'Tez orada yangiliklar emailingizga keladi.',
      error: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.'
    },
    ru: {
      title: 'Будьте в курсе новостей',
      subtitle: 'Лучшие статьи и полезные советы каждую неделю прямо на ваш email!',
      benefits: [
        'Узнавайте о новых статьях первыми',
        'Эксклюзивные материалы только для подписчиков',
        'Топ-5 статей каждую неделю',
        'Отписаться можно в любой момент'
      ],
      placeholder: 'Ваш email',
      button: 'Подписаться',
      loading: 'Загрузка...',
      success: 'Поздравляем! Вы успешно подписались.',
      successSubtitle: 'Скоро новости придут на ваш email.',
      error: 'Произошла ошибка. Попробуйте снова.'
    },
    en: {
      title: 'Stay Updated',
      subtitle: 'Get the best articles and useful tips delivered to your inbox every week!',
      benefits: [
        'Be the first to know about new articles',
        'Exclusive content for subscribers only',
        'Top 5 articles every week',
        'Unsubscribe anytime'
      ],
      placeholder: 'Your email address',
      button: 'Subscribe',
      loading: 'Loading...',
      success: 'Congratulations! You have successfully subscribed.',
      successSubtitle: 'News will arrive in your email soon.',
      error: 'An error occurred. Please try again.'
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
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {isSubscribed ? (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="font-display text-3xl font-bold mb-4">{t.success}</h1>
                <p className="text-muted-foreground text-lg">{t.successSubtitle}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-center mb-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-display text-4xl font-bold mb-4">{t.title}</h1>
                <p className="text-muted-foreground text-lg">{t.subtitle}</p>
              </div>

              <Card>
                <CardContent className="p-8">
                  <ul className="space-y-4 mb-8">
                    {t.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.placeholder}
                          className="pl-10"
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? t.loading : t.button}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Subscribe;