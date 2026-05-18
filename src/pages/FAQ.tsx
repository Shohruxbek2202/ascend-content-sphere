import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublicPageHero } from '@/components/PublicPageHero';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

const SERVICE_LABELS: Record<string, { uz: string; ru: string; en: string }> = {
  general: { uz: 'Umumiy', ru: 'Общие', en: 'General' },
  smm: { uz: 'SMM', ru: 'SMM', en: 'SMM' },
  seo: { uz: 'SEO', ru: 'SEO', en: 'SEO' },
  'google-ads': { uz: 'Google Ads', ru: 'Google Ads', en: 'Google Ads' },
  'facebook-ads': { uz: 'Facebook Ads', ru: 'Facebook Ads', en: 'Facebook Ads' },
  'content-marketing': { uz: 'Content Marketing', ru: 'Контент маркетинг', en: 'Content Marketing' },
  'personal-development': { uz: 'Shaxsiy Rivojlanish', ru: 'Личное развитие', en: 'Personal Development' },
  'digital-marketing': { uz: 'Digital Marketing', ru: 'Цифровой маркетинг', en: 'Digital Marketing' },
};

const FAQ = () => {
  const { language } = useLanguage();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['public-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs').select('*').eq('published', true)
        .order('service_category').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const t = (uz: string, ru: string, en: string) => (language === 'uz' ? uz : language === 'ru' ? ru : en);
  const getField = (item: any, field: string) =>
    item[`${field}_${language}`] || item[`${field}_en`] || item[`${field}_uz`];

  const grouped = faqs?.reduce((acc: Record<string, any[]>, faq) => {
    const cat = faq.service_category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {}) || {};

  useEffect(() => {
    if (!faqs || faqs.length === 0) return;
    const faqSchema = {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question', name: getField(faq, 'question'),
        acceptedAnswer: { '@type': 'Answer', text: getField(faq, 'answer') },
      })),
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-type', 'faq-page');
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);
    return () => {
      const el = document.querySelector('script[data-type="faq-page"]');
      if (el) el.remove();
    };
  }, [faqs, language]);

  return (
    <div
      className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <SEOHead
        title={t('Savollar — FAQ', 'Вопросы — FAQ', 'Questions — FAQ')}
        description={t(
          'Tez-tez beriladigan savollarga aniq, qisqa javoblar — strategiya, narx, vaqt va hamkorlik.',
          'Прямые ответы на частые вопросы — стратегия, бюджеты, сроки и сотрудничество.',
          'Direct answers to frequent questions — strategy, pricing, timelines and partnerships.'
        )}
        url="https://shohruxdigital.uz/faq"
      />
      <BreadcrumbJsonLd items={[{ name: 'FAQ', url: '/faq' }]} />
      <Header />

      <main className="max-w-screen-2xl mx-auto">
        <PublicPageHero
          eyebrow={t('Savol-javob jurnali', 'Раздел вопросов', 'Q&A Index')}
          title={
            <>
              {t('Savollar', 'Вопросы', 'Questions')} <br />
              <span className="italic font-light text-zinc-500">&amp; {t('Javoblar', 'Ответы', 'Answers')}</span>
            </>
          }
          meta={`${faqs?.length || 0} ${t('yozuv', 'записей', 'entries')}`}
          lede={t(
            'Pochtaga eng ko\'p tushadigan savollar — yig\'ib, qisqartirib, javob bilan birga.',
            'Самые частые вопросы из почты — собраны, сжаты и снабжены ответами.',
            'The most frequent inbox questions — collected, compressed, answered.'
          )}
        />

        <section className="px-6 md:px-8 py-16 md:py-20">
          {isLoading ? (
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              <span className="w-2 h-2 bg-[#4f46e5] animate-pulse" />
              {t('Yuklanmoqda', 'Загрузка', 'Loading')}
            </div>
          ) : !faqs || faqs.length === 0 ? (
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              {t('Hozircha savol yo\'q', 'Пока нет вопросов', 'No questions yet')}
            </p>
          ) : (
            <div className="space-y-16 md:space-y-20">
              {Object.entries(grouped).map(([category, items], catIdx) => (
                <section key={category}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-8">
                    <div className="lg:col-span-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
                        §&nbsp;{String(catIdx + 1).padStart(2, '0')}
                      </p>
                      <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tighter leading-tight" style={editorial}>
                        {SERVICE_LABELS[category]?.[language] || category}
                      </h2>
                      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5]">
                        {String(items.length).padStart(2, '0')} {t('savol', 'вопросов', 'questions')}
                      </p>
                    </div>
                    <div className="lg:col-span-9">
                      <Accordion type="multiple" className="border-t border-[hsl(var(--rule))]">
                        {items.map((faq: any, idx: number) => (
                          <AccordionItem key={faq.id} value={faq.id} className="border-b border-[hsl(var(--rule))] last:border-b">
                            <AccordionTrigger className="text-left hover:no-underline py-6 group">
                              <div className="flex items-start gap-6 pr-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1.5 shrink-0">
                                  Q.{String(idx + 1).padStart(2, '0')}
                                </span>
                                <span className="text-lg md:text-2xl font-bold uppercase tracking-tight leading-tight text-[hsl(var(--paper))] group-hover:text-[#4f46e5] transition-colors" style={editorial}>
                                  {getField(faq, 'question')}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-8 text-base md:text-lg text-zinc-400 leading-relaxed pl-[5.5rem] max-w-3xl">
                              {getField(faq, 'answer')}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
