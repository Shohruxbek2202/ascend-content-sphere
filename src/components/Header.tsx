import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from '@/i18n/LocalizedLink';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { GlobalSearch } from './GlobalSearch';
import { useLanguage } from '@/contexts/LanguageContext';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

export const Header = () => {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  const links = [
    { to: '/blog', label: t.nav.blog },
    { to: '/categories', label: t.nav.categories },
    { to: '/case-studies', label: t.nav.caseStudies },
    { to: '/fitness', label: 'Fitness' },
    { to: '/about', label: t.nav.about },
    { to: '/faq', label: t.nav.faq },
    { to: '/contact', label: t.nav.contact },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[hsl(var(--ink))]/85 backdrop-blur-xl border-b border-[hsl(var(--rule))]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-8 py-5 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold tracking-tighter uppercase leading-none text-[hsl(var(--paper))] shrink-0" style={editorial}>
            Shohrux<span className="text-[#4f46e5]">Digital</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-[10px] font-bold uppercase tracking-[0.3em] flex-1 justify-center">
            {links.slice(0, 5).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors ${isActive(link.to) ? 'text-[hsl(var(--paper))]' : 'text-zinc-500 hover:text-[#4f46e5]'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="hidden md:block"><GlobalSearch /></div>
            <ThemeToggle />
            <LanguageSwitcher />
            <Link
              to="/subscribe"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 md:px-5 py-2 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-widest hover:bg-[#4f46e5] hover:text-white transition-all"
            >
              {t.hero.subscribe} <ArrowUpRight className="w-3 h-3" />
            </Link>
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center border border-[hsl(var(--rule))] text-[hsl(var(--paper))]"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden bg-[hsl(var(--ink))] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="pt-28 px-8 flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-8">{t.nav.more}</p>
          {links.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="py-5 border-b border-[hsl(var(--rule))] flex items-center justify-between text-2xl font-bold uppercase tracking-tight text-[hsl(var(--paper))] hover:text-[#4f46e5] transition-colors"
              style={editorial}
            >
              <span>
                <span className="text-zinc-700 mr-4 text-sm tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                {link.label}
              </span>
              <ArrowUpRight className="w-5 h-5 text-zinc-600" />
            </Link>
          ))}
          <Link
            to="/subscribe"
            onClick={() => setOpen(false)}
            className="mt-10 px-6 py-4 bg-[#4f46e5] text-white text-xs font-black uppercase tracking-[0.3em] text-center hover:bg-[hsl(var(--paper))] hover:text-[hsl(var(--ink))] transition-colors"
          >
            {t.hero.subscribe} →
          </Link>
        </nav>
      </div>
    </>
  );
};
