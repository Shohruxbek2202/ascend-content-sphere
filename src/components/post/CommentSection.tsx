import { useState } from 'react';
import { MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Comment } from '@/types/post';

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
  } catch {}
};

interface CommentSectionProps {
  postId: string;
  slug: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
}

const CommentSection = ({ postId, slug, comments, onCommentAdded }: CommentSectionProps) => {
  const { t, language } = useLanguage();
  const [authorName, setAuthorName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentContent.trim()) {
      toast.error('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    if (isOnCooldown(slug)) {
      toast.error(
        language === 'uz' ? '5 daqiqa ichida faqat 1 ta izoh yuborishingiz mumkin'
        : language === 'ru' ? 'Можно оставить только 1 комментарий в 5 минут'
        : 'You can only post 1 comment every 5 minutes'
      );
      return;
    }

    if (authorName.trim().length > 100 || commentContent.trim().length > 2000) {
      toast.error('Input too long');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_name: authorName.trim().substring(0, 100),
      content: commentContent.trim().substring(0, 2000),
      approved: true,
    });

    if (error) {
      toast.error(
        language === 'uz' ? 'Izoh yuborishda xatolik yuz berdi'
        : language === 'ru' ? 'Ошибка при отправке комментария'
        : 'Error submitting comment'
      );
    } else {
      setCooldown(slug);
      toast.success(
        language === 'uz' ? 'Izohingiz muvaffaqiyatli qo\'shildi!'
        : language === 'ru' ? 'Комментарий успешно добавлен!'
        : 'Your comment has been added!'
      );
      onCommentAdded({
        id: crypto.randomUUID(),
        author_name: authorName.trim(),
        content: commentContent.trim(),
        created_at: new Date().toISOString(),
      });
      setAuthorName('');
      setCommentContent('');
    }

    setIsSubmitting(false);
  };

  return (
    <section className="mb-12">
      <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        {t.post.comments} ({comments.length})
      </h2>

      <form onSubmit={handleSubmit} className="bg-muted/30 rounded-xl p-6 mb-8">
        <p className="text-sm text-muted-foreground mb-4">
          {language === 'uz' ? '💬 Fikringizni qoldiring'
           : language === 'ru' ? '💬 Оставьте свой комментарий'
           : '💬 Leave your comment'}
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
  );
};

export default CommentSection;
