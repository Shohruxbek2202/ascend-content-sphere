import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            <span>Professional Blog Platform</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight" id="main-heading">
            {t.hero.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-medium rounded-full group"
              asChild
            >
              <Link to="/blog">
                {t.hero.cta}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border border-border px-8 py-6 text-base font-medium rounded-full hover:bg-muted"
              asChild
            >
              <Link to="/about">{t.nav.about}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
