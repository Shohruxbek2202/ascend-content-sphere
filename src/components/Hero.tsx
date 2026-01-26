import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, FolderOpen, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const Hero = () => {
  const { t } = useLanguage();
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [stats, setStats] = useState({ posts: 0, subscribers: 0, categories: 0 });

  const fullText = t.hero.title;

  // Typing animation effect
  useEffect(() => {
    if (!fullText) return;
    
    setDisplayText('');
    setIsTyping(true);
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [fullText]);

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

  const statItems = [
    { icon: BookOpen, value: stats.posts, label: t.hero.stats?.posts || "Maqolalar" },
    { icon: Users, value: stats.subscribers, label: t.hero.stats?.subscribers || "Obunachilar" },
    { icon: FolderOpen, value: stats.categories, label: t.hero.stats?.categories || "Kategoriyalar" },
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/5 pt-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30 text-sm font-medium animate-fade-in">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <span>Professional Blog Platform</span>
          </div>

          {/* Animated Title */}
          <div className="min-h-[120px] md:min-h-[160px] flex items-center justify-center">
            <h1 
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight"
              id="main-heading"
            >
              {displayText}
              {isTyping && (
                <span className="inline-block w-1 h-[0.9em] bg-secondary ml-1 animate-pulse" />
              )}
            </h1>
          </div>

          {/* Subtitle with fade-in */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-base font-semibold rounded-full group shadow-lg shadow-secondary/25 transition-all hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5"
              asChild
            >
              <Link to="/blog">
                {t.hero.cta}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-border px-8 py-6 text-base font-semibold rounded-full hover:bg-muted transition-all hover:-translate-y-0.5"
              asChild
            >
              <Link to="/about">{t.nav.about}</Link>
            </Button>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-8 animate-fade-in" style={{ animationDelay: '1s' }}>
            {statItems.map((stat, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <stat.icon className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-foreground">{stat.value}+</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
