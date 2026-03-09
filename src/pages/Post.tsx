import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Heart, ArrowLeft, Calendar } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import PostStructuredData from '@/components/PostStructuredData';
import DOMPurify from 'dompurify';
import { HumanMadeSeal } from '@/components/HumanMadeSeal';
import { AIMadeSeal } from '@/components/AIMadeSeal';
import ShareButtons from '@/components/post/ShareButtons';
import CommentSection from '@/components/post/CommentSection';
import RelatedPosts from '@/components/post/RelatedPosts';
import type { Post as PostType, Comment } from '@/types/post';

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
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (postData) {
        setPost(postData);
        await supabase.rpc('increment_post_views', { post_id: postData.id });

        const { data: commentsData } = await supabase
          .from('public_comments' as never)
          .select('*')
          .eq('post_id', postData.id)
          .eq('approved', true)
          .order('created_at', { ascending: false });

        if (commentsData) {
          setComments(commentsData as unknown as Comment[]);
        }

        if (postData.category_id) {
          const { data: relatedData } = await supabase
            .from('posts')
            .select(`*, categories (slug, name_uz, name_ru, name_en)`)
            .eq('category_id', postData.category_id)
            .eq('published', true)
            .neq('id', postData.id)
            .limit(3);

          if (relatedData) setRelatedPosts(relatedData);
        }
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
      ALLOWED_TAGS: [
        'p', 'br', 'hr', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 's', 'u',
        'a', 'img', 'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'figure', 'figcaption',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel', 'title', 'width', 'height'],
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
    toast.success('Like qo\'shildi!');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-12 w-full bg-muted animate-pulse rounded" />
              <div className="h-64 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-2">
              {language === 'uz' ? 'Maqola topilmadi' : language === 'ru' ? 'Статья не найдена' : 'Article not found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'uz' ? 'Bu maqola mavjud emas yoki o\'chirilgan' : language === 'ru' ? 'Эта статья не существует или была удалена' : 'This article does not exist or has been deleted'}
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 w-4 h-4" />
                {language === 'uz' ? 'Blogga qaytish' : language === 'ru' ? 'Вернуться к блогу' : 'Back to Blog'}
              </Link>
            </Button>
          </div>
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
    <div className="min-h-screen bg-background">
      <ReadingProgressBar />
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={post.tags || []}
        image={post.featured_image || undefined}
        url={seoUrl}
        type="article"
        publishedTime={post.published_at || undefined}
        section={categoryName}
        tags={post.tags || []}
      />
      <PostStructuredData
        title={getLocalizedContent('title')}
        description={seoDescription}
        image={post.featured_image || undefined}
        publishedTime={post.published_at || undefined}
        url={seoUrl}
        tags={post.tags || []}
        category={categoryName}
        wordCount={getLocalizedContent('content')?.split(/\s+/).length}
        isAIGenerated={post.tags?.includes('ai-generated') || false}
      />
      <Header />

      <main className="pt-24 pb-16">
        <article className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.nav.blog}
              </Link>
              {post.categories && (
                <Link to={`/blog?category=${post.categories.slug}`}>
                  <Badge className="bg-primary hover:bg-primary/90 cursor-pointer transition-colors">
                    {categoryName}
                  </Badge>
                </Link>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              {getLocalizedContent('title')}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8 relative">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {post.published_at && new Date(post.published_at).toLocaleDateString(
                    language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.reading_time || 5} {t.blog.readTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.likes || 0}</span>
              </div>
              <div className="ml-auto">
                {post.tags?.includes('ai-generated') ? <AIMadeSeal size="md" /> : <HumanMadeSeal size="md" />}
              </div>
            </div>

            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={getLocalizedContent('title')}
                className="w-full h-auto rounded-xl mb-8 shadow-lg"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                width={1200}
                height={630}
                sizes="(max-width: 768px) 100vw, 768px"
              />
            )}

            <div
              className="post-content prose prose-lg dark:prose-invert max-w-none mb-12 
                prose-headings:scroll-mt-24 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                prose-p:leading-relaxed prose-p:mb-4
                prose-table:border-collapse prose-table:w-full prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-border
                prose-td:p-3 prose-td:border prose-td:border-border
                prose-blockquote:border-l-4 prose-blockquote:border-secondary prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic
                prose-a:text-secondary prose-a:underline-offset-4 hover:prose-a:text-secondary/80
                prose-strong:text-foreground prose-strong:font-bold
                prose-ul:space-y-2 prose-ol:space-y-2 prose-li:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: getLocalizedContent('content') }}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">#{tag}</Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y mb-12">
              <Button
                variant={hasLiked ? 'default' : 'outline'}
                onClick={handleLike}
                disabled={hasLiked}
                className={hasLiked ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                <Heart className={`w-4 h-4 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
                {t.post.like} ({post.likes || 0})
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t.post.share}:</span>
                <ShareButtons shareUrl={shareUrl} title={getLocalizedContent('title')} />
              </div>
            </div>

            <CommentSection
              postId={post.id}
              slug={post.slug}
              comments={comments}
              onCommentAdded={(comment) => setComments(prev => [comment, ...prev])}
            />

            <RelatedPosts posts={relatedPosts} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Post;
