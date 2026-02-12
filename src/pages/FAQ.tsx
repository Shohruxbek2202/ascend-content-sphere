import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

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
        .from('faqs')
        .select('*')
        .eq('published', true)
        .order('service_category')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const t = (uz: string, ru: string, en: string) =>
    language === 'uz' ? uz : language === 'ru' ? ru : en;

  const getField = (item: any, field: string) =>
    item[`${field}_${language}`] || item[`${field}_en`] || item[`${field}_uz`];

  // Group FAQs by category
  const grouped = faqs?.reduce((acc: Record<string, any[]>, faq) => {
    const cat = faq.service_category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {}) || {};

  // FAQPage JSON-LD schema
  const faqSchema = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: getField(faq, 'question'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: getField(faq, 'answer'),
      },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t('Ko\'p beriladigan savollar — FAQ', 'Часто задаваемые вопросы — FAQ', 'Frequently Asked Questions — FAQ')}
        description={t(
          'Digital marketing xizmatlari haqida ko\'p beriladigan savollar va javoblar',
          'Часто задаваемые вопросы и ответы о услугах цифрового маркетинга',
          'Frequently asked questions and answers about digital marketing services'
        )}
        url="https://shohruxdigital.uz/faq"
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 pt-16">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-primary" />
              {t('Ko\'p beriladigan savollar', 'Часто задаваемые вопросы', 'Frequently Asked Questions')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t(
                'Xizmatlarimiz haqida eng ko\'p beriladigan savollar',
                'Самые популярные вопросы о наших услугах',
                'Most popular questions about our services'
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([category, items]) => (
                <section key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {SERVICE_LABELS[category]?.[language] || category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({items.length})</span>
                  </div>
                  <Accordion type="multiple" className="space-y-2">
                    {items.map((faq: any) => (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                        className="border rounded-lg px-4 bg-card"
                      >
                        <AccordionTrigger className="text-left font-medium hover:no-underline">
                          {getField(faq, 'question')}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {getField(faq, 'answer')}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))}
              {(!faqs || faqs.length === 0) && (
                <div className="text-center py-16 text-muted-foreground">
                  {t('Tez orada savollar qo\'shiladi', 'Скоро будут добавлены вопросы', 'Questions coming soon')}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
