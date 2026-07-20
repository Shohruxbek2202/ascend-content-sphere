import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from '@/i18n/LocalizedLink';
import { CheckCircle, XCircle, Loader2, Mail, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

type Status = 'loading' | 'success' | 'error' | 'notFound' | 'idle';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [status, setStatus] = useState<Status>('idle');
  const email = searchParams.get('email');

  useEffect(() => {
    if (email) handleUnsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleUnsubscribe = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .update({ active: false, unsubscribed_at: new Date().toISOString() })
        .eq('email', email).eq('active', true).select('id');
      if (error) throw error;
      setStatus(!data || data.length === 0 ? 'notFound' : 'success');
    } catch {
      setStatus('error');
    }
  };

  const t = (uz: string, ru: string, en: string) => (language === 'uz' ? uz : language === 'ru' ? ru : en);

  const cfg = {
    loading: { Icon: Loader2, eyebrow: t('Qayta ishlanmoqda', 'Обработка', 'Processing'),
      title: t('Bir lahza', 'Минуту', 'Hold on'), msg: '' },
    success: { Icon: CheckCircle, eyebrow: t('Bajarildi', 'Готово', 'Done'),
      title: t('Obuna bekor qilindi', 'Подписка отменена', 'Unsubscribed'),
      msg: t(`${email} — endi ro'yxatda emas.`, `${email} — больше не в списке.`, `${email} — no longer on the list.`) },
    notFound: { Icon: XCircle, eyebrow: t('Topilmadi', 'Не найдено', 'Not found'),
      title: t('Obuna mavjud emas', 'Подписка не найдена', 'Subscription not found'),
      msg: t('Bu email ro\'yxatda yo\'q yoki allaqachon bekor qilingan.', 'Email не в списке или уже отписан.', 'This email isn\'t on the list, or it was already removed.') },
    error: { Icon: XCircle, eyebrow: t('Xatolik', 'Ошибка', 'Error'),
      title: t('Nimadir noto\'g\'ri ketdi', 'Что-то пошло не так', 'Something went wrong'),
      msg: t('Iltimos, qaytadan urinib ko\'ring.', 'Пожалуйста, попробуйте снова.', 'Please try again.') },
    idle: { Icon: Mail, eyebrow: t('Yo\'riqnoma', 'Инструкция', 'Notice'),
      title: t('Email parametri yo\'q', 'Параметр email отсутствует', 'Email parameter missing'),
      msg: t('Bu sahifa email havolasi orqali ochiladi.', 'Эта страница открывается по ссылке из email.', 'This page is opened from an email link.') },
  } as const;

  const current = cfg[status];
  const Icon = current.Icon;

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <SEOHead title={t('Obunani bekor qilish', 'Отписка', 'Unsubscribe') + ' | ShohruxDigital'} description={t('Obuna boshqaruvi', 'Управление подпиской', 'Subscription management')} />
      <Header />

      <main className="max-w-screen-2xl mx-auto px-6 md:px-8 py-20 md:py-32">
        <div className="max-w-2xl mx-auto border border-[hsl(var(--rule))] p-10 md:p-16 text-center">
          <Icon className={`w-12 h-12 mx-auto mb-8 text-[#4f46e5] ${status === 'loading' ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-5">{current.eyebrow}</p>
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter leading-tight mb-6" style={editorial}>
            {current.title}
          </h1>
          {current.msg && <p className="text-zinc-400 text-base md:text-lg mb-10 max-w-md mx-auto">{current.msg}</p>}

          {(status === 'success' || status === 'notFound' || status === 'idle') && (
            <div className="flex flex-wrap justify-center gap-3 pt-6 border-t border-[hsl(var(--rule))]">
              <Link to="/" className="inline-flex items-center gap-2 px-5 py-3 border border-[hsl(var(--rule))] text-[10px] font-black uppercase tracking-[0.3em] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-all">
                {t('Bosh sahifa', 'На главную', 'Home')}
              </Link>
              {status === 'success' && (
                <Link to="/subscribe" className="inline-flex items-center gap-2 px-5 py-3 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#4f46e5] hover:text-white transition-all">
                  {t('Qayta obuna', 'Подписаться снова', 'Re-subscribe')} <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-wrap justify-center gap-3 pt-6 border-t border-[hsl(var(--rule))]">
              <button onClick={handleUnsubscribe} className="inline-flex items-center gap-2 px-5 py-3 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#4f46e5] hover:text-white transition-all">
                {t('Qayta urinish', 'Повторить', 'Try again')}
              </button>
              <Link to="/" className="inline-flex items-center gap-2 px-5 py-3 border border-[hsl(var(--rule))] text-[10px] font-black uppercase tracking-[0.3em] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-all">
                {t('Bosh sahifa', 'На главную', 'Home')}
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Unsubscribe;
