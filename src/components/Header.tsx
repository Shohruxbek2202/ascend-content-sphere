import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
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

  // Primary nav links (always visible)
  const primaryLinks = [
    { to: '/blog', label: t.nav.blog },
    { to: '/categories', label: t.nav.categories },
    { to: '/faq', label: t.nav.faq },
    { to: '/case-studies', label: t.nav.caseStudies },
  ];

  // Secondary links (in dropdown)
  const moreLinks = [
    { to: '/about', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ];

  // All links for mobile menu
  const allLinks = [
    { to: '/', label: t.nav.home },
    ...primaryLinks,
    ...moreLinks,
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'py-2' : 'py-3 md:py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between h-14 md:h-16 px-4 md:px-6 rounded-2xl transition-all duration-500 ${
            isScrolled
              ? 'bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5'
              : 'bg-background/60 backdrop-blur-md border border-border/30'
          }`}>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group z-50 shrink-0">
              <span className="font-display text-lg md:text-xl font-bold text-foreground">
                ShohruxDigital
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-0.5">
              {primaryLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-accent/50 transition-all duration-300 whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}

              {/* More dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-accent/50 transition-all duration-300 outline-none">
                    {t.nav.more}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  {moreLinks.map((link) => (
                    <DropdownMenuItem key={link.to} asChild>
                      <Link to={link.to} className="cursor-pointer">
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <ThemeToggle />
              <LanguageSwitcher />
              <Button
                size="sm"
                className="hidden sm:inline-flex bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl px-4 font-semibold shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300"
                asChild
              >
                <Link to="/subscribe" className="flex items-center gap-1.5">
                  {t.hero.subscribe}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden relative z-50 border border-border/50 rounded-xl w-10 h-10 p-0 hover:bg-accent/50"
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
        className={`fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-background/95 backdrop-blur-xl border-l border-border/50 z-40 md:hidden shadow-2xl transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col pt-24 px-6">
          {allLinks.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-base font-medium text-foreground hover:text-secondary transition-all py-4 border-b border-border/30 ${
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
            className={`w-full mt-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl font-semibold shadow-lg shadow-secondary/20 transition-all ${
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
