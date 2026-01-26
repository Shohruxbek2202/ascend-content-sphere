import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
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
          ? 'bg-background/95 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display text-lg font-semibold text-foreground">
              ShohruxDigital
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.nav.home}
            </Link>
            <Link
              to="/blog"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.nav.blog}
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.nav.categories}
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.nav.about}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              size="sm"
              className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5"
              asChild
            >
              <Link to="/subscribe" className="flex items-center gap-2">
                {t.hero.subscribe}
                <ArrowRight className="w-4 h-4" />
              </Link>
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
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-1">
              <Link
                to="/"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-3 px-2 hover:bg-muted rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.home}
              </Link>
              <Link
                to="/blog"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-3 px-2 hover:bg-muted rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.blog}
              </Link>
              <Link
                to="/categories"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-3 px-2 hover:bg-muted rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.categories}
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-3 px-2 hover:bg-muted rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.about}
              </Link>
              <Button
                size="sm"
                className="w-full mt-3 bg-primary text-primary-foreground rounded-full"
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
