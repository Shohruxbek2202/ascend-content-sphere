import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { DinoRunner } from '@/components/DinoRunner';

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-10" />
      
      {/* Animated circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light/20 border border-primary/20 text-primary text-sm font-medium animate-slide-up">
            <TrendingUp className="w-4 h-4" />
            <span>Professional Blog Platform</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight animate-slide-up delay-100">
            {t.hero.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-slide-up delay-200">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up delay-300">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg text-white group"
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
              className="border-2"
              asChild
            >
              <Link to="/subscribe">{t.hero.subscribe}</Link>
            </Button>
          </div>

          {/* Animated Dino Runner */}
          <div className="flex justify-center pt-8 animate-fade-in delay-500">
            <DinoRunner />
          </div>
        </div>
      </div>
    </section>
  );
};
