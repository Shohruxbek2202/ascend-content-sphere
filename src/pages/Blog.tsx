import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BlogCard } from '@/components/BlogCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { useLocalized } from '@/hooks/useLocalized';
import type { Post } from '@/types/post';
import { PublicPageHero } from '@/components/PublicPageHero';

interface Category {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
}

const POSTS_PER_PAGE = 9;

const Blog = () => {
  const { t, language } = useLanguage();
  const { getField } = useLocalized();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', value);
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name_en');

      if (categoriesData) {
        setCategories(categoriesData);

        let query = supabase
          .from('posts')
          .select(`*, categories (slug, name_uz, name_ru, name_en)`, { count: 'exact' })
          .eq('published', true)
          .order('published_at', { ascending: false });

        if (selectedCategory !== 'all') {
          const category = categoriesData.find((c) => c.slug === selectedCategory);
          if (category) {
            query = query.eq('category_id', category.id);
          }
        }

        // Server-side search
        if (searchQuery.trim()) {
          const q = `%${searchQuery.trim()}%`;
          const titleField = `title_${language}` as 'title_uz' | 'title_ru' | 'title_en';
          query = query.ilike(titleField, q);
        }

        const from = (currentPage - 1) * POSTS_PER_PAGE;
        const to = from + POSTS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data: postsData, count } = await query;

        if (postsData) {
          setPosts(postsData);
          setTotalCount(count || 0);
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [selectedCategory, currentPage, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  // Search is now server-side, no client-side filtering needed
  const filteredPosts = posts;

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

  const eyebrow = language === 'uz' ? 'Vol. 02 — Jurnal' : language === 'ru' ? 'Том 02 — Журнал' : 'Vol. 02 — The Journal';
  const lede = language === 'uz'
    ? 'Strategiya, ma\'lumotlar va chidamlilik haqida har haftalik dispatchlar. Toshkentdan.'
    : language === 'ru'
    ? 'Еженедельные диспетчи о стратегии, данных и выносливости. Из Ташкента.'
    : 'Weekly dispatches on strategy, data, and endurance. Filed from Tashkent.';

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <SEOHead title={seoTitle} description={seoDescription} url={typeof window !== 'undefined' ? window.location.href : ''} type="website" image={`${typeof window !== 'undefined' ? window.location.origin : ''}/og-image.png`} />
      <BreadcrumbJsonLd items={[{ name: language === 'uz' ? 'Jurnal' : language === 'ru' ? 'Журнал' : 'Journal', url: '/blog' }]} />
      <Header />

      <PublicPageHero
        eyebrow={eyebrow}
        title={t.nav.blog}
        lede={lede}
        meta={`${totalCount} ${language === 'uz' ? 'yozuv' : language === 'ru' ? 'записей' : 'entries'}`}
      />

      <main className="max-w-screen-2xl mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Filter strip */}
        <div className="flex flex-col md:flex-row gap-3 mb-10 md:mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="text"
              placeholder={t.blog.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-10 h-12 bg-[#141432]/40 border-[#1e1e5a] rounded-none text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-[#4f46e5]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="md:w-64 h-12 bg-[#141432]/40 border-[#1e1e5a] rounded-none text-white">
              <Filter className="w-3 h-3 mr-2 shrink-0 text-[#4f46e5]" />
              <SelectValue placeholder={t.blog.filterByCategory} />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a1a] border-[#1e1e5a] text-white z-50">
              <SelectItem value="all">{t.blog.allCategories}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {getField(category, 'name')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              className="h-12 px-4 border-[#1e1e5a] bg-transparent text-zinc-300 hover:bg-[#141432] rounded-none text-[10px] font-black uppercase tracking-widest"
              onClick={() => { setSearchQuery(''); handleCategoryChange('all'); }}
            >
              <X className="w-3 h-3 mr-2" />
              {language === 'uz' ? 'Tozalash' : language === 'ru' ? 'Сбросить' : 'Clear'}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1e1e5a] border border-[#1e1e5a]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-[#0a0a1a] animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1e1e5a] border border-[#1e1e5a]">
              {filteredPosts.map((post, index) => (
                <div key={post.id} className="bg-[#0a0a1a] animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                  <BlogCard
                    id={post.slug}
                    title={getField(post, 'title')}
                    excerpt={getField(post, 'excerpt')}
                    image={post.featured_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'}
                    category={post.categories ? getField(post.categories, 'name') : ''}
                    readTime={post.reading_time || 5}
                    likes={post.likes || 0}
                    comments={0}
                    publishedAt={post.published_at || ''}
                    tags={post.tags || []}
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline" size="sm"
                  className="border-[#1e1e5a] bg-transparent text-zinc-300 hover:bg-[#141432] rounded-none text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  ← {language === 'uz' ? 'Oldingi' : language === 'ru' ? 'Назад' : 'Prev'}
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => {
                    const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                    return (
                      <span key={page} className="flex items-center">
                        {showEllipsis && <span className="px-2 text-zinc-600">···</span>}
                        <button
                          className={`w-10 h-10 text-xs font-black tracking-widest border ${
                            page === currentPage
                              ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
                              : 'border-[#1e1e5a] text-zinc-400 hover:bg-[#141432]'
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {String(page).padStart(2, '0')}
                        </button>
                      </span>
                    );
                  })}
                <Button
                  variant="outline" size="sm"
                  className="border-[#1e1e5a] bg-transparent text-zinc-300 hover:bg-[#141432] rounded-none text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  {language === 'uz' ? 'Keyingi' : language === 'ru' ? 'Далее' : 'Next'} →
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 border border-[#1e1e5a]">
            <Search className="w-8 h-8 text-zinc-600 mx-auto mb-6" />
            <p className="text-xl font-bold uppercase tracking-tight text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{t.blog.noResults}</p>
            <p className="text-sm text-zinc-500 mb-6">
              {language === 'uz' ? 'Filtrlarni qayta sozlab ko\'ring' : language === 'ru' ? 'Попробуйте изменить фильтры' : 'Try adjusting your filters'}
            </p>
            <button
              className="px-6 py-3 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-widest hover:bg-[#4f46e5] hover:text-white transition-all"
              onClick={() => { setSearchQuery(''); handleCategoryChange('all'); }}
            >
              {language === 'uz' ? 'Filtrlarni tozalash' : language === 'ru' ? 'Сбросить фильтры' : 'Clear filters'}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
