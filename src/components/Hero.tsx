import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import heroImage from '@/assets/hero-illustration.png';

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden bg-background pt-16">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Left - Text Content */}
          <div className="space-y-4 md:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-secondary text-secondary-foreground text-xs md:text-sm font-medium">
              <span>Professional Blog Platform</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight" id="main-heading">
              {t.hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-medium rounded-full group w-full sm:w-auto"
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
                className="border border-border px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-medium rounded-full hover:bg-muted w-full sm:w-auto"
                asChild
              >
                <Link to="/about">{t.nav.about}</Link>
              </Button>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="relative flex justify-center lg:justify-end mt-4 md:mt-0">
            <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-xl">
              <img 
                src={heroImage} 
                alt="Digital Marketing Illustration" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
