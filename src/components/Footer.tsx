import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Instagram, Linkedin, Mail, Twitter, Youtube, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const Footer = () => {
  const { t } = useLanguage();
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
    <footer className="bg-muted/30 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold">ShohruxDigital</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Digital marketing va shaxsiy rivojlanish bo'yicha professional blog platformasi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t.nav.blog}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.blog.latest}
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.nav.categories}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link to="/subscribe" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.hero.subscribe}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.terms}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.footer.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Social Media</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.length > 0 ? (
                socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Havolalar mavjud emas</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {currentYear} ShohruxDigital. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
};