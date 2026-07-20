import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@/i18n/LocalizedLink';
import { Clock, Heart, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import PostStructuredData from '@/components/PostStructuredData';
import DOMPurify from 'dompurify';
import ShareButtons from '@/components/post/ShareButtons';
import CommentSection from '@/components/post/CommentSection';
import RelatedPosts from '@/components/post/RelatedPosts';
import type { Post as PostType, Comment } from '@/types/post';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

const Post = () => {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setIsLoading(true);
      const { data: postData } = await supabase
        .from('posts')
        .select(`*, categories (slug, name_uz, name_ru, name_en)`)
        .eq('slug', slug).eq('published', true).maybeSingle();

      if (postData) {
        setPost(postData);
        const viewsPromise = (async () => { await supabase.rpc('increment_post_views', { post_id: postData.id }); })();
        const commentsPromise = (async () => {
          const { data } = await supabase.from('public_comments' as never).select('*')
            .eq('post_id', postData.id).eq('approved', true).order('created_at', { ascending: false });
          if (data) setComments(data as unknown as Comment[]);
        })();
        const relatedPromise = postData.category_id ? (async () => {
          const { data } = await supabase.from('posts').select(`*, categories (slug, name_uz, name_ru, name_en)`)
            .eq('category_id', postData.category_id!).eq('published', true).neq('id', postData.id).limit(3);
          if (data) setRelatedPosts(data);
        })() : Promise.resolve();
        await Promise.all([viewsPromise, commentsPromise, relatedPromise]);
      }
      setIsLoading(false);
    };
    fetchPost();
    try {
      const likedPosts = localStorage.getItem('likedPosts');
      if (likedPosts && slug) {
        const parsed = JSON.parse(likedPosts);
        setHasLiked(parsed.includes(slug));
      }
    } catch {}
  }, [slug]);

  const sanitizeContent = (html: string): string => {
    let clean = html;
    clean = clean.replace(/<!DOCTYPE[^>]*>/gi, '');
    clean = clean.replace(/<\/?html[^>]*>/gi, '');
    clean = clean.replace(/<head[\s\S]*?<\/head>/gi, '');
    clean = clean.replace(/<\/?body[^>]*>/gi, '');
    clean = clean.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '');
    clean = clean.replace(/\s*style="[^"]*"/gi, '');
    clean = clean.replace(/\s*style='[^']*'/gi, '');
    return DOMPurify.sanitize(clean, {
      ALLOWED_TAGS: ['p','br','hr','h2','h3','h4','h5','h6','ul','ol','li','strong','b','em','i','s','u','a','img','blockquote','code','pre','table','thead','tbody','tr','th','td','div','span','figure','figcaption'],
      ALLOWED_ATTR: ['href','src','alt','class','target','rel','title','width','height'],
      ADD_ATTR: ['target'],
    });
  };

  const getLocalizedContent = (field: 'title' | 'content' | 'excerpt') => {
    if (!post) return '';
    const key = `${field}_${language}` as keyof PostType;
    const raw = (post[key] as string) || '';
    if (field === 'content') return sanitizeContent(raw);
    return raw;
  };

  const handleLike = async () => {
    if (!post || hasLiked) return;
    await supabase.rpc('increment_post_likes', { post_id: post.id });
    setPost({ ...post, likes: (post.likes || 0) + 1 });
    setHasLiked(true);
    try {
      const likedPosts = localStorage.getItem('likedPosts');
      const parsed = likedPosts ? JSON.parse(likedPosts) : [];
      localStorage.setItem('likedPosts', JSON.stringify([...parsed, post.slug]));
    } catch {}
    toast.success(language === 'uz' ? 'Like qo\'shildi' : language === 'ru' ? 'Лайк добавлен' : 'Liked');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))]" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
        <Header />
        <main className="max-w-screen-2xl mx-auto px-6 md:px-8 py-24">
          <div className="max-w-3xl space-y-4">
            <div className="h-3 w-32 bg-[hsl(var(--ink-2))] animate-pulse" />
            <div className="h-16 w-full bg-[hsl(var(--ink-2))] animate-pulse" />
            <div className="h-64 w-full bg-[hsl(var(--ink-2))] animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))]" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
        <Header />
        <main className="max-w-screen-2xl mx-auto px-6 md:px-8 py-32 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-6">404 / Lost issue</p>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-6" style={editorial}>
            {language === 'uz' ? 'Maqola topilmadi' : language === 'ru' ? 'Статья не найдена' : 'Article not found'}
          </h1>
          <p className="text-zinc-400 mb-10 max-w-md mx-auto">
            {language === 'uz' ? 'Bu yozuv arxivdan olib tashlangan yoki manzil noto\'g\'ri.' : language === 'ru' ? 'Эта запись удалена или адрес некорректен.' : 'This entry was pulled from the archive, or the URL is wrong.'}
          </p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-4 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#4f46e5] hover:text-white transition-all">
            <ArrowLeft className="w-3 h-3" />
            {language === 'uz' ? 'Jurnalga qaytish' : language === 'ru' ? 'К журналу' : 'Back to the Journal'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = post.categories
    ? language === 'uz' ? post.categories.name_uz : language === 'ru' ? post.categories.name_ru : post.categories.name_en
    : '';

  const seoTitle = getLocalizedContent('title') + ' | Shohruxbek Foziljonov';
  const seoDescription = getLocalizedContent('excerpt') || getLocalizedContent('content').replace(/<[^>]*>/g, '').substring(0, 160);
  const seoUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <ReadingProgressBar />
      <SEOHead title={seoTitle} description={seoDescription} keywords={post.tags || []} image={post.featured_image || undefined} url={seoUrl} type="article" publishedTime={post.published_at || undefined} section={categoryName} tags={post.tags || []} />
      <PostStructuredData title={getLocalizedContent('title')} description={seoDescription} image={post.featured_image || undefined} publishedTime={post.published_at || undefined} url={seoUrl} tags={post.tags || []} category={categoryName} wordCount={getLocalizedContent('content')?.split(/\s+/).length} isAIGenerated={post.tags?.includes('ai-generated') || false} />
      <Header />

      <main>
        {/* HERO */}
        <article className="max-w-screen-2xl mx-auto">
          <header className="px-6 md:px-8 pt-14 md:pt-20 pb-12 md:pb-16 border-b border-[hsl(var(--rule))]">
            {/* Breadcrumb */}
            <div className="flex items-center gap-4 mb-10 text-[10px] font-black uppercase tracking-[0.3em]">
              <Link to="/blog" className="text-zinc-500 hover:text-[#4f46e5] transition-colors inline-flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" /> {t.nav.blog}
              </Link>
              {post.categories && (
                <>
                  <span className="text-zinc-700">/</span>
                  <Link to={`/blog?category=${post.categories.slug}`} className="text-[#4f46e5] hover:text-[hsl(var(--paper))] transition-colors">
                    {categoryName}
                  </Link>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-[clamp(2rem,6vw,5.5rem)] font-bold uppercase leading-[0.95] tracking-tighter mb-10 max-w-5xl" style={editorial}>
              {getLocalizedContent('title')}
            </h1>

            {/* Meta strip */}
            <div className="border-t border-[hsl(var(--rule))] pt-6 flex flex-wrap items-center gap-x-10 gap-y-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              {post.published_at && (
                <span>
                  {new Date(post.published_at).toLocaleDateString(
                    language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ',
                    { day: 'numeric', month: 'long', year: 'numeric' }
                  )}
                </span>
              )}
              <span className="flex items-center gap-2"><Clock className="w-3 h-3" />{post.reading_time || 5} {t.blog.readTime}</span>
              <span className="flex items-center gap-2"><Heart className="w-3 h-3" />{post.likes || 0}</span>
              {getLocalizedContent('content') && (
                <span>{getLocalizedContent('content').replace(/<[^>]*>/g, '').split(/\s+/).length} {language === 'uz' ? 'so\'z' : language === 'ru' ? 'слов' : 'words'}</span>
              )}
            </div>
          </header>

          {/* Featured image */}
          {post.featured_image && (
            <div className="border-b border-[hsl(var(--rule))]">
              <img
                src={post.featured_image}
                alt={getLocalizedContent('title')}
                className="w-full h-auto"
                loading="eager" fetchPriority="high" decoding="sync"
                width={1600} height={900}
                sizes="100vw"
              />
            </div>
          )}

          {/* Body */}
          <section className="px-6 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Lede column (left rail on desktop) */}
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-28 space-y-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                <div>
                  <p className="mb-2">{language === 'uz' ? 'Bo\'lim' : language === 'ru' ? 'Раздел' : 'Section'}</p>
                  <p className="text-[#4f46e5]">{categoryName || '—'}</p>
                </div>
                <div className="pt-6 border-t border-[hsl(var(--rule))]">
                  <p className="mb-3">{t.post.share}</p>
                  <ShareButtons shareUrl={shareUrl} title={getLocalizedContent('title')} />
                </div>
                <div className="pt-6 border-t border-[hsl(var(--rule))]">
                  <button
                    onClick={handleLike}
                    disabled={hasLiked}
                    className={`w-full inline-flex items-center justify-between gap-2 px-4 py-3 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.3em] transition-all ${hasLiked ? 'bg-[#4f46e5] text-white' : 'hover:bg-[#4f46e5] hover:text-white'}`}
                  >
                    <span className="flex items-center gap-2">
                      <Heart className={`w-3 h-3 ${hasLiked ? 'fill-current' : ''}`} />
                      {t.post.like}
                    </span>
                    <span>{post.likes || 0}</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Article content */}
            <div className="lg:col-span-9 order-1 lg:order-2">
              {getLocalizedContent('excerpt') && (
                <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed font-light mb-12 pb-12 border-b border-[hsl(var(--rule))]">
                  {getLocalizedContent('excerpt')}
                </p>
              )}

              <div
                className="post-content prose prose-lg prose-invert max-w-none
                  prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight
                  prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:leading-tight
                  prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
                  prose-p:text-lg prose-p:leading-[1.75] prose-p:text-zinc-300 prose-p:mb-6
                  prose-a:text-[#4f46e5] prose-a:no-underline prose-a:border-b prose-a:border-[#4f46e5]/40 hover:prose-a:border-[#4f46e5]
                  prose-strong:text-[hsl(var(--paper))] prose-strong:font-bold
                  prose-blockquote:border-l-2 prose-blockquote:border-[#4f46e5] prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-2xl prose-blockquote:text-[hsl(var(--paper))] prose-blockquote:font-light
                  prose-ul:my-6 prose-ol:my-6 prose-li:text-lg prose-li:leading-relaxed prose-li:text-zinc-300
                  prose-img:my-10 prose-img:w-full
                  prose-table:border prose-table:border-[hsl(var(--rule))] prose-th:bg-[hsl(var(--ink-2))] prose-th:p-3 prose-th:text-left prose-th:font-bold prose-th:uppercase prose-th:text-[10px] prose-th:tracking-widest prose-th:border prose-th:border-[hsl(var(--rule))]
                  prose-td:p-3 prose-td:border prose-td:border-[hsl(var(--rule))] prose-td:text-zinc-300
                  prose-code:text-[#4f46e5] prose-code:bg-[hsl(var(--ink-2))] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                  prose-pre:bg-[hsl(var(--ink-2))] prose-pre:border prose-pre:border-[hsl(var(--rule))]"
                style={editorial}
                dangerouslySetInnerHTML={{ __html: getLocalizedContent('content') }}
              />
              {/* Reset font for actual body text */}
              <style>{`.post-content p, .post-content li, .post-content td, .post-content blockquote { font-family: "DM Sans", system-ui, sans-serif !important; }`}</style>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-16 pt-8 border-t border-[hsl(var(--rule))]">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">
                    {language === 'uz' ? 'Teglar' : language === 'ru' ? 'Теги' : 'Tags'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1.5 border border-[hsl(var(--rule))] text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* End mark */}
              <div className="mt-16 pt-8 border-t border-[hsl(var(--rule))] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">— Fin —</span>
                <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] hover:text-[hsl(var(--paper))] transition-colors">
                  {language === 'uz' ? 'Boshqa yozuvlar' : language === 'ru' ? 'Другие записи' : 'More entries'}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Comments + Related */}
              <div className="mt-20">
                <CommentSection
                  postId={post.id}
                  slug={post.slug}
                  comments={comments}
                  onCommentAdded={(comment) => setComments(prev => [comment, ...prev])}
                />
              </div>
              <div className="mt-20">
                <RelatedPosts posts={relatedPosts} />
              </div>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Post;
