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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/blog', label: t.nav.blog },
    { to: '/categories', label: t.nav.categories },
    { to: '/about', label: t.nav.about },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-background/70 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/5'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group z-50">
              <span className="font-display text-lg font-bold text-foreground">
                ShohruxDigital
              </span>
            </Link>

            {/* Desktop Navigation - Liquid Glass Pills */}
            <nav className="hidden md:flex items-center">
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10 px-4 py-2 rounded-full transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button
                size="sm"
                className="hidden sm:inline-flex bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-5 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300"
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
                className="md:hidden relative z-50 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full w-10 h-10 p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="relative w-5 h-5">
                  <Menu 
                    className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                    }`} 
                  />
                  <X 
                    className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                    }`} 
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-foreground/40 backdrop-blur-md z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel - Liquid Glass */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] bg-background/80 backdrop-blur-2xl border-l border-white/10 z-40 md:hidden shadow-2xl transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col pt-24 px-6">
          {navLinks.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-lg font-medium text-foreground hover:text-secondary transition-all py-4 border-b border-white/10 ${
                isMobileMenuOpen 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 translate-x-4'
              }`}
              style={{ 
                transitionDelay: isMobileMenuOpen ? `${index * 50 + 100}ms` : '0ms',
                transitionDuration: '300ms'
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          <Button
            size="lg"
            className={`w-full mt-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full shadow-lg shadow-secondary/20 transition-all ${
              isMobileMenuOpen 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
            style={{ 
              transitionDelay: isMobileMenuOpen ? '300ms' : '0ms',
              transitionDuration: '300ms'
            }}
            asChild
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Link to="/subscribe" className="flex items-center justify-center gap-2">
              {t.hero.subscribe}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </nav>
      </div>
    </>
  );
};
