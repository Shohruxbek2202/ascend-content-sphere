import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              ShohruxDigital
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {t.nav.home}
            </Link>
            <Link
              to="/blog"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {t.nav.blog}
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {t.nav.categories}
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {t.nav.about}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="default"
              size="sm"
              className="hidden sm:inline-flex bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              asChild
            >
              <Link to="/subscribe">{t.hero.subscribe}</Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <nav className="flex flex-col gap-3">
              <Link
                to="/"
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.home}
              </Link>
              <Link
                to="/blog"
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.blog}
              </Link>
              <Link
                to="/categories"
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.categories}
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.about}
              </Link>
              <Button
                variant="default"
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-accent"
                asChild
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link to="/subscribe">{t.hero.subscribe}</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
