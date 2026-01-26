import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';

export const Hero = () => {
  const { t, language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Title parts for iOS selection effect
  const getTitleParts = () => {
    if (language === 'uz') {
      return { highlighted: 'Digital Marketing', rest: 'va Shaxsiy Rivojlanish' };
    } else if (language === 'ru') {
      return { highlighted: 'Digital Marketing', rest: 'и Личное Развитие' };
    } else {
      return { highlighted: 'Digital Marketing', rest: '& Personal Development' };
    }
  };

  const titleParts = getTitleParts();


  return (
    <section className="relative min-h-[60vh] md:min-h-[80vh] flex flex-col overflow-hidden bg-background pt-12 md:pt-16">
      {/* Pro-code.uz inspired gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-[var(--gradient-hero)] dark:bg-gradient-to-br dark:from-background dark:via-[hsl(230_50%_8%)] dark:to-background" />
        
        {/* Glow orbs - pro-code style */}
        <div className="glow-orb -top-40 -left-40 w-[500px] h-[500px] bg-secondary/20 dark:bg-secondary/10" />
        <div className="glow-orb top-1/3 right-0 w-[400px] h-[400px] bg-primary/10 dark:bg-secondary/5" style={{ animationDelay: '1s' }} />
        <div className="glow-orb bottom-0 left-1/3 w-[300px] h-[300px] bg-secondary/15 dark:bg-secondary/8" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:opacity-30" />
      </div>

      {/* Main Hero Content */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className={`max-w-5xl mx-auto text-center space-y-4 md:space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* iOS Style Title with Selection Effect */}
            <h1 
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight px-2"
              id="main-heading"
            >
              {/* Highlighted part - iOS selection style with animation */}
              <span className="relative inline-block ios-selection-container">
                <span className="relative z-10 text-foreground">{titleParts.highlighted}</span>
                {/* iOS Selection highlight background - solid blue like real iOS */}
                <span 
                  className="absolute inset-0 -inset-x-1 rounded-sm ios-selection-bg"
                  style={{
                    background: 'hsl(217 91% 60% / 0.25)',
                  }}
                />
                {/* Shimmer effect overlay */}
                <span className="absolute inset-0 -inset-x-1 rounded-sm overflow-hidden">
                  <span className="absolute inset-0 ios-shimmer" />
                </span>
                {/* Left iOS Selection handle - dot on TOP, line going down */}
                <span className="absolute -left-2 -top-2 bottom-0 flex flex-col items-center">
                  <span className="w-4 h-4 md:w-5 md:h-5 bg-secondary rounded-full shadow-lg shadow-secondary/50 ios-dot-pulse flex-shrink-0" />
                  <span className="flex-1 w-[3px] bg-secondary ios-handle-pulse" />
                </span>
                {/* Right iOS Selection handle - line going down, dot on BOTTOM */}
                <span className="absolute -right-2 top-0 -bottom-2 flex flex-col items-center" style={{ animationDelay: '0.5s' }}>
                  <span className="flex-1 w-[3px] bg-secondary ios-handle-pulse" style={{ animationDelay: '0.5s' }} />
                  <span className="w-4 h-4 md:w-5 md:h-5 bg-secondary rounded-full shadow-lg shadow-secondary/50 ios-dot-pulse flex-shrink-0" style={{ animationDelay: '0.5s' }} />
                </span>
              </span>
              <br className="hidden sm:block" />
              <span className="text-foreground/80"> {titleParts.rest}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              {t.hero.subtitle}
            </p>

            {/* Pro-code style CTA Button */}
            <div className="flex justify-center items-center pt-2 md:pt-4">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-4 md:px-8 md:py-6 text-sm md:text-base font-semibold rounded-xl shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5 transition-all duration-300 group"
                asChild
              >
                <Link to="/blog">
                  {t.hero.cta}
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};