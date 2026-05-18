import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublicPageHero } from '@/components/PublicPageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

const Subscribe = () => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const t = (uz: string, ru: string, en: string) => (language === 'uz' ? uz : language === 'ru' ? ru : en);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.from('subscribers').insert({ email, language });
      if (error) {
        if (error.code === '23505') {
          toast.error(t('Bu email allaqachon obuna', 'Этот email уже подписан', 'This email is already subscribed'));
        } else {
          toast.error(t('Xatolik yuz berdi', 'Произошла ошибка', 'An error occurred'));
        }
      } else {
        setIsSubscribed(true);
      }
    } catch {
      toast.error(t('Xatolik yuz berdi', 'Произошла ошибка', 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    t('Yangi yozuvlar — birinchi qo\'lda', 'Новые записи — из первых рук', 'New entries — first hand'),
    t('Faqat obunachilar uchun maydon yozuvlari', 'Полевые заметки только для подписчиков', 'Field notes for subscribers only'),
    t('Hafta yakuni — 5 ta tanlangan o\'qish', 'Итоги недели — 5 избранных материалов', 'Weekly digest — 5 curated reads'),
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <SEOHead
        title={t('Obuna | The Grit Dispatch', 'Подписка | The Grit Dispatch', 'Subscribe | The Grit Dispatch')}
        description={t('Haftalik dispatch — marketing, ma\'lumotlar va chidamlilik haqida.', 'Еженедельный дайджест — маркетинг, данные и выносливость.', 'Weekly dispatch — marketing, data, endurance.')}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />
      <BreadcrumbJsonLd items={[{ name: t('Obuna', 'Подписка', 'Subscribe'), url: '/subscribe' }]} />
      <Header />

      <main className="max-w-screen-2xl mx-auto">
        <PublicPageHero
          eyebrow={t('Haftalik dispatch', 'Еженедельный выпуск', 'Weekly Dispatch')}
          title={<>The <span className="text-[#4f46e5]">Grit</span> <br /> Dispatch</>}
          meta={t('Har yakshanba', 'Каждое воскресенье', 'Every Sunday')}
          lede={t('Ortiqcha gap yo\'q. Faqat xom ma\'lumot, mental modellar va o\'sha hafta nima ishlagani.', 'Без воды. Только сырые данные, ментальные модели и что сработало за неделю.', 'No fluff. Just raw data, mental models, and what shipped this week.')}
        />

        <section className="px-6 md:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-6">
              {t('Obuna nima beradi', 'Что вы получите', 'What you get')}
            </p>
            <ul className="space-y-6 border-t border-[hsl(var(--rule))] pt-8">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-5 pb-6 border-b border-[hsl(var(--rule))] last:border-b-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1.5 shrink-0">
                    №{String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xl md:text-2xl font-bold uppercase tracking-tight leading-tight" style={editorial}>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            {isSubscribed ? (
              <div className="border border-[hsl(var(--rule))] p-10 md:p-14 text-center">
                <CheckCircle className="w-12 h-12 text-[#4f46e5] mx-auto mb-6" strokeWidth={1.5} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-4">
                  {t('Tasdiqlandi', 'Подтверждено', 'Confirmed')}
                </p>
                <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter leading-tight mb-6" style={editorial}>
                  {t('Birinchi son — yakshanbada', 'Первый выпуск — в воскресенье', 'First issue — Sunday')}
                </h2>
                <p className="text-zinc-400 text-lg">
                  {t('Pochtangizni tasdiqlash xati uchun tekshirib turing.', 'Проверьте почту — придёт письмо подтверждения.', 'Check your inbox for the confirmation letter.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-[hsl(var(--rule))] p-8 md:p-12">
                <div className="flex items-baseline justify-between mb-10 pb-6 border-b border-[hsl(var(--rule))]">
                  <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight" style={editorial}>
                    {t('Ro\'yxatdan o\'tish', 'Регистрация', 'Sign-up')}
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Form / 02</span>
                </div>

                <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-3">
                  {t('Email manzili', 'Email', 'Email address')}
                </label>
                <input
                  id="email" type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-transparent border-b border-[hsl(var(--rule))] focus:border-[#4f46e5] py-4 text-xl md:text-2xl text-[hsl(var(--paper))] focus:outline-none placeholder:text-zinc-700 transition-colors"
                />

                <div className="mt-10 pt-6 border-t border-[hsl(var(--rule))] flex items-center justify-between gap-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 max-w-[14rem]">
                    {t('Spam yo\'q. Istalgan vaqt bekor qilish.', 'Без спама. Отписка в любой момент.', 'Zero spam. Opt-out anytime.')}
                  </p>
                  <button type="submit" disabled={isLoading}
                    className="inline-flex items-center gap-2 px-6 py-4 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#4f46e5] hover:text-white transition-all disabled:opacity-50">
                    {isLoading ? t('Yuborilmoqda', 'Отправка', 'Sending') : t('Obuna', 'Подписаться', 'Subscribe')}
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Subscribe;
