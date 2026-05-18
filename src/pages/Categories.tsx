import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Search, FileText, Share2, Users, Tag, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublicPageHero } from '@/components/PublicPageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const iconMap: Record<string, any> = { TrendingUp, Search, FileText, Share2, Users, Tag };
const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

interface Category {
  id: string; slug: string;
  name_uz: string; name_ru: string; name_en: string;
  description_uz: string | null; description_ru: string | null; description_en: string | null;
  icon: string | null; color: string | null; post_count?: number;
}

const Categories = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const { data } = await supabase.from('categories').select('*');
      if (data) {
        const withCounts = await Promise.all(
          data.map(async (c) => {
            const { count } = await supabase
              .from('posts')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', c.id)
              .eq('published', true);
            return { ...c, post_count: count || 0 };
          })
        );
        setCategories(withCounts);
      }
      setIsLoading(false);
    };
    fetch();
  }, []);

  const t = (uz: string, ru: string, en: string) => (language === 'uz' ? uz : language === 'ru' ? ru : en);
  const getName = (c: Category) => (language === 'ru' ? c.name_ru : language === 'en' ? c.name_en : c.name_uz);
  const getDesc = (c: Category) => (language === 'ru' ? c.description_ru : language === 'en' ? c.description_en : c.description_uz) || '';

  return (
    <div
      className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <SEOHead
        title={t('Yo\'nalishlar | ShohruxDigital', 'Разделы | ShohruxDigital', 'Sections | ShohruxDigital')}
        description={t(
          'Marketing strategiyasi, SEO, SMM va chidamlilik yo\'nalishlari bo\'yicha jurnalning bo\'limlari.',
          'Разделы журнала: маркетинговая стратегия, SEO, SMM и выносливость.',
          'Sections of the journal: strategy, SEO, SMM and endurance.'
        )}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />
      <BreadcrumbJsonLd items={[{ name: t('Yo\'nalishlar', 'Разделы', 'Sections'), url: '/categories' }]} />
      <Header />

      <main className="max-w-screen-2xl mx-auto">
        <PublicPageHero
          eyebrow={t('Mundarija', 'Содержание', 'Table of Contents')}
          title={<>{t('Yo\'nalishlar', 'Разделы', 'Sections')}</>}
          meta={`${categories.length} ${t('bo\'lim', 'разделов', 'sections')}`}
          lede={t(
            'Jurnal qaysi mavzular atrofida quriladi — strategiya, ma\'lumotlar, brending va chidamlilik.',
            'Темы, вокруг которых строится журнал — стратегия, данные, брендинг и выносливость.',
            'The themes the journal is built around — strategy, data, brand and endurance.'
          )}
        />

        <section className="px-6 md:px-8 py-12 md:py-16">
          {isLoading ? (
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              <span className="w-2 h-2 bg-[#4f46e5] animate-pulse" />
              {t('Yuklanmoqda', 'Загрузка', 'Loading')}
            </div>
          ) : (
            <div className="border-t border-l border-[hsl(var(--rule))]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((c, i) => {
                  const Icon = iconMap[c.icon || 'Tag'] || Tag;
                  return (
                    <Link
                      key={c.id}
                      to={`/blog?category=${c.slug}`}
                      className="group p-8 md:p-10 border-b border-r border-[hsl(var(--rule))] hover:bg-[hsl(var(--ink-2))] transition-colors flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                          §&nbsp;{String(i + 1).padStart(2, '0')}
                        </p>
                        <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-[#4f46e5] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <Icon className="w-7 h-7 text-[#4f46e5] mb-6" strokeWidth={1.5} />

                      <h3
                        className="text-2xl md:text-3xl font-bold uppercase tracking-tight leading-tight mb-3 group-hover:text-[#4f46e5] transition-colors"
                        style={editorial}
                      >
                        {getName(c)}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-8 line-clamp-3 flex-1">
                        {getDesc(c)}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-[hsl(var(--rule))]">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                          {c.post_count}{' '}
                          {t('ta yozuv', 'записей', 'entries')}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5]">
                          {t('Ko\'rish', 'Открыть', 'Browse')}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
