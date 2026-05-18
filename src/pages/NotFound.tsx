import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArrowUpRight } from 'lucide-react';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    document.title = language === 'uz' ? 'Sahifa topilmadi | ShohruxDigital'
      : language === 'ru' ? 'Страница не найдена | ShohruxDigital'
      : 'Page Not Found | ShohruxDigital';

    return () => {
      robotsMeta?.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    };
  }, [location.pathname, language]);

  const t = (uz: string, ru: string, en: string) =>
    language === 'uz' ? uz : language === 'ru' ? ru : en;

  return (
    <div
      className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white flex flex-col"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <Header />
      <main className="flex-1 flex items-center">
        <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center border-y border-[hsl(var(--rule))] py-16 md:py-24">
            <div className="lg:col-span-7">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-6" style={editorial}>
                {t('Xatolik kodi · 404', 'Код ошибки · 404', 'Error Code · 404')}
              </p>
              <h1
                className="text-[18vw] lg:text-[14rem] font-bold uppercase tracking-tighter leading-[0.85] mb-8"
                style={editorial}
              >
                404
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-[0.95] mb-6" style={editorial}>
                {t(
                  'Bu sahifa arxivda yo\'q.',
                  'Этой страницы нет в архиве.',
                  'This page is not in the archive.'
                )}
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-xl mb-10">
                {t(
                  'Manzil noto\'g\'ri, sahifa ko\'chirilgan yoki yozilmagan bo\'lishi mumkin. Asosiy sahifaga qayting yoki to\'g\'ridan-to\'g\'ri jurnalga o\'ting.',
                  'Адрес неверный, страница перенесена или ещё не написана. Вернитесь на главную или перейдите прямо в журнал.',
                  'The URL is wrong, the page moved, or it was never written. Head back home or go straight to the journal.'
                )}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 bg-[#4f46e5] text-white px-6 py-3 font-bold uppercase tracking-wider text-xs hover:bg-[#3d34d1] transition-colors"
                  style={editorial}
                >
                  {t('Bosh sahifa', 'Главная', 'Homepage')}
                  <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                </Link>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-3 border border-[hsl(var(--rule))] px-6 py-3 font-bold uppercase tracking-wider text-xs hover:border-[#4f46e5] hover:text-[#4f46e5] transition-colors"
                  style={editorial}
                >
                  {t('Jurnalni o\'qish', 'В журнал', 'Browse Journal')}
                  <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 lg:border-l border-[hsl(var(--rule))] lg:pl-12">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">
                {t('So\'ralgan manzil', 'Запрошенный адрес', 'Requested URL')}
              </p>
              <p className="font-mono text-sm text-zinc-300 break-all border-l-2 border-[#4f46e5] pl-4">
                {location.pathname}
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 mt-10">
                {t('Tahririyat eslatmasi', 'От редакции', 'Editor\'s Note')}
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed italic">
                {t(
                  '"Yo\'qolish — yo\'lning bir qismi. Kompasni qo\'lda ushlab oling."',
                  '«Заблудиться — часть пути. Просто держите компас в руках.»',
                  '"Getting lost is part of the route. Just keep the compass in hand."'
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
