import { Link } from 'react-router-dom';
import { Instagram, Send, Youtube, Facebook, Twitter, Linkedin, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const Footer = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const socialLinks = [
    { url: settings.instagram_url, icon: Instagram, label: 'Instagram' },
    { url: settings.telegram_url, icon: Send, label: 'Telegram' },
    { url: settings.youtube_url, icon: Youtube, label: 'YouTube' },
    { url: settings.facebook_url, icon: Facebook, label: 'Facebook' },
    { url: settings.twitter_url, icon: Twitter, label: 'Twitter' },
    { url: settings.linkedin_url, icon: Linkedin, label: 'LinkedIn' },
  ].filter(link => link.url);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error(language === 'uz' ? 'Iltimos, to\'g\'ri email kiriting' : 
                  language === 'ru' ? 'Пожалуйста, введите правильный email' : 
                  'Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      const { data: existing } = await supabase
        .from('subscribers')
        .select('id, active')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        if (existing.active) {
          toast.info(language === 'uz' ? 'Bu email allaqachon obuna bo\'lgan' : 
                     language === 'ru' ? 'Этот email уже подписан' : 
                     'This email is already subscribed');
        } else {
          await supabase
            .from('subscribers')
            .update({ active: true, unsubscribed_at: null })
            .eq('id', existing.id);
          toast.success(t.subscribe.success);
        }
      } else {
        const { error } = await supabase
          .from('subscribers')
          .insert({ email, language, active: true });
        if (error) throw error;
        toast.success(t.subscribe.success);
      }
      setEmail('');
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error(language === 'uz' ? 'Xatolik yuz berdi' : 
                  language === 'ru' ? 'Произошла ошибка' : 
                  'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Side - Brand & Newsletter */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl md:text-3xl font-bold text-background">
                ShohruxDigital
              </span>
            </Link>
            <p className="text-background/70 text-base leading-relaxed max-w-md">
              {language === 'uz' 
                ? 'Digital marketing va shaxsiy rivojlanish bo\'yicha professional blog platformasi.'
                : language === 'ru'
                ? 'Профессиональная блог-платформа о цифровом маркетинге и личностном развитии.'
                : 'Professional blog platform about digital marketing and personal development.'}
            </p>

            {/* Newsletter in Footer */}
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <Input
                type="email"
                placeholder={t.subscribe.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-background/10 border-background/20 text-background placeholder:text-background/50 h-11 rounded-full px-4 text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full w-11 h-11 shrink-0"
                disabled={isLoading}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-secondary hover:text-secondary-foreground transition-colors flex items-center justify-center"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Right Side - Links */}
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {/* Navigation */}
            <div>
              <h3 className="font-semibold text-background text-sm mb-4">
                {language === 'uz' ? 'Navigatsiya' : language === 'ru' ? 'Навигация' : 'Navigation'}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-background/70 hover:text-background transition-colors text-sm">
                    {t.nav.home}
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-background/70 hover:text-background transition-colors text-sm">
                    {t.nav.blog}
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-background/70 hover:text-background transition-colors text-sm">
                    {t.nav.categories}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-background/70 hover:text-background transition-colors text-sm">
                    {t.nav.about}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-background text-sm mb-4">
                {language === 'uz' ? 'Resurslar' : language === 'ru' ? 'Ресурсы' : 'Resources'}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/subscribe" className="text-background/70 hover:text-background transition-colors text-sm">
                    {t.hero.subscribe}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-background/70 hover:text-background transition-colors text-sm">
                    {t.footer.contact}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-background text-sm mb-4">
                {language === 'uz' ? 'Huquqiy' : language === 'ru' ? 'Правовое' : 'Legal'}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-background/70 hover:text-background transition-colors text-sm">
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-background/70 hover:text-background transition-colors text-sm">
                    {t.footer.terms}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © {currentYear} ShohruxDigital. {t.footer.rights}
          </p>
          <p className="text-background/40 text-sm">
            Made with ❤️ in Uzbekistan
          </p>
        </div>
      </div>
    </footer>
  );
};
