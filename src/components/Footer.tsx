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
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Side - Brand & Social */}
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
