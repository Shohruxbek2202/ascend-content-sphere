import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const Hero = () => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({ posts: 0, subscribers: 0, categories: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsRes, subscribersRes, categoriesRes] = await Promise.all([
          supabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', true),
          supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('active', true),
          supabase.from('categories').select('id', { count: 'exact', head: true })
        ]);
        
        setStats({
          posts: postsRes.count || 0,
          subscribers: subscribersRes.count || 0,
          categories: categoriesRes.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
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

  const statItems = [
    { icon: BookOpen, value: stats.posts, label: t.hero.stats?.posts || "Maqolalar" },
    { icon: FolderOpen, value: stats.categories, label: t.hero.stats?.categories || "Kategoriyalar" },
    { icon: Users, value: stats.subscribers, label: t.hero.stats?.subscribers || "Obunachilar" },
  ];

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
            
            {/* Professional badge - no emoji */}
            <div className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-secondary/10 border border-secondary/20 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs md:text-sm font-medium text-foreground/90">Professional Blog Platform</span>
            </div>

            {/* iOS Style Title with Selection Effect */}
            <h1 
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight px-2"
              id="main-heading"
            >
              {/* Highlighted part - iOS selection style with animation */}
              <span className="relative inline-block ios-selection-container">
                <span className="relative z-10 text-foreground">{titleParts.highlighted}</span>
                {/* iOS Selection highlight background with shimmer */}
                <span 
                  className="absolute inset-0 -inset-x-3 -inset-y-1 rounded-lg ios-selection-bg"
                  style={{
                    background: 'linear-gradient(135deg, hsl(217 91% 60% / 0.12) 0%, hsl(217 91% 60% / 0.25) 50%, hsl(217 91% 60% / 0.12) 100%)',
                  }}
                />
                {/* Shimmer effect overlay */}
                <span className="absolute inset-0 -inset-x-3 -inset-y-1 rounded-lg overflow-hidden">
                  <span className="absolute inset-0 ios-shimmer" />
                </span>
                {/* iOS Selection handles with pulse */}
                <span className="absolute -left-1.5 top-0 bottom-0 w-[3px] bg-secondary rounded-full ios-handle-pulse" />
                <span className="absolute -right-1.5 top-0 bottom-0 w-[3px] bg-secondary rounded-full ios-handle-pulse" style={{ animationDelay: '0.5s' }} />
                {/* iOS Selection dots with glow */}
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-secondary rounded-full shadow-lg shadow-secondary/50 ios-dot-pulse" />
                <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-secondary rounded-full shadow-lg shadow-secondary/50 ios-dot-pulse" style={{ animationDelay: '0.5s' }} />
              </span>
              <br className="hidden sm:block" />
              <span className="text-foreground/80"> {titleParts.rest}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              {t.hero.subtitle}
            </p>

            {/* Pro-code style CTA Buttons - no emoji */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-2 md:pt-4">
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
              
              <Button
                size="lg"
                variant="outline"
                className="px-6 py-4 md:px-8 md:py-6 text-sm md:text-base font-semibold rounded-xl border-border/50 hover:bg-accent/50 transition-all duration-300"
                asChild
              >
                <Link to="/about">
                  {t.nav.about}
                </Link>
              </Button>
            </div>

            {/* Pro-code style Stats Row - compact on mobile */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 md:gap-6 pt-4 md:pt-8 px-4">
              {statItems.map((stat, index) => (
                <div 
                  key={index}
                  className="group flex items-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4 w-full sm:w-auto rounded-xl bg-card/50 border border-border/50 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors duration-300">
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}+</div>
                    <div className="text-xs md:text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};