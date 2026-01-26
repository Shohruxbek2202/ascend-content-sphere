import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Search, FileText, Share2, Users, Tag, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const iconMap: Record<string, any> = {
  TrendingUp,
  Search,
  FileText,
  Share2,
  Users,
  Tag,
};

interface Category {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  icon: string | null;
  color: string | null;
  post_count?: number;
}

const Categories = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      if (categoriesData) {
        // Get post counts for each category
        const categoriesWithCounts = await Promise.all(
          categoriesData.map(async (category) => {
            const { count } = await supabase
              .from('posts')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id)
              .eq('published', true);

            return {
              ...category,
              post_count: count || 0,
            };
          })
        );

        setCategories(categoriesWithCounts);
      }

      setIsLoading(false);
    };

    fetchCategories();
  }, []);

  const getLocalizedName = (category: Category) => {
    switch (language) {
      case 'ru':
        return category.name_ru;
      case 'en':
        return category.name_en;
      default:
        return category.name_uz;
    }
  };

  const getLocalizedDescription = (category: Category) => {
    switch (language) {
      case 'ru':
        return category.description_ru || '';
      case 'en':
        return category.description_en || '';
      default:
        return category.description_uz || '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === 'uz' && 'Kategoriyalar'}
              {language === 'ru' && 'Категории'}
              {language === 'en' && 'Categories'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {language === 'uz' && 'Mavzular bo\'yicha maqolalarni toping'}
              {language === 'ru' && 'Найдите статьи по темам'}
              {language === 'en' && 'Find articles by topic'}
            </p>
          </div>

          {/* Categories Grid - Liquid Glass */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => {
                const IconComponent = iconMap[category.icon || 'Tag'] || Tag;

                return (
                  <Link 
                    key={category.id} 
                    to={`/blog?category=${category.slug}`}
                    className="group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-full p-6 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-500 hover:-translate-y-2 hover:bg-white/15 dark:hover:bg-white/10">
                      <div className="flex items-start gap-4">
                        {/* Icon - Glass Style */}
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 backdrop-blur-sm"
                          style={{ 
                            backgroundColor: `${category.color}20`,
                            boxShadow: `0 4px 20px ${category.color}30`
                          }}
                        >
                          <IconComponent
                            className="w-7 h-7"
                            style={{ color: category.color || '#3B82F6' }}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-bold text-foreground group-hover:text-secondary transition-colors duration-300 mb-2">
                            {getLocalizedName(category)}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {getLocalizedDescription(category)}
                          </p>
                          
                          {/* Stats & Arrow */}
                          <div className="flex items-center justify-between">
                            <div 
                              className="text-sm font-semibold px-3 py-1 rounded-full"
                              style={{ 
                                color: category.color || '#3B82F6',
                                backgroundColor: `${category.color}15`
                              }}
                            >
                              {category.post_count}{' '}
                              {language === 'uz' && 'ta maqola'}
                              {language === 'ru' && 'статей'}
                              {language === 'en' && 'articles'}
                            </div>
                            
                            <ArrowRight 
                              className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all duration-300" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
