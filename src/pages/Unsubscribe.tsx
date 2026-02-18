import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';

type Status = 'loading' | 'success' | 'error' | 'notFound' | 'idle';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [status, setStatus] = useState<Status>('idle');
  const email = searchParams.get('email');

  useEffect(() => {
    if (email) {
      handleUnsubscribe();
    }
  }, [email]);

  const handleUnsubscribe = async () => {
    if (!email) return;
    setStatus('loading');

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .update({ active: false, unsubscribed_at: new Date().toISOString() })
        .eq('email', email)
        .eq('active', true)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        setStatus('notFound');
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('error');
    }
  };

  const content = {
    uz: {
      title: 'Obunani bekor qilish',
      loading: 'Qayta ishlanmoqda...',
      success: 'Obuna bekor qilindi',
      successMsg: `${email} manzili obunadan muvaffaqiyatli chiqarildi. Endi siz yangiliklar olmaysiz.`,
      notFound: 'Obuna topilmadi',
      notFoundMsg: 'Bu email manzil obunalar ro\'yxatida topilmadi yoki allaqachon bekor qilingan.',
      error: 'Xatolik yuz berdi',
      errorMsg: 'Obunani bekor qilishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.',
      backHome: 'Bosh sahifaga qaytish',
      resubscribe: 'Qayta obuna bo\'lish',
    },
    ru: {
      title: 'Отписаться от рассылки',
      loading: 'Обработка...',
      success: 'Вы успешно отписались',
      successMsg: `Адрес ${email} успешно удален из списка рассылки. Вы больше не будете получать новости.`,
      notFound: 'Подписка не найдена',
      notFoundMsg: 'Этот email-адрес не найден в списке рассылки или уже отписан.',
      error: 'Произошла ошибка',
      errorMsg: 'При отписке произошла ошибка. Пожалуйста, попробуйте еще раз.',
      backHome: 'На главную',
      resubscribe: 'Подписаться снова',
    },
    en: {
      title: 'Unsubscribe',
      loading: 'Processing...',
      success: 'Successfully unsubscribed',
      successMsg: `${email} has been successfully removed from the newsletter. You will no longer receive updates.`,
      notFound: 'Subscription not found',
      notFoundMsg: 'This email address was not found in our list or has already been unsubscribed.',
      error: 'An error occurred',
      errorMsg: 'An error occurred while unsubscribing. Please try again.',
      backHome: 'Back to Home',
      resubscribe: 'Subscribe Again',
    },
  };

  const c = content[language] || content.uz;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={c.title + ' | ShohruxDigital'} description={c.title} />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            {status === 'idle' && !email && (
              <div className="space-y-4">
                <Mail className="w-16 h-16 mx-auto text-muted-foreground" />
                <h1 className="text-2xl font-bold">{c.title}</h1>
                <p className="text-muted-foreground">Email parametri topilmadi.</p>
                <Button asChild>
                  <Link to="/">{c.backHome}</Link>
                </Button>
              </div>
            )}

            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
                <p className="text-muted-foreground">{c.loading}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6">
                <CheckCircle className="w-16 h-16 mx-auto text-secondary" />
                <div>
                  <h1 className="text-2xl font-bold mb-2">{c.success}</h1>
                  <p className="text-muted-foreground">{c.successMsg}</p>
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button variant="outline" asChild>
                    <Link to="/">{c.backHome}</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/subscribe">{c.resubscribe}</Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'notFound' && (
              <div className="space-y-6">
                <XCircle className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h1 className="text-2xl font-bold mb-2">{c.notFound}</h1>
                  <p className="text-muted-foreground">{c.notFoundMsg}</p>
                </div>
                <Button asChild>
                  <Link to="/">{c.backHome}</Link>
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6">
                <XCircle className="w-16 h-16 mx-auto text-destructive" />
                <div>
                  <h1 className="text-2xl font-bold mb-2">{c.error}</h1>
                  <p className="text-muted-foreground">{c.errorMsg}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleUnsubscribe}>Qayta urinish</Button>
                  <Button variant="outline" asChild>
                    <Link to="/">{c.backHome}</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Unsubscribe;
