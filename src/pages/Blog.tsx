import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BlogCard } from '@/components/BlogCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  views: number | null;
  likes: number | null;
  published_at: string | null;
  category_id: string | null;
  categories?: {
    slug: string;
    name_uz: string;
    name_ru: string;
    name_en: string;
  };
}

interface Category {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
}

const Blog = () => {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name_en');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch published posts
      let query = supabase
        .from('posts')
        .select(`
          *,
          categories (
            slug,
            name_uz,
            name_ru,
            name_en
          )
        `)
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (selectedCategory !== 'all') {
        const category = categories.find((c) => c.slug === selectedCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data: postsData } = await query;

      if (postsData) {
        setPosts(postsData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [selectedCategory, categories.length]);

  const getLocalizedTitle = (post: Post) => {
    switch (language) {
      case 'ru':
        return post.title_ru;
      case 'en':
        return post.title_en;
      default:
        return post.title_uz;
    }
  };

  const getLocalizedExcerpt = (post: Post) => {
    switch (language) {
      case 'ru':
        return post.excerpt_ru || '';
      case 'en':
        return post.excerpt_en || '';
      default:
        return post.excerpt_uz || '';
    }
  };

  const getLocalizedCategoryName = (category: Category | undefined) => {
    if (!category) return '';
    switch (language) {
      case 'ru':
        return category.name_ru;
      case 'en':
        return category.name_en;
      default:
        return category.name_uz;
    }
  };

  const filteredPosts = posts.filter((post) => {
    const title = getLocalizedTitle(post).toLowerCase();
    const excerpt = getLocalizedExcerpt(post).toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || excerpt.includes(query);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.nav.blog}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {language === 'uz' && 'Barcha maqolalar va qo\'llanmalar'}
              {language === 'ru' && 'Все статьи и руководства'}
              {language === 'en' && 'All articles and guides'}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.blog.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t.blog.filterByCategory} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.blog.allCategories}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {getLocalizedCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  id={post.slug}
                  title={getLocalizedTitle(post)}
                  excerpt={getLocalizedExcerpt(post)}
                  image={
                    post.featured_image ||
                    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'
                  }
                  category={getLocalizedCategoryName(post.categories as Category | undefined)}
                  readTime={post.reading_time || 5}
                  likes={post.likes || 0}
                  comments={0}
                  publishedAt={post.published_at || ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">{t.blog.noResults}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                {language === 'uz' && 'Filtirlarni tozalash'}
                {language === 'ru' && 'Сбросить фильтры'}
                {language === 'en' && 'Clear filters'}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
