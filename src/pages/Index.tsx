import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { BlogCard } from '@/components/BlogCard';
import { SubscribeSection } from '@/components/SubscribeSection';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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

interface Stats {
  posts: number;
  categories: number;
  subscribers: number;
}

const Index = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({ posts: 0, categories: 0, subscribers: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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

      // Fetch real stats
      const [postsCount, categoriesCount, subscribersCount] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('active', true),
      ]);

      if (featured) setFeaturedPosts(featured);
      if (latest) setLatestPosts(latest);
      setStats({
        posts: postsCount.count || 0,
        categories: categoriesCount.count || 0,
        subscribers: subscribersCount.count || 0,
      });
      setIsLoading(false);
    };

    fetchData();
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

  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    if (num < 10) return `${num}`;
    if (num < 100) return `${Math.floor(num / 10) * 10}+`;
    if (num < 1000) return `${Math.floor(num / 100) * 100}+`;
    return `${Math.floor(num / 1000)}K+`;
  };

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

        {/* Stats Section */}
        <section className="py-20 bg-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link to="/blog" className="group text-center p-8 hover:bg-background/5 rounded-2xl transition-colors">
                <div className="text-5xl font-bold text-background mb-2">{formatNumber(stats.posts)}</div>
                <h3 className="font-semibold text-background/90 mb-1">
                  {language === 'uz' ? 'Maqolalar' : language === 'ru' ? 'Статьи' : 'Articles'}
                </h3>
                <p className="text-sm text-background/60">
                  {language === 'uz' ? 'Foydali kontentlar' : language === 'ru' ? 'Полезный контент' : 'Useful content'}
                </p>
              </Link>
              <Link to="/categories" className="group text-center p-8 hover:bg-background/5 rounded-2xl transition-colors">
                <div className="text-5xl font-bold text-background mb-2">{formatNumber(stats.categories)}</div>
                <h3 className="font-semibold text-background/90 mb-1">
                  {language === 'uz' ? 'Kategoriyalar' : language === 'ru' ? 'Категории' : 'Categories'}
                </h3>
                <p className="text-sm text-background/60">
                  {language === 'uz' ? 'Marketing va shaxsiy o\'sish' : language === 'ru' ? 'Маркетинг и рост' : 'Marketing & growth'}
                </p>
              </Link>
              <Link to="/subscribe" className="group text-center p-8 hover:bg-background/5 rounded-2xl transition-colors">
                <div className="text-5xl font-bold text-background mb-2">{formatNumber(stats.subscribers)}</div>
                <h3 className="font-semibold text-background/90 mb-1">
                  {language === 'uz' ? 'Obunachilar' : language === 'ru' ? 'Подписчики' : 'Subscribers'}
                </h3>
                <p className="text-sm text-background/60">
                  {language === 'uz' ? 'Yangiliklar va maqolalar' : language === 'ru' ? 'Новости и статьи' : 'News & articles'}
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="container mx-auto px-4 py-20" aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-10">
              {t.blog.featured}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <section className="container mx-auto px-4 py-20" aria-labelledby="latest-heading">
          <div className="flex items-center justify-between mb-10">
            <h2 id="latest-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {t.blog.latest}
            </h2>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/blog" aria-label={language === 'uz' ? 'Barcha maqolalarni ko\'rish' : language === 'ru' ? 'Просмотреть все статьи' : 'View all articles'}>
                {language === 'uz' ? 'Barchasi' : language === 'ru' ? 'Все' : 'View all'}
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[16/10] bg-muted animate-pulse rounded-lg" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                  <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-full" />
                </div>
              ))}
            </div>
          ) : latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {language === 'uz' ? 'Hali maqolalar yo\'q' : language === 'ru' ? 'Статей пока нет' : 'No articles yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === 'uz' ? 'Tez orada yangi maqolalar qo\'shiladi!' : language === 'ru' ? 'Скоро добавятся новые статьи!' : 'New articles coming soon!'}
              </p>
              <Button asChild>
                <Link to="/subscribe">
                  {language === 'uz' ? 'Obuna bo\'ling' : language === 'ru' ? 'Подписаться' : 'Subscribe'}
                </Link>
              </Button>
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
