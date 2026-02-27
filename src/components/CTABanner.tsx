import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const CTABanner = () => {
  const { language } = useLanguage();

  const content = {
    uz: {
      title: 'Digital marketing bo\'yicha darslar va Promptlar',
      button: 'MPBS.uz →',
    },
    ru: {
      title: 'Уроки и промпты по Digital маркетингу',
      button: 'MPBS.uz →',
    },
    en: {
      title: 'Digital Marketing Lessons & Prompts',
      button: 'MPBS.uz →',
    },
  };

  const t = content[language];

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <a
          href="https://mpbs.uz/?utm_source=shohruxdigital&utm_medium=cta_banner&utm_campaign=blog_referral"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between gap-4 rounded-xl border border-secondary/30 bg-secondary/5 px-5 py-3.5 transition-all duration-300 hover:border-secondary/60 hover:bg-secondary/10 hover:shadow-md hover:shadow-secondary/10"
        >
          <span className="text-sm md:text-base font-medium text-foreground">
            {t.title}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-secondary whitespace-nowrap group-hover:gap-2 transition-all duration-300">
            {t.button}
          </span>
        </a>
      </div>
    </section>
  );
};
