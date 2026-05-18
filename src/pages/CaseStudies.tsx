import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublicPageHero } from '@/components/PublicPageHero';
import { ArrowUpRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

const CaseStudies = () => {
  const { language } = useLanguage();

  const { data: caseStudies, isLoading } = useQuery({
    queryKey: ['case-studies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const t = (uz: string, ru: string, en: string) => (language === 'uz' ? uz : language === 'ru' ? ru : en);
  const getField = (item: any, field: string) =>
    item[`${field}_${language}`] || item[`${field}_en`] || item[`${field}_uz`];

  return (
    <div
      className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <SEOHead
        title={t('Field Reports — Real Natijalar', 'Полевые отчёты — Реальные результаты', 'Field Reports — Real Results')}
        description={t(
          'Marketing kampaniyalari, eksperimentlar va o\'lchanadigan natijalar bo\'yicha amaliy hisobotlar.',
          'Прикладные отчёты о маркетинговых кампаниях, экспериментах и измеримых результатах.',
          'Field reports on marketing campaigns, experiments, and measurable outcomes.'
        )}
        url="https://shohruxdigital.uz/case-studies"
      />
      <BreadcrumbJsonLd items={[{ name: t('Field Reports', 'Полевые отчёты', 'Field Reports'), url: '/case-studies' }]} />
      <Header />

      <main className="max-w-screen-2xl mx-auto">
        <PublicPageHero
          eyebrow={t('Vol. 02 — Maydon hisobotlari', 'Том 02 — Полевые отчёты', 'Vol. 02 — Field Reports')}
          title={
            <>
              Field <br />
              <span className="italic font-light text-zinc-500">Reports</span>
            </>
          }
          meta={t('So\'nggi yangilangan', 'Обновлено', 'Last updated')}
          lede={t(
            'Real kampaniyalar, o\'lchanadigan natijalar va sahnaga ko\'tarilgan dars­lar. Reklama emas — yozib qo\'yilgan dalillar.',
            'Реальные кампании, измеримые результаты и вынесенные уроки. Не реклама — задокументированные доказательства.',
            'Real campaigns, measurable results, and lessons taken to the floor. Not marketing — documented evidence.'
          )}
        />

        <section className="px-6 md:px-8 py-16 md:py-20">
          {isLoading ? (
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              <span className="w-2 h-2 bg-[#4f46e5] animate-pulse" />
              {t('Yuklanmoqda', 'Загрузка', 'Loading')}
            </div>
          ) : !caseStudies || caseStudies.length === 0 ? (
            <div className="border border-[hsl(var(--rule))] py-24 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">
                {t('Arxiv tayyorlanmoqda', 'Архив готовится', 'Archive in production')}
              </p>
              <p className="text-2xl md:text-3xl font-bold uppercase tracking-tight" style={editorial}>
                {t('Birinchi hisobot tez orada', 'Первый отчёт скоро', 'First report coming soon')}
              </p>
            </div>
          ) : (
            <div className="border-t border-[hsl(var(--rule))]">
              {caseStudies.map((cs: any, i: number) => (
                <article
                  key={cs.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-12 md:py-16 border-b border-[hsl(var(--rule))] group"
                >
                  {/* Index column */}
                  <div className="lg:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                      №&nbsp;{String(i + 1).padStart(2, '0')}
                    </p>
                    {cs.featured && (
                      <span className="inline-block mt-3 px-2 py-1 bg-[#4f46e5] text-white text-[9px] font-black uppercase tracking-widest">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="lg:col-span-7">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      {cs.service_type && (
                        <span className="text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.3em]">
                          {cs.service_type}
                        </span>
                      )}
                      {cs.client_name && (
                        <>
                          <span className="text-zinc-600">·</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            {cs.client_name}
                          </span>
                        </>
                      )}
                    </div>
                    <h2
                      className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-[0.95] mb-6"
                      style={editorial}
                    >
                      {getField(cs, 'title')}
                    </h2>
                    <p className="text-base md:text-lg text-zinc-400 leading-relaxed mb-8 max-w-2xl">
                      {getField(cs, 'description')}
                    </p>

                    {(getField(cs, 'challenge') || getField(cs, 'solution') || getField(cs, 'results')) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-[hsl(var(--rule))] pt-6">
                        {getField(cs, 'challenge') && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-3">
                              {t('Muammo', 'Проблема', 'Challenge')}
                            </p>
                            <p className="text-sm text-zinc-400 leading-relaxed">{getField(cs, 'challenge')}</p>
                          </div>
                        )}
                        {getField(cs, 'solution') && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-3">
                              {t('Yondashuv', 'Подход', 'Approach')}
                            </p>
                            <p className="text-sm text-zinc-400 leading-relaxed">{getField(cs, 'solution')}</p>
                          </div>
                        )}
                        {getField(cs, 'results') && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-3">
                              {t('Natija', 'Результат', 'Outcome')}
                            </p>
                            <p className="text-sm text-zinc-400 leading-relaxed">{getField(cs, 'results')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="lg:col-span-3">
                    {cs.metrics && Array.isArray(cs.metrics) && cs.metrics.length > 0 ? (
                      <div className="border border-[hsl(var(--rule))] divide-y divide-[hsl(var(--rule))]">
                        {cs.metrics.slice(0, 4).map((m: any, idx: number) => (
                          <div key={idx} className="px-5 py-4 flex items-baseline justify-between gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                              {m.label}
                            </span>
                            <span className="text-xl md:text-2xl font-bold text-[#4f46e5]" style={editorial}>
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      cs.featured_image && (
                        <div className="aspect-[4/5] overflow-hidden">
                          <img
                            src={cs.featured_image}
                            alt={getField(cs, 'title')}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                          />
                        </div>
                      )
                    )}
                    <a
                      href="#"
                      className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] hover:text-[hsl(var(--paper))] transition-colors"
                    >
                      {t('To\'liq hisobot', 'Полный отчёт', 'Read full report')} <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CaseStudies;
