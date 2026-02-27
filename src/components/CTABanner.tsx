import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const CTABanner = () => {
  const { language } = useLanguage();

  const content = {
    uz: {
      title: 'Digital marketing bo\'yicha darslar va Promptlar',
      button: 'MPBS.uz',
    },
    ru: {
      title: 'Уроки и промпты по Digital маркетингу',
      button: 'MPBS.uz',
    },
    en: {
      title: 'Digital Marketing Lessons & Prompts',
      button: 'MPBS.uz',
    },
  };

  const t = content[language];

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-5 py-4">
          <p className="text-sm md:text-base font-medium text-foreground text-center sm:text-left">
            {t.title}
          </p>
          <a
            href="https://mpbs.uz/?utm_source=shohruxdigital&utm_medium=cta_banner&utm_campaign=blog_referral"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors whitespace-nowrap"
          >
            {t.button}
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
