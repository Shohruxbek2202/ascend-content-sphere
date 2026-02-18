import { Link } from 'react-router-dom';
import { Instagram, Send, Youtube, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const Footer = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { url: settings.instagram_url, icon: Instagram, label: 'Instagram' },
    { url: settings.telegram_url, icon: Send, label: 'Telegram' },
    { url: settings.youtube_url, icon: Youtube, label: 'YouTube' },
    { url: settings.facebook_url, icon: Facebook, label: 'Facebook' },
    { url: settings.twitter_url, icon: Twitter, label: 'Twitter' },
    { url: settings.linkedin_url, icon: Linkedin, label: 'LinkedIn' },
  ].filter(link => link.url);

  return (
    <footer className="relative bg-foreground/95 dark:bg-background/95 backdrop-blur-xl text-background dark:text-foreground overflow-hidden">
      {/* Liquid Glass Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-20 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Side - Brand & Social */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl md:text-3xl font-bold text-background dark:text-foreground">
                ShohruxDigital
              </span>
            </Link>
            <p className="text-background/70 dark:text-foreground/70 text-base leading-relaxed max-w-md">
              {language === 'uz' 
                ? 'Digital marketing va shaxsiy rivojlanish bo\'yicha professional blog platformasi.'
                : language === 'ru'
                ? 'Профессиональная блог-платформа о цифровом маркетинге и личностном развитии.'
                : 'Professional blog platform about digital marketing and personal development.'}
            </p>

            {/* Social Links - Liquid Glass */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 dark:bg-foreground/10 backdrop-blur-sm border border-background/20 dark:border-foreground/20 hover:bg-secondary hover:border-secondary hover:text-secondary-foreground transition-all duration-300 flex items-center justify-center hover:scale-110"
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
              <h3 className="font-semibold text-background dark:text-foreground text-sm mb-4">
                {language === 'uz' ? 'Navigatsiya' : language === 'ru' ? 'Навигация' : 'Navigation'}
              </h3>
              <ul className="space-y-2">
                {[
                  { to: '/', label: t.nav.home },
                  { to: '/blog', label: t.nav.blog },
                  { to: '/categories', label: t.nav.categories },
                  { to: '/faq', label: t.nav.faq },
                  { to: '/case-studies', label: t.nav.caseStudies },
                  { to: '/about', label: t.nav.about },
                ].map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-background/70 dark:text-foreground/70 hover:text-background dark:hover:text-foreground transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-background dark:text-foreground text-sm mb-4">
                {language === 'uz' ? 'Resurslar' : language === 'ru' ? 'Ресурсы' : 'Resources'}
              </h3>
              <ul className="space-y-2">
                {[
                  { to: '/subscribe', label: t.hero.subscribe },
                  { to: '/contact', label: t.footer.contact },
                ].map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-background/70 dark:text-foreground/70 hover:text-background dark:hover:text-foreground transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-background dark:text-foreground text-sm mb-4">
                {language === 'uz' ? 'Huquqiy' : language === 'ru' ? 'Правовое' : 'Legal'}
              </h3>
              <ul className="space-y-2">
                {[
                  { to: '/privacy', label: t.footer.privacy },
                  { to: '/terms', label: t.footer.terms },
                ].map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-background/70 dark:text-foreground/70 hover:text-background dark:hover:text-foreground transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Liquid Glass */}
      <div className="border-t border-background/10 dark:border-foreground/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <p className="text-background/60 dark:text-foreground/60 text-sm">
            © {currentYear} ShohruxDigital. {t.footer.rights}
          </p>
          <p className="text-background/40 dark:text-foreground/40 text-sm">
            Made with ❤️ in Uzbekistan
          </p>
        </div>
      </div>
    </footer>
  );
};
