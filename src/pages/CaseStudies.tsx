import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, TrendingUp } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const CaseStudies = () => {
  const { language } = useLanguage();

  const { data: caseStudies, isLoading } = useQuery({
    queryKey: ['case-studies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('case_studies').select('*').eq('published', true).order('featured', { ascending: false }).order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const t = (uz: string, ru: string, en: string) => language === 'uz' ? uz : language === 'ru' ? ru : en;
  const getField = (item: any, field: string) => item[`${field}_${language}`] || item[`${field}_en`] || item[`${field}_uz`];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t('Case Studies — Real Natijalar', 'Кейсы — Реальные Результаты', 'Case Studies — Real Results')}
        description={t('Digital marketing xizmatlari bo\'yicha real natijalar va tajribalar', 'Реальные результаты и опыт в сфере цифрового маркетинга', 'Real results and experience in digital marketing services')}
        url="https://shohruxdigital.uz/case-studies"
      />
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 pt-16">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Briefcase className="w-8 h-8 text-primary" />
              {t('Case Studies', 'Кейсы', 'Case Studies')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('Real mijozlar, real natijalar', 'Реальные клиенты, реальные результаты', 'Real clients, real results')}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <div className="space-y-8">
              {caseStudies?.map((cs: any) => (
                <Card key={cs.id} className="overflow-hidden">
                  {cs.featured_image && (
                    <img src={cs.featured_image} alt={getField(cs, 'title')} className="w-full h-48 object-cover" />
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{cs.service_type}</Badge>
                      {cs.client_name && <span className="text-sm text-muted-foreground">{cs.client_name}</span>}
                      {cs.featured && <Badge className="bg-primary">Featured</Badge>}
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{getField(cs, 'title')}</h2>
                    <p className="text-muted-foreground mb-4">{getField(cs, 'description')}</p>

                    {getField(cs, 'challenge') && (
                      <div className="mb-4">
                        <h3 className="font-semibold mb-1">{t('Muammo', 'Проблема', 'Challenge')}</h3>
                        <p className="text-sm text-muted-foreground">{getField(cs, 'challenge')}</p>
                      </div>
                    )}
                    {getField(cs, 'solution') && (
                      <div className="mb-4">
                        <h3 className="font-semibold mb-1">{t('Yechim', 'Решение', 'Solution')}</h3>
                        <p className="text-sm text-muted-foreground">{getField(cs, 'solution')}</p>
                      </div>
                    )}
                    {getField(cs, 'results') && (
                      <div className="mb-4">
                        <h3 className="font-semibold mb-1 flex items-center gap-1"><TrendingUp className="w-4 h-4 text-primary" /> {t('Natijalar', 'Результаты', 'Results')}</h3>
                        <p className="text-sm text-muted-foreground">{getField(cs, 'results')}</p>
                      </div>
                    )}

                    {cs.metrics && Array.isArray(cs.metrics) && cs.metrics.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        {cs.metrics.map((m: any, i: number) => (
                          <div key={i} className="text-center p-3 rounded-lg bg-primary/5">
                            <div className="text-xl font-bold text-primary">{m.value}</div>
                            <div className="text-xs text-muted-foreground">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!caseStudies || caseStudies.length === 0) && (
                <div className="text-center py-16 text-muted-foreground">
                  {t('Tez orada case studylar qo\'shiladi', 'Скоро будут добавлены кейсы', 'Case studies coming soon')}
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

export default CaseStudies;
