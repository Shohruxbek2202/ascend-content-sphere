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
    <section className="relative min-h-[85vh] flex flex-col overflow-hidden bg-background pt-20">
      {/* Liquid Glass Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-secondary/30 via-secondary/10 to-transparent blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-primary/10 via-secondary/5 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] rounded-full bg-gradient-to-t from-secondary/20 to-transparent blur-3xl" />
      </div>

      {/* Main Hero Content */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className={`max-w-5xl mx-auto text-center space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
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
              {/* Highlighted part - iOS selection style */}
              <span className="relative inline-block">
                <span className="relative z-10 text-foreground">{titleParts.highlighted}</span>
                {/* iOS Selection highlight background */}
                <span 
                  className="absolute inset-0 -inset-x-2 -inset-y-1 bg-[#007AFF]/20 dark:bg-[#0A84FF]/25 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,122,255,0.15) 0%, rgba(0,122,255,0.25) 50%, rgba(0,122,255,0.15) 100%)',
                  }}
                />
                {/* iOS Selection handles */}
                <span className="absolute -left-1 top-0 bottom-0 w-0.5 bg-[#007AFF] rounded-full" />
                <span className="absolute -right-1 top-0 bottom-0 w-0.5 bg-[#007AFF] rounded-full" />
                {/* iOS Selection dots */}
                <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#007AFF] rounded-full shadow-lg shadow-[#007AFF]/30" />
                <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#007AFF] rounded-full shadow-lg shadow-[#007AFF]/30" />
              </span>
              <br className="hidden sm:block" />
              <span className="text-foreground/80"> {titleParts.rest}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Liquid Glass CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                className="relative overflow-hidden bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-base font-semibold rounded-2xl group shadow-xl shadow-secondary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/40 hover:-translate-y-1"
                asChild
              >
                <Link to="/blog">
                  <span className="relative z-10 flex items-center">
                    {t.hero.cta}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
              </Button>
              
              <Button
                size="lg"
                variant="ghost"
                className="relative px-8 py-6 text-base font-semibold rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/5"
                asChild
              >
                <Link to="/about">{t.nav.about}</Link>
              </Button>
            </div>

            {/* Single Stats Row - Liquid Glass Cards */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-10">
              {statItems.map((stat, index) => (
                <div 
                  key={index}
                  className="group flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 dark:hover:bg-white/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-foreground">{stat.value}+</div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
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
