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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <Hero />

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="container mx-auto px-4 py-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
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
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {t.blog.latest}
            </h2>
            <Button variant="outline" asChild>
              <Link to="/blog">
                {t.nav.blog}
                <ArrowRight className="w-4 h-4 ml-2" />
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
