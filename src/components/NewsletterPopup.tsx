import { useState, useEffect } from 'react';
import { X, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const NewsletterPopup = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user already subscribed
    const alreadySubscribed = localStorage.getItem('newsletter_subscribed');
    if (alreadySubscribed) return;

    // First popup after 5 seconds
    const firstTimer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    // Then show every 30 seconds
    const intervalTimer = setInterval(() => {
      const stillSubscribed = localStorage.getItem('newsletter_subscribed');
      if (!stillSubscribed) {
        setIsOpen(true);
      }
    }, 30000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(language === 'uz' ? 'Email kiriting' : language === 'ru' ? 'Введите email' : 'Enter email');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('subscribers').insert({
        email: email.trim().toLowerCase(),
        language,
      });

      if (error) {
        if (error.code === '23505') {
          toast.info(language === 'uz' ? 'Siz allaqachon obuna bo\'lgansiz!' : language === 'ru' ? 'Вы уже подписаны!' : 'You are already subscribed!');
        } else {
          throw error;
        }
      } else {
        toast.success(language === 'uz' ? 'Muvaffaqiyatli obuna bo\'ldingiz!' : language === 'ru' ? 'Вы успешно подписались!' : 'Successfully subscribed!');
        localStorage.setItem('newsletter_subscribed', 'true');
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : language === 'ru' ? 'Произошла ошибка' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const content = {
    uz: {
      title: 'Yangiliklar uchun obuna bo\'ling',
      subtitle: 'Digital marketing bo\'yicha eng so\'nggi maqolalar va maslahatlarni birinchi bo\'lib oling',
      placeholder: 'Email manzilingiz',
      button: 'Obuna bo\'lish',
      later: 'Keyinroq',
    },
    ru: {
      title: 'Подпишитесь на новости',
      subtitle: 'Получайте первыми новые статьи и советы по digital маркетингу',
      placeholder: 'Ваш email',
      button: 'Подписаться',
      later: 'Позже',
    },
    en: {
      title: 'Subscribe to Newsletter',
      subtitle: 'Be the first to receive new articles and tips on digital marketing',
      placeholder: 'Your email address',
      button: 'Subscribe',
      later: 'Maybe later',
    },
  };

  const t = content[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Gradient header */}
        <div className="bg-gradient-to-r from-secondary to-secondary/80 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-foreground mb-2">
            {t.title}
          </h2>
          <p className="text-secondary-foreground/80 text-sm">
            {t.subtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            type="email"
            placeholder={t.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="h-12 text-base"
          />
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                ...
              </span>
            ) : (
              t.button
            )}
          </Button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            {t.later}
          </button>
        </form>
      </div>
    </div>
  );
};
