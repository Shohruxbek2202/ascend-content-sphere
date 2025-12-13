import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { BlogCard } from '@/components/BlogCard';
import { SubscribeSection } from '@/components/SubscribeSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import HomeStructuredData from '@/components/HomeStructuredData';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface Post {
  id: string;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  excerpt_uz: string | null;
  excerpt_ru: string | null;
  excerpt_en: string | null;
  featured_image: string | null;
  reading_time: number | null;
  likes: number | null;
  published_at: string | null;
  featured: boolean | null;
  categories?: {
    name_uz: string;
    name_ru: string;
    name_en: string;
  };
}

const Index = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      // Fetch featured posts
      const { data: featured } = await supabase
        .from('posts')
        .select('*, categories(name_uz, name_ru, name_en)')
        .eq('published', true)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(2);

      // Fetch latest posts
      const { data: latest } = await supabase
        .from('posts')
        .select('*, categories(name_uz, name_ru, name_en)')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(6);

      if (featured) setFeaturedPosts(featured);
      if (latest) setLatestPosts(latest);
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  const getTitle = (post: Post) => post[`title_${language}`] || post.title_en;
  const getExcerpt = (post: Post) => post[`excerpt_${language}`] || post.excerpt_en || '';
  const getCategoryName = (post: Post) => 
    post.categories ? (post.categories[`name_${language}`] || post.categories.name_en) : '';

  const seoTitle = language === 'uz' 
    ? 'ShohruxDigital - Digital Marketing, SMM, SEO va Shaxsiy Rivojlanish Blogi | Shohruxbek Foziljonov'
    : language === 'ru'
    ? 'ShohruxDigital - Блог о Цифровом Маркетинге, SMM, SEO и Личностном Развитии | Шохрухбек Фозилжонов'
    : 'ShohruxDigital - Digital Marketing, SMM, SEO and Personal Development Blog | Shohruxbek Foziljonov';

  const seoDescription = language === 'uz'
    ? 'Shohruxbek Foziljonov tomonidan digital marketing, SMM, SEO, kontekstli reklama va shaxsiy rivojlanish bo\'yicha professional maqolalar, amaliy maslahatlar va zamonaviy strategiyalar. Bepul o\'quv materiallari.'
    : language === 'ru'
    ? 'Профессиональные статьи, практические советы и современные стратегии по цифровому маркетингу, SMM, SEO, контекстной рекламе и личностному развитию от Шохрухбека Фозилжонова. Бесплатные учебные материалы.'
    : 'Professional articles, practical tips and modern strategies on digital marketing, SMM, SEO, PPC advertising and personal development by Shohruxbek Foziljonov. Free learning materials.';

  const seoKeywords = language === 'uz'
    ? ['digital marketing', 'SMM', 'SEO', 'shaxsiy rivojlanish', 'marketing strategiya', 'Shohruxbek Foziljonov', 'kontekstli reklama', 'Instagram reklama', 'Facebook reklama']
    : language === 'ru'
    ? ['цифровой маркетинг', 'SMM', 'SEO', 'личностное развитие', 'маркетинговая стратегия', 'Шохрухбек Фозилжонов', 'контекстная реклама', 'реклама в Instagram', 'реклама в Facebook']
    : ['digital marketing', 'SMM', 'SEO', 'personal development', 'marketing strategy', 'Shohruxbek Foziljonov', 'PPC advertising', 'Instagram ads', 'Facebook ads'];

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shohruxdigital.uz';

  const socialLinks = [
    settings.instagram_url,
    settings.telegram_url,
    settings.twitter_url,
    settings.youtube_url,
    settings.facebook_url,
    settings.linkedin_url,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={siteUrl}
        type="website"
        image={`${siteUrl}/og-image.png`}
        siteName="ShohruxDigital"
      />
      <HomeStructuredData
        siteName="ShohruxDigital"
        siteUrl={siteUrl}
        description={seoDescription}
        socialLinks={socialLinks}
      />
      <Header />
      
      <main>
        <Hero />

        {/* Quick Stats Section for SEO */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/blog" className="group flex items-center gap-4 p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {language === 'uz' ? 'Maqolalar' : language === 'ru' ? 'Статьи' : 'Articles'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'uz' ? 'Foydali kontentlar' : language === 'ru' ? 'Полезный контент' : 'Useful content'}
                </p>
              </div>
            </Link>
            <Link to="/categories" className="group flex items-center gap-4 p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {language === 'uz' ? 'Kategoriyalar' : language === 'ru' ? 'Категории' : 'Categories'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'uz' ? 'Marketing va shaxsiy o\'sish' : language === 'ru' ? 'Маркетинг и рост' : 'Marketing & growth'}
                </p>
              </div>
            </Link>
            <Link to="/subscribe" className="group flex items-center gap-4 p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="p-3 rounded-lg bg-secondary/10 text-secondary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {language === 'uz' ? 'Obuna bo\'lish' : language === 'ru' ? 'Подписаться' : 'Subscribe'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'uz' ? 'Yangiliklar va maqolalar' : language === 'ru' ? 'Новости и статьи' : 'News & articles'}
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="container mx-auto px-4 py-16" aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              {t.blog.featured}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  id={post.slug}
                  title={getTitle(post)}
                  excerpt={getExcerpt(post)}
                  image={post.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'}
                  category={getCategoryName(post)}
                  readTime={post.reading_time || 5}
                  likes={post.likes || 0}
                  comments={0}
                  publishedAt={post.published_at || ''}
                  featured
                />
              ))}
            </div>
          </section>
        )}

        {/* Latest Posts */}
        <section className="container mx-auto px-4 py-16" aria-labelledby="latest-heading">
          <div className="flex items-center justify-between mb-8">
            <h2 id="latest-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {t.blog.latest}
            </h2>
            <Button variant="outline" asChild>
              <Link to="/blog" aria-label={language === 'uz' ? 'Barcha maqolalarni ko\'rish' : language === 'ru' ? 'Просмотреть все статьи' : 'View all articles'}>
                {t.nav.blog}
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  id={post.slug}
                  title={getTitle(post)}
                  excerpt={getExcerpt(post)}
                  image={post.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'}
                  category={getCategoryName(post)}
                  readTime={post.reading_time || 5}
                  likes={post.likes || 0}
                  comments={0}
                  publishedAt={post.published_at || ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              {language === 'uz' && 'Hali maqolalar yo\'q. Admin paneldan qo\'shing!'}
              {language === 'ru' && 'Статей пока нет. Добавьте в админ панели!'}
              {language === 'en' && 'No articles yet. Add them in the admin panel!'}
            </div>
          )}
        </section>

        <SubscribeSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
