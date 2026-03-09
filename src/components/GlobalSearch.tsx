import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Folder, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocalized } from '@/hooks/useLocalized';

interface SearchResult {
  type: 'post' | 'category' | 'faq';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

export const GlobalSearch = () => {
  const { language } = useLanguage();
  const { getField } = useLocalized();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const placeholder = language === 'uz' ? 'Qidirish...' : language === 'ru' ? 'Поиск...' : 'Search...';

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setIsSearching(true);

    const titleField = `title_${language}`;
    const nameField = `name_${language}`;
    const questionField = `question_${language}`;

    const [postsRes, catsRes, faqsRes] = await Promise.all([
      supabase
        .from('posts')
        .select('id, slug, title_uz, title_ru, title_en, excerpt_uz, excerpt_ru, excerpt_en')
        .eq('published', true)
        .ilike(titleField, `%${q}%`)
        .limit(5),
      supabase
        .from('categories')
        .select('id, slug, name_uz, name_ru, name_en')
        .ilike(nameField, `%${q}%`)
        .limit(3),
      supabase
        .from('faqs')
        .select('id, question_uz, question_ru, question_en, service_category')
        .eq('published', true)
        .ilike(questionField, `%${q}%`)
        .limit(3),
    ]);

    const items: SearchResult[] = [];

    (postsRes.data || []).forEach(p => {
      items.push({
        type: 'post',
        id: p.id,
        title: getField(p, 'title'),
        subtitle: getField(p, 'excerpt')?.substring(0, 80),
        url: `/blog/${p.slug}`,
      });
    });

    (catsRes.data || []).forEach(c => {
      items.push({
        type: 'category',
        id: c.id,
        title: getField(c, 'name'),
        url: `/blog?category=${c.slug}`,
      });
    });

    (faqsRes.data || []).forEach(f => {
      items.push({
        type: 'faq',
        id: f.id,
        title: getField(f, 'question'),
        subtitle: f.service_category,
        url: '/faq',
      });
    });

    setResults(items);
    setIsSearching(false);
  }, [language, getField]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(url);
  };

  const typeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'post': return <FileText className="w-4 h-4 text-primary" />;
      case 'category': return <Folder className="w-4 h-4 text-secondary" />;
      case 'faq': return <HelpCircle className="w-4 h-4 text-accent" />;
    }
  };

  const typeLabel = (type: SearchResult['type']) => {
    if (language === 'uz') return type === 'post' ? 'Maqola' : type === 'category' ? 'Kategoriya' : 'FAQ';
    if (language === 'ru') return type === 'post' ? 'Статья' : type === 'category' ? 'Категория' : 'FAQ';
    return type === 'post' ? 'Article' : type === 'category' ? 'Category' : 'FAQ';
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent/50 transition-all border border-border/50"
        title="Ctrl+K"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline text-xs">Ctrl+K</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 bg-foreground/20 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="border-0 h-14 text-base focus-visible:ring-0 bg-transparent"
                autoFocus
              />
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {query.length >= 2 && (
              <div className="max-h-80 overflow-y-auto p-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((r) => (
                      <button
                        key={`${r.type}-${r.id}`}
                        onClick={() => handleSelect(r.url)}
                        className="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-left"
                      >
                        <div className="mt-0.5">{typeIcon(r.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{r.title}</p>
                          {r.subtitle && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{r.subtitle}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                          {typeLabel(r.type)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {language === 'uz' ? 'Hech narsa topilmadi' : language === 'ru' ? 'Ничего не найдено' : 'No results found'}
                  </div>
                )}
              </div>
            )}

            {query.length < 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {language === 'uz' ? 'Kamida 2 ta belgi kiriting' : language === 'ru' ? 'Введите минимум 2 символа' : 'Type at least 2 characters'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
