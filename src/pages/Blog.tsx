import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
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
import SEOHead from '@/components/SEOHead';

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

  const seoTitle = language === 'uz' 
    ? 'Blog - Barcha Maqolalar | Shohruxbek Foziljonov'
    : language === 'ru'
    ? 'Блог - Все статьи | Шохрухбек Фозилжонов'
    : 'Blog - All Articles | Shohruxbek Foziljonov';

  const seoDescription = language === 'uz'
    ? 'Digital marketing, SMM, SEO va shaxsiy rivojlanish bo\'yicha barcha maqolalar'
    : language === 'ru'
    ? 'Все статьи о цифровом маркетинге, SMM, SEO и личностном развитии'
    : 'All articles on digital marketing, SMM, SEO and personal development';

  const hasActiveFilters = searchQuery || selectedCategory !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        type="website"
      />
      <Header />

      <main className="pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
              {t.nav.blog}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              {language === 'uz' && 'Barcha maqolalar va qo\'llanmalar'}
              {language === 'ru' && 'Все статьи и руководства'}
              {language === 'en' && 'All articles and guides'}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-3 mb-6 md:mb-8">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.blog.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1 h-12">
                  <Filter className="w-4 h-4 mr-2 shrink-0" />
                  <SelectValue placeholder={t.blog.filterByCategory} />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">{t.blog.allCategories}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {getLocalizedCategoryName(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 shrink-0"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {searchQuery && (
                  <span className="bg-muted px-3 py-1 rounded-full flex items-center gap-1">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-1">
                    {getLocalizedCategoryName(categories.find(c => c.slug === selectedCategory))}
                    <button onClick={() => setSelectedCategory('all')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground mb-4">
              {filteredPosts.length} {language === 'uz' ? 'ta maqola topildi' : language === 'ru' ? 'статей найдено' : 'articles found'}
            </p>
          )}

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 md:h-80 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredPosts.map((post, index) => (
                <div 
                  key={post.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BlogCard
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-2">{t.blog.noResults}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'uz' && 'Qidiruv so\'rovingiz bo\'yicha maqola topilmadi'}
                {language === 'ru' && 'По вашему запросу статей не найдено'}
                {language === 'en' && 'No articles found for your search'}
              </p>
              <Button
                variant="outline"
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
