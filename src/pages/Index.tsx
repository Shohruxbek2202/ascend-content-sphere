import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { BlogCard } from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const SubscribeSection = lazy(() => import('@/components/SubscribeSection').then(m => ({ default: m.SubscribeSection })));
const NewsletterPopup = lazy(() => import('@/components/NewsletterPopup').then(m => ({ default: m.NewsletterPopup })));
const CTABanner = lazy(() => import('@/components/CTABanner').then(m => ({ default: m.CTABanner })));
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import HomeStructuredData from '@/components/HomeStructuredData';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLocalized } from '@/hooks/useLocalized';
import type { Post } from '@/types/post';

interface Stats {
  posts: number;
  categories: number;
  subscribers: number;
}

const Index = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const { getField } = useLocalized();
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({ posts: 0, categories: 0, subscribers: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [latestResult, postsCount, categoriesCount, subscribersCount] = await Promise.all([
        supabase
          .from('posts')
          .select('*, categories(name_uz, name_ru, name_en)')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(6),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('active', true),
      ]);

      const latest = latestResult.data || [];
      setLatestPosts(latest);
      setFeaturedPosts(latest.filter((p) => p.featured).slice(0, 2));
      setStats({
        posts: postsCount.count || 0,
        categories: categoriesCount.count || 0,
        subscribers: subscribersCount.count || 0,
      });
      setIsLoading(false);

      const lcpPost = latest[0];
      if (lcpPost?.featured_image) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = lcpPost.featured_image;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      }
    };

    fetchData();
  }, []);

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
    ? ['digital marketing', 'SMM', 'SEO', 'shaxsiy rivojlanish', 'marketing strategiya', 'Shohruxbek Foziljonov']
    : language === 'ru'
    ? ['цифровой маркетинг', 'SMM', 'SEO', 'личностное развитие', 'маркетинговая стратегия', 'Шохрухбек Фозилжонов']
    : ['digital marketing', 'SMM', 'SEO', 'personal development', 'marketing strategy', 'Shohruxbek Foziljonov'];

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shohruxdigital.uz';

  const socialLinks = [
    settings.instagram_url, settings.telegram_url, settings.twitter_url,
    settings.youtube_url, settings.facebook_url, settings.linkedin_url,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={seoTitle} description={seoDescription} keywords={seoKeywords} url={siteUrl} type="website" image={`${siteUrl}/og-image.png`} siteName="ShohruxDigital" />
      <HomeStructuredData siteName="ShohruxDigital" siteUrl={siteUrl} description={seoDescription} socialLinks={socialLinks} />
      <Header />
      
      <main>
        <Hero />

        {featuredPosts.length > 0 && (
          <section className="container mx-auto px-4 py-10 md:py-16 lg:py-20" aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 md:mb-10">
              {t.blog.featured}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {featuredPosts.map((post, index) => (
                <BlogCard
                  key={post.id}
                  id={post.slug}
                  title={getField(post, 'title')}
                  excerpt={getField(post, 'excerpt')}
                  image={post.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'}
                  category={post.categories ? getField(post.categories, 'name') : ''}
                  readTime={post.reading_time || 5}
                  likes={post.likes || 0}
                  comments={0}
                  publishedAt={post.published_at || ''}
                  featured
                  isLCP={index === 0}
                  tags={post.tags || []}
                />
              ))}
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 py-10 md:py-16 lg:py-20" aria-labelledby="latest-heading">
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h2 id="latest-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {t.blog.latest}
            </h2>
            <Button variant="outline" size="sm" className="rounded-full text-xs md:text-sm" asChild>
              <Link to="/blog" aria-label={language === 'uz' ? 'Barcha maqolalarni ko\'rish' : language === 'ru' ? 'Просмотреть все статьи' : 'View all articles'}>
                {language === 'uz' ? 'Barchasi' : language === 'ru' ? 'Все' : 'View all'}
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3 md:space-y-4">
                  <div className="aspect-[16/10] bg-muted animate-pulse rounded-lg" />
                  <div className="h-3 md:h-4 bg-muted animate-pulse rounded w-1/4" />
                  <div className="h-5 md:h-6 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 md:h-4 bg-muted animate-pulse rounded w-full" />
                </div>
              ))}
            </div>
          ) : latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {latestPosts.map((post, index) => (
                <BlogCard
                  key={post.id}
                  id={post.slug}
                  title={getField(post, 'title')}
                  excerpt={getField(post, 'excerpt')}
                  image={post.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'}
                  category={post.categories ? getField(post.categories, 'name') : ''}
                  readTime={post.reading_time || 5}
                  likes={post.likes || 0}
                  comments={0}
                  publishedAt={post.published_at || ''}
                  isLCP={featuredPosts.length === 0 && index === 0}
                  tags={post.tags || []}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-20">
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">📝</div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                {language === 'uz' ? 'Hali maqolalar yo\'q' : language === 'ru' ? 'Статей пока нет' : 'No articles yet'}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
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

        <Suspense fallback={null}><CTABanner /></Suspense>
        <Suspense fallback={null}><SubscribeSection /></Suspense>
      </main>

      <Suspense fallback={null}><NewsletterPopup /></Suspense>
      <Footer />
    </div>
  );
};

export default Index;
