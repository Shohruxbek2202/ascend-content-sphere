import { ExternalLink, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const CTABanner = () => {
  const { language } = useLanguage();

  const content = {
    uz: {
      badge: 'Tavsiya',
      title: 'Digital Mutaxassislar uchun Promptlar',
      subtitle: 'AI bilan ishlash uchun tayyor promptlar to\'plami. Marketologlar, dizaynerlar va kontent yaratuvchilar uchun.',
      button: 'MPBS.uz ga o\'tish',
    },
    ru: {
      badge: 'Рекомендация',
      title: 'Промпты для Digital Специалистов',
      subtitle: 'Готовые промпты для работы с AI. Для маркетологов, дизайнеров и создателей контента.',
      button: 'Перейти на MPBS.uz',
    },
    en: {
      badge: 'Recommended',
      title: 'Prompts for Digital Specialists',
      subtitle: 'Ready-to-use prompts for AI. For marketers, designers, and content creators.',
      button: 'Visit MPBS.uz',
    },
  };

  const t = content[language];

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 border border-secondary/20">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary/20 flex items-center justify-center">
                <Zap className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium mb-3">
                <Sparkles className="w-3 h-3" />
                {t.badge}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {t.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base max-w-lg">
                {t.subtitle}
              </p>
            </div>

            {/* Button */}
            <div className="flex-shrink-0">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-6 py-6 rounded-xl shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300 group"
                asChild
              >
                <a 
                  href="https://mpbs.uz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  {t.button}
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
