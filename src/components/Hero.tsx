import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, FolderOpen, Sparkles } from 'lucide-react';
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
    { icon: BookOpen, value: stats.posts, label: t.hero.stats?.posts || "Maqolalar", desc: "Foydali kontentlar" },
    { icon: FolderOpen, value: stats.categories, label: t.hero.stats?.categories || "Kategoriyalar", desc: "Marketing va shaxsiy o'sish" },
    { icon: Users, value: stats.subscribers, label: t.hero.stats?.subscribers || "Obunachilar", desc: "Yangiliklar va maqolalar" },
  ];

  return (
    <section className="relative min-h-[70vh] flex flex-col overflow-hidden bg-background pt-16">
      {/* Liquid Glass Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-secondary/20 via-secondary/5 to-transparent blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -right-20 w-[300px] h-[300px] rounded-full bg-gradient-to-bl from-primary/10 via-secondary/5 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Hero Content */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className={`max-w-5xl mx-auto text-center space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            {/* Liquid Glass Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-foreground/90">Professional Blog Platform</span>
            </div>

            {/* iOS Style Title with Selection Effect */}
            <h1 
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              id="main-heading"
            >
              {/* Highlighted part - iOS selection style with animation */}
              <span className="relative inline-block ios-selection-container">
                <span className="relative z-10 text-foreground">{titleParts.highlighted}</span>
                {/* iOS Selection highlight background with shimmer */}
                <span 
                  className="absolute inset-0 -inset-x-3 -inset-y-1 rounded-lg ios-selection-bg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,122,255,0.12) 0%, rgba(0,122,255,0.25) 50%, rgba(0,122,255,0.12) 100%)',
                  }}
                />
                {/* Shimmer effect overlay */}
                <span className="absolute inset-0 -inset-x-3 -inset-y-1 rounded-lg overflow-hidden">
                  <span className="absolute inset-0 ios-shimmer" />
                </span>
                {/* iOS Selection handles with pulse */}
                <span className="absolute -left-1.5 top-0 bottom-0 w-[3px] bg-[#007AFF] rounded-full ios-handle-pulse" />
                <span className="absolute -right-1.5 top-0 bottom-0 w-[3px] bg-[#007AFF] rounded-full ios-handle-pulse" style={{ animationDelay: '0.5s' }} />
                {/* iOS Selection dots with glow */}
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#007AFF] rounded-full shadow-lg shadow-[#007AFF]/50 ios-dot-pulse" />
                <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#007AFF] rounded-full shadow-lg shadow-[#007AFF]/50 ios-dot-pulse" style={{ animationDelay: '0.5s' }} />
              </span>
              <br className="hidden sm:block" />
              <span className="text-foreground/80"> {titleParts.rest}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Liquid Glass CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
              <Button
                size="lg"
                className="relative overflow-hidden bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-5 text-base font-semibold rounded-xl group shadow-lg shadow-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5"
                asChild
              >
                <Link to="/blog">
                  <span className="relative z-10 flex items-center">
                    {t.hero.cta}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
              
              <Button
                size="lg"
                variant="ghost"
                className="relative px-6 py-5 text-base font-semibold rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
                asChild
              >
                <Link to="/about">{t.nav.about}</Link>
              </Button>
            </div>

            {/* Stats Row - Horizontal on all screens */}
            <div className="flex justify-center gap-6 md:gap-8 pt-6">
              {statItems.map((stat, index) => (
                <div 
                  key={index}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-foreground">{stat.value}+</div>
                    <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
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
