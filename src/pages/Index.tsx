import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const NewsletterPopup = lazy(() => import('@/components/NewsletterPopup').then(m => ({ default: m.NewsletterPopup })));
const CTABanner = lazy(() => import('@/components/CTABanner').then(m => ({ default: m.CTABanner })));
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import HomeStructuredData from '@/components/HomeStructuredData';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLocalized } from '@/hooks/useLocalized';
import { Activity, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StravaSummary {
  recent_run_distance: number | null;
  all_run_distance: number | null;
}
interface StravaActivity {
  name: string; type: string; distance: number;
  moving_time: number; start_date_local: string;
}

const fmtKm = (m: number | null | undefined) => ((m || 0) / 1000).toFixed(1);
const fmtPace = (distance: number, time: number) => {
  if (!distance || !time) return '—';
  const paceSec = time / (distance / 1000);
  const min = Math.floor(paceSec / 60);
  const sec = Math.floor(paceSec % 60);
  return `${min}'${sec.toString().padStart(2, '0')}"/km`;
};

const Index = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const { getField } = useLocalized();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [summary, setSummary] = useState<StravaSummary | null>(null);
  const [lastActivity, setLastActivity] = useState<StravaActivity | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [postsRes, summaryRes, activityRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*, categories(name_uz, name_ru, name_en)')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(7),
        supabase.from('strava_summary').select('recent_run_distance, all_run_distance').maybeSingle(),
        supabase.from('strava_activities').select('name, type, distance, moving_time, start_date_local')
          .eq('type', 'Run').order('start_date', { ascending: false }).limit(1).maybeSingle(),
      ]);
      const list = postsRes.data || [];
      setPosts(list);
      setSummary(summaryRes.data as any);
      setLastActivity(activityRes.data as any);

      const lcp = list[0];
      if (lcp?.featured_image) {
        const link = document.createElement('link');
        link.rel = 'preload'; link.as = 'image';
        link.href = lcp.featured_image; (link as any).fetchPriority = 'high';
        document.head.appendChild(link);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const { error } = await supabase.from('subscribers').insert({ email, active: true });
    setSubmitting(false);
    if (error && !error.message.includes('duplicate')) {
      toast({ title: language === 'uz' ? 'Xato' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'uz' ? 'Obuna bo\'ldingiz' : language === 'ru' ? 'Подписка оформлена' : 'Subscribed', description: language === 'uz' ? 'Rahmat!' : language === 'ru' ? 'Спасибо!' : 'Thank you!' });
      setEmail('');
    }
  };

  const seoTitle = language === 'uz'
    ? 'ShohruxDigital — Digital Marketing, SEO va Shaxsiy Rivojlanish'
    : language === 'ru'
    ? 'ShohruxDigital — Цифровой Маркетинг, SEO и Личностное Развитие'
    : 'ShohruxDigital — Digital Marketing, SEO & Personal Performance';

  const seoDescription = language === 'uz'
    ? 'Shohruxbek Foziljonov — brendlarni o\'stiruvchi digital marketolog va uzoq masofa yuguruvchisi. Marketing strategiyasi, real raqamlar va chidamlilik mental modellari — bitta tahririyatda.'
    : language === 'ru'
    ? 'Шохрухбек Фозилжонов — digital-маркетолог, который растит бренды, и бегун на длинные дистанции. Стратегия, живые цифры и ментальные модели выносливости — в одной редакции.'
    : 'Shohruxbek Foziljonov — a digital marketer who grows brands and a long-distance runner who studies pace. Strategy, real numbers, and endurance mental models — under one masthead.';

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shohruxdigital.uz';
  const socialLinks = [
    settings.instagram_url, settings.telegram_url, settings.twitter_url,
    settings.youtube_url, settings.facebook_url, settings.linkedin_url,
  ].filter(Boolean) as string[];

  const featured = posts[0];
  const secondary = posts.slice(1, 4);
  const rest = posts.slice(4, 7);

  const heroTitle = language === 'uz'
    ? <>Digital <br/> Marketing <span className="text-zinc-700 italic font-light">va</span> <br/> Performance</>
    : language === 'ru'
    ? <>Digital <br/> Marketing <span className="text-zinc-700 italic font-light">и</span> <br/> Performance</>
    : <>Digital <br/> Marketing <span className="text-zinc-700 italic font-light">&</span> <br/> Performance</>;

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <SEOHead title={seoTitle} description={seoDescription} keywords={[]} url={siteUrl} type="website" image={`${siteUrl}/og-image.png`} siteName="ShohruxDigital" />
      <HomeStructuredData siteName="ShohruxDigital" siteUrl={siteUrl} description={seoDescription} socialLinks={socialLinks} />
      <Header />

      <main className="max-w-screen-2xl mx-auto">
        {/* HERO */}
        <section className="px-6 md:px-8 pt-16 md:pt-24 pb-12 md:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 border-b border-[hsl(var(--rule))]">
          <div className="lg:col-span-9">
            <p className="text-[#4f46e5] font-bold uppercase tracking-[0.4em] mb-6 text-[10px]">
              {language === 'uz' ? 'Strateg va chidamlilik atleti' : language === 'ru' ? 'Стратег и атлет на выносливость' : 'Strategist & Endurance Athlete'}
            </p>
            <h1 className="text-[clamp(3rem,10vw,8.5rem)] font-bold leading-[0.85] tracking-tighter uppercase mb-10 md:mb-12" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
              {heroTitle}
            </h1>
            <p className="max-w-xl text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
              {seoDescription}
            </p>
          </div>
          <div className="lg:col-span-3 flex flex-col justify-end">
            <Link to="/fitness" className="block border-t border-[hsl(var(--rule))] pt-8 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full border border-orange-500/50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Strava Live Feed</span>
                <ArrowUpRight className="w-4 h-4 ml-auto text-zinc-600 group-hover:text-[#4f46e5] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
                    {fmtKm(summary?.recent_run_distance)} KM
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                    {language === 'uz' ? 'So\'nggi 4 hafta yugurish' : language === 'ru' ? 'Бег за 4 недели' : 'Last 4 weeks running'}
                  </p>
                </div>
                {lastActivity && (
                  <div className="pt-4 border-t border-[hsl(var(--rule))]">
                    <p className="text-base font-medium text-[hsl(var(--paper))]">{lastActivity.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                      {fmtKm(lastActivity.distance)} km • {fmtPace(lastActivity.distance, lastActivity.moving_time)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-300">{fmtKm(summary?.all_run_distance)} km</p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                    {language === 'uz' ? 'Umumiy masofa' : language === 'ru' ? 'Общая дистанция' : 'All-time distance'}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* MAGAZINE GRID */}
        {featured && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-[hsl(var(--rule))]">
            <Link to={`/blog/${featured.slug}`} className="lg:col-span-8 bg-[hsl(var(--ink))] group cursor-pointer relative block">
              <div className="relative overflow-hidden aspect-[16/10]">
                <img
                  src={featured.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600'}
                  alt={getField(featured, 'title')}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--ink))] via-[hsl(var(--ink))]/40 to-transparent" />
              </div>
              <div className="p-6 md:p-10 lg:p-12 absolute bottom-0 left-0 w-full">
                <span className="inline-block px-3 py-1 bg-[#4f46e5] text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6">
                  {featured.categories ? getField(featured.categories, 'name') : (language === 'uz' ? 'Maqola' : 'Featured')}
                </span>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight uppercase max-w-3xl group-hover:underline decoration-[#4f46e5] underline-offset-8" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
                  {getField(featured, 'title')}
                </h2>
                <div className="mt-4 md:mt-6 flex gap-6 md:gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <span>{featured.reading_time || 5} {language === 'uz' ? 'Daq O\'qish' : language === 'ru' ? 'Мин Чтения' : 'Min Read'}</span>
                  {featured.published_at && (
                    <span>{new Date(featured.published_at).toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>
              </div>
            </Link>

            <div className="lg:col-span-4 grid grid-cols-1 bg-[hsl(var(--rule))] gap-px">
              {secondary.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="bg-[hsl(var(--ink))] p-8 lg:p-10 hover:bg-[hsl(var(--ink-2))] transition-colors group cursor-pointer block">
                  <p className="text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                    {post.categories ? getField(post.categories, 'name') : '—'}
                  </p>
                  <h3 className="text-xl lg:text-2xl font-bold uppercase tracking-tight mb-3 leading-tight group-hover:text-[hsl(var(--paper))]" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
                    {getField(post, 'title')}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-5 line-clamp-2">{getField(post, 'excerpt')}</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    {post.reading_time || 5} {language === 'uz' ? 'Daq O\'qish' : language === 'ru' ? 'Мин' : 'Min Read'}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ARCHIVE STRIP */}
        {rest.length > 0 && (
          <section className="px-6 md:px-8 py-16 md:py-24 border-t border-[hsl(var(--rule))]">
            <div className="flex items-end justify-between mb-10 md:mb-14">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
                {language === 'uz' ? 'Arxiv' : language === 'ru' ? 'Архив' : 'The Archive'}
              </h2>
              <Link to="/blog" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] hover:text-[hsl(var(--paper))] transition-colors flex items-center gap-2">
                {language === 'uz' ? 'Barchasi' : language === 'ru' ? 'Все' : 'View All'} <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[hsl(var(--rule))] border border-[hsl(var(--rule))]">
              {rest.map((post, i) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="bg-[hsl(var(--ink))] p-8 hover:bg-[hsl(var(--ink-2))] transition-colors group">
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                    №&nbsp;{String(i + 4).padStart(2, '0')}
                  </p>
                  <p className="text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                    {post.categories ? getField(post.categories, 'name') : '—'}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-4 leading-tight" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
                    {getField(post, 'title')}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">{getField(post, 'excerpt')}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FITNESS CTA STRIP */}
        <section className="px-6 md:px-8 py-12 md:py-16 border-t border-[hsl(var(--rule))] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Activity className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">
                {language === 'uz' ? 'Fitness sahifasi' : language === 'ru' ? 'Страница фитнеса' : 'Fitness page'}
              </p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight uppercase" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
                {language === 'uz' ? 'Marketing — bu marafon' : language === 'ru' ? 'Маркетинг — это марафон' : 'Marketing is a marathon'}
              </h3>
            </div>
          </div>
          <Link to="/fitness" className="px-6 py-3 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-widest hover:bg-[#4f46e5] hover:text-white transition-all flex items-center gap-2">
            {language === 'uz' ? 'Strava ko\'rsatkichlari' : language === 'ru' ? 'Метрики Strava' : 'View Strava metrics'} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </section>

        {/* NEWSLETTER */}
        <section className="px-6 md:px-8 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-16 border-t border-[hsl(var(--rule))]">
          <div className="lg:col-span-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4 md:mb-6" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
              {language === 'uz' ? <>The <span className="text-[#4f46e5]">Grit</span> Dispatch</> : language === 'ru' ? <>The <span className="text-[#4f46e5]">Grit</span> Dispatch</> : <>The <span className="text-[#4f46e5]">Grit</span> Dispatch</>}
            </h2>
            <p className="text-lg md:text-xl text-zinc-400">
              {language === 'uz' ? 'Bir email, bir g\'oya, bitta ishlatsa bo\'ladigan xulosa. Real kampaniyalardan olingan raqamlar va chidamlilik mental modellari — har yakshanba kechqurun, pochta qutingizda.' : language === 'ru' ? 'Одно письмо, одна идея, один применимый вывод. Цифры из живых кампаний и ментальные модели выносливости — каждое воскресенье вечером в вашем ящике.' : 'One email, one idea, one takeaway you can use on Monday. Numbers from live campaigns and endurance mental models — every Sunday evening, in your inbox.'}
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="lg:col-span-6 w-full">
            <div className="flex border-b border-[hsl(var(--rule))] focus-within:border-[#4f46e5] transition-colors">
              <input
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-transparent w-full py-5 md:py-6 text-lg md:text-xl focus:outline-none placeholder:text-zinc-800 text-[hsl(var(--paper))]"
              />
              <button type="submit" disabled={submitting} className="px-6 md:px-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] hover:text-[hsl(var(--paper))] transition-colors disabled:opacity-50">
                {submitting ? '...' : (language === 'uz' ? 'Obuna' : language === 'ru' ? 'Подписаться' : 'Subscribe')}
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-4 uppercase tracking-widest">
              {language === 'uz' ? 'Spam yo\'q. Istalgan vaqt bekor qilish' : language === 'ru' ? 'Без спама. Отписка в любой момент' : 'Zero spam. Opt-out anytime.'}
            </p>
          </form>
        </section>

        <Suspense fallback={null}><CTABanner /></Suspense>
      </main>

      <Suspense fallback={null}><NewsletterPopup /></Suspense>
      <Footer />
    </div>
  );
};

export default Index;
