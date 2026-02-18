import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, Heart, MessageCircle, Share2, ArrowLeft, 
  Facebook, Linkedin, Twitter, Send, User, Calendar
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { BlogCard } from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import PostStructuredData from '@/components/PostStructuredData';
import DOMPurify from 'dompurify';

interface Post {
  id: string;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  excerpt_uz: string | null;
  excerpt_ru: string | null;
  excerpt_en: string | null;
  content_uz: string;
  content_ru: string;
  content_en: string;
  featured_image: string | null;
  reading_time: number | null;
  views: number | null;
  likes: number | null;
  tags: string[] | null;
  published_at: string | null;
  categories?: {
    slug: string;
    name_uz: string;
    name_ru: string;
    name_en: string;
  };
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

// Rate limit: 1 comment per 5 minutes per post
const COMMENT_COOLDOWN_MS = 5 * 60 * 1000;

const getCommentCooldownKey = (slug: string) => `comment_cooldown_${slug}`;

const isOnCooldown = (slug: string): boolean => {
  try {
    const last = localStorage.getItem(getCommentCooldownKey(slug));
    if (!last) return false;
    return Date.now() - parseInt(last) < COMMENT_COOLDOWN_MS;
  } catch {
    return false;
  }
};

const setCooldown = (slug: string) => {
  try {
    localStorage.setItem(getCommentCooldownKey(slug), Date.now().toString());
  } catch {
    // ignore private mode errors
  }
};

const Post = () => {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  
  // Comment form
  const [authorName, setAuthorName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        // Only show approved comments publicly
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
    } catch {
      // ignore localStorage errors
    }
  }, [slug]);

  // [KRITIK-1] DOMPurify ile XSS himoya
  const sanitizeContent = (html: string): string => {
    let clean = html;
    // Strip document wrappers
    clean = clean.replace(/<!DOCTYPE[^>]*>/gi, '');
    clean = clean.replace(/<\/?html[^>]*>/gi, '');
    clean = clean.replace(/<head[\s\S]*?<\/head>/gi, '');
    clean = clean.replace(/<\/?body[^>]*>/gi, '');
    // Remove duplicate H1
    clean = clean.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '');
    // Remove inline styles
    clean = clean.replace(/\s*style="[^"]*"/gi, '');
    clean = clean.replace(/\s*style='[^']*'/gi, '');

    // DOMPurify ile XSS tozalash
    return DOMPurify.sanitize(clean, {
      ALLOWED_TAGS: [
        'p', 'br', 'hr',
        'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'strong', 'b', 'em', 'i', 's', 'u',
        'a', 'img',
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
        'figure', 'figcaption',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel', 'title', 'width', 'height'],
      ADD_ATTR: ['target'],
    });
  };

  const getLocalizedContent = (field: 'title' | 'content' | 'excerpt') => {
    if (!post) return '';
    const key = `${field}_${language}` as keyof Post;
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
    } catch { /* ignore */ }
    toast.success('Like qo\'shildi!');
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !authorName.trim() || !commentContent.trim()) {
      toast.error('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    // [UX-1] Rate limiting
    if (slug && isOnCooldown(slug)) {
      toast.error(
        language === 'uz' ? '5 daqiqa ichida faqat 1 ta izoh yuborishingiz mumkin'
        : language === 'ru' ? 'Можно оставить только 1 комментарий в 5 минут'
        : 'You can only post 1 comment every 5 minutes'
      );
      return;
    }

    // Input length validation
    if (authorName.trim().length > 100) {
      toast.error('Ism 100 ta belgidan oshmasligi kerak');
      return;
    }
    if (commentContent.trim().length > 2000) {
      toast.error('Izoh 2000 ta belgidan oshmasligi kerak');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      author_name: authorName.trim().substring(0, 100),
      content: commentContent.trim().substring(0, 2000),
      approved: false, // [UX-1] Pre-moderation: admin tasdiqlashi kerak
    });

    if (error) {
      toast.error(
        language === 'uz' ? 'Izoh yuborishda xatolik yuz berdi'
        : language === 'ru' ? 'Ошибка при отправке комментария'
        : 'Error submitting comment'
      );
    } else {
      if (slug) setCooldown(slug);
      toast.success(
        language === 'uz' ? 'Izohingiz moderatsiyadan o\'tgach ko\'rinadi'
        : language === 'ru' ? 'Комментарий появится после модерации'
        : 'Your comment will appear after moderation'
      );
      setAuthorName('');
      setCommentContent('');
    }

    setIsSubmitting(false);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareLinks = {
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(getLocalizedContent('title'))}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(getLocalizedContent('title'))}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(getLocalizedContent('title'))}`,
  };

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
              {language === 'uz' ? 'Maqola topilmadi'
               : language === 'ru' ? 'Статья не найдена'
               : 'Article not found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'uz' ? 'Bu maqola mavjud emas yoki o\'chirilgan'
               : language === 'ru' ? 'Эта статья не существует или была удалена'
               : 'This article does not exist or has been deleted'}
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 w-4 h-4" />
                {language === 'uz' ? 'Blogga qaytish'
                 : language === 'ru' ? 'Вернуться к блогу'
                 : 'Back to Blog'}
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = post.categories
    ? language === 'uz' ? post.categories.name_uz
      : language === 'ru' ? post.categories.name_ru
      : post.categories.name_en
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

            {/* Title */}
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              {getLocalizedContent('title')}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
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
            </div>

            {/* Featured Image */}
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={getLocalizedContent('title')}
                className="w-full h-auto rounded-xl mb-8 shadow-lg"
                loading="eager"
              />
            )}

            {/* Content — DOMPurify ile himoyalangan */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: getLocalizedContent('content') }}
            />

            {/* Tags */}
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
                <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </a>
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Comments */}
            <section className="mb-12">
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                {t.post.comments} ({comments.length})
              </h2>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="bg-muted/30 rounded-xl p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'uz' ? '⚠️ Izohlar moderatsiyadan o\'tgach ko\'rinadi'
                   : language === 'ru' ? '⚠️ Комментарии появляются после модерации'
                   : '⚠️ Comments appear after moderation'}
                </p>
                <div className="space-y-4">
                  <Input
                    placeholder={language === 'uz' ? 'Ismingiz (max 100 belgi)' : language === 'ru' ? 'Ваше имя' : 'Your name'}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                  <Textarea
                    placeholder={language === 'uz' ? 'Izohingiz... (max 2000 belgi)' : language === 'ru' ? 'Ваш комментарий...' : 'Your comment...'}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{commentContent.length}/2000</span>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (language === 'uz' ? 'Yuborilmoqda...' : language === 'ru' ? 'Отправка...' : 'Sending...')
                       : (language === 'uz' ? 'Yuborish' : language === 'ru' ? 'Отправить' : 'Submit')}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-card rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{comment.author_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString(
                            language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ'
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'uz' ? 'Hali izohlar yo\'q. Birinchi bo\'ling!'
                     : language === 'ru' ? 'Комментариев пока нет. Будьте первым!'
                     : 'No comments yet. Be the first!'}
                  </p>
                )}
              </div>
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold mb-6">{t.post.relatedPosts}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((related) => {
                    const relTitle = related[`title_${language}` as keyof Post] as string || related.title_en;
                    const relExcerpt = (related[`excerpt_${language}` as keyof Post] as string) || related.excerpt_en || '';
                    const relCategory = related.categories
                      ? (related.categories[`name_${language}` as keyof typeof related.categories] as string) || related.categories.name_en
                      : '';
                    return (
                      <BlogCard
                        key={related.id}
                        id={related.slug}
                        title={relTitle}
                        excerpt={relExcerpt}
                        image={related.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'}
                        category={relCategory}
                        readTime={related.reading_time || 5}
                        likes={related.likes || 0}
                        comments={0}
                        publishedAt={related.published_at || ''}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Post;
