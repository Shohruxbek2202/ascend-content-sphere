import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, Heart, MessageCircle, Share2, ArrowLeft, 
  Facebook, Linkedin, Twitter, Send, User, Calendar
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BlogCard } from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import PostStructuredData from '@/components/PostStructuredData';

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

      // Fetch post
      const { data: postData } = await supabase
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
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (postData) {
        setPost(postData);

        // Increment views
        await supabase.rpc('increment_post_views', { post_id: postData.id });

        // Fetch comments using secure view (excludes email)
        const { data: commentsData } = await supabase
          .from('public_comments' as any)
          .select('*')
          .eq('post_id', postData.id)
          .order('created_at', { ascending: false });

        if (commentsData) {
          setComments(commentsData as unknown as Comment[]);
        }

        // Fetch related posts
        if (postData.category_id) {
          const { data: relatedData } = await supabase
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
            .eq('category_id', postData.category_id)
            .eq('published', true)
            .neq('id', postData.id)
            .limit(3);

          if (relatedData) {
            setRelatedPosts(relatedData);
          }
        }
      }

      setIsLoading(false);
    };

    fetchPost();
    
    // Check if user has liked this post
    const likedPosts = localStorage.getItem('likedPosts');
    if (likedPosts && slug) {
      const parsed = JSON.parse(likedPosts);
      setHasLiked(parsed.includes(slug));
    }
  }, [slug]);

  const getLocalizedContent = (field: 'title' | 'content' | 'excerpt') => {
    if (!post) return '';
    const key = `${field}_${language}` as keyof Post;
    return (post[key] as string) || '';
  };

  const handleLike = async () => {
    if (!post || hasLiked) return;

    await supabase.rpc('increment_post_likes', { post_id: post.id });
    
    setPost({ ...post, likes: (post.likes || 0) + 1 });
    setHasLiked(true);

    // Save to localStorage
    const likedPosts = localStorage.getItem('likedPosts');
    const parsed = likedPosts ? JSON.parse(likedPosts) : [];
    localStorage.setItem('likedPosts', JSON.stringify([...parsed, post.slug]));

    toast.success('Like qo\'shildi!');
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!post || !authorName.trim() || !commentContent.trim()) {
      toast.error('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      author_name: authorName.trim(),
      content: commentContent.trim(),
    });

    if (error) {
      toast.error('Xatolik yuz berdi');
    } else {
      toast.success('Izoh qo\'shildi!');
      setAuthorName('');
      setCommentContent('');
      
      // Refresh comments using secure view (excludes email)
      const { data: commentsData } = await supabase
        .from('public_comments' as any)
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });

      if (commentsData) {
        setComments(commentsData as unknown as Comment[]);
      }
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
            <div className="max-w-3xl mx-auto">
              <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
              <div className="h-12 w-full bg-muted animate-pulse rounded mb-4" />
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
            <h1 className="text-2xl font-bold mb-4">Maqola topilmadi</h1>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Blogga qaytish
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = post.categories
    ? language === 'uz'
      ? post.categories.name_uz
      : language === 'ru'
      ? post.categories.name_ru
      : post.categories.name_en
    : '';

  const seoTitle = getLocalizedContent('title') + ' | Shohruxbek Foziljonov';
  const seoDescription = getLocalizedContent('excerpt') || getLocalizedContent('content').substring(0, 160);
  const seoUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-background">
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
            {/* Breadcrumb and Category */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Link
                to="/blog"
                className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.nav.blog}
              </Link>
              
              {post.categories && (
                <Link to={`/blog?category=${post.categories.slug}`}>
                  <Badge className="bg-primary hover:bg-primary/90 cursor-pointer transition-colors">
                    {language === 'uz' && post.categories.name_uz}
                    {language === 'ru' && post.categories.name_ru}
                    {language === 'en' && post.categories.name_en}
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
                  {post.published_at &&
                    new Date(post.published_at).toLocaleDateString(
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
              />
            )}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: getLocalizedContent('content') }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y mb-12">
              <Button
                variant={hasLiked ? 'default' : 'outline'}
                onClick={handleLike}
                disabled={hasLiked}
                className={hasLiked ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                <Heart className={`w-4 h-4 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
                {t.post.like} ({post.likes || 0})
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t.post.share}:</span>
                <a
                  href={shareLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </a>
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-blue-700 hover:text-white transition-colors flex items-center justify-center"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-sky-500 hover:text-white transition-colors flex items-center justify-center"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Comments Section */}
            <section className="mb-12">
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                {t.post.comments} ({comments.length})
              </h2>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="bg-muted/30 rounded-xl p-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder={language === 'uz' ? 'Ismingiz' : language === 'ru' ? 'Ваше имя' : 'Your name'}
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder={language === 'uz' ? 'Izohingiz...' : language === 'ru' ? 'Ваш комментарий...' : 'Your comment...'}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Yuborilmoqda...' : language === 'uz' ? 'Yuborish' : language === 'ru' ? 'Отправить' : 'Submit'}
                  </Button>
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
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'uz' && 'Hali izohlar yo\'q. Birinchi bo\'ling!'}
                    {language === 'ru' && 'Комментариев пока нет. Будьте первым!'}
                    {language === 'en' && 'No comments yet. Be the first!'}
                  </p>
                )}
              </div>
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold mb-6">
                  {t.post.relatedPosts}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <BlogCard
                      key={relatedPost.id}
                      id={relatedPost.slug}
                      title={
                        language === 'uz'
                          ? relatedPost.title_uz
                          : language === 'ru'
                          ? relatedPost.title_ru
                          : relatedPost.title_en
                      }
                      excerpt={
                        (language === 'uz'
                          ? relatedPost.excerpt_uz
                          : language === 'ru'
                          ? relatedPost.excerpt_ru
                          : relatedPost.excerpt_en) || ''
                      }
                      image={
                        relatedPost.featured_image ||
                        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'
                      }
                      category={
                        relatedPost.categories
                          ? language === 'uz'
                            ? relatedPost.categories.name_uz
                            : language === 'ru'
                            ? relatedPost.categories.name_ru
                            : relatedPost.categories.name_en
                          : ''
                      }
                      readTime={relatedPost.reading_time || 5}
                      likes={relatedPost.likes || 0}
                      comments={0}
                      publishedAt={relatedPost.published_at || ''}
                    />
                  ))}
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
