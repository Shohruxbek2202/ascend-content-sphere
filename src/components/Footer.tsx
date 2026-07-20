import { Link } from '@/i18n/LocalizedLink';
import { Instagram, Send, Youtube, Facebook, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

export const Footer = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  const socials = [
    { url: settings.instagram_url, icon: Instagram, label: 'Instagram' },
    { url: settings.telegram_url, icon: Send, label: 'Telegram' },
    { url: settings.youtube_url, icon: Youtube, label: 'YouTube' },
    { url: settings.facebook_url, icon: Facebook, label: 'Facebook' },
    { url: settings.twitter_url, icon: Twitter, label: 'Twitter' },
    { url: settings.linkedin_url, icon: Linkedin, label: 'LinkedIn' },
  ].filter(s => s.url);

  const tagline = language === 'uz'
    ? 'Marketing strategiyasi, ma\'lumotlar va chidamlilik haqida shaxsiy jurnal. Toshkentdan, global o\'ylab.'
    : language === 'ru'
    ? 'Личный журнал о маркетинговой стратегии, данных и выносливости. Из Ташкента, мыслим глобально.'
    : 'A personal journal on marketing strategy, data, and endurance. From Tashkent, thinking global.';

  const navColumns = [
    {
      title: language === 'uz' ? 'Jurnal' : language === 'ru' ? 'Журнал' : 'Journal',
      links: [
        { to: '/blog', label: t.nav.blog },
        { to: '/categories', label: t.nav.categories },
        { to: '/case-studies', label: t.nav.caseStudies },
        { to: '/fitness', label: 'Fitness' },
      ],
    },
    {
      title: language === 'uz' ? 'Muallif' : language === 'ru' ? 'Автор' : 'Author',
      links: [
        { to: '/about', label: t.nav.about },
        { to: '/contact', label: t.nav.contact },
        { to: '/faq', label: t.nav.faq },
      ],
    },
    {
      title: language === 'uz' ? 'Huquqiy' : language === 'ru' ? 'Правовое' : 'Legal',
      links: [
        { to: '/subscribe', label: t.hero.subscribe },
        { to: '/privacy', label: t.footer.privacy },
        { to: '/terms', label: t.footer.terms },
      ],
    },
  ];

  return (
    <footer className="bg-[hsl(var(--ink))] text-[hsl(var(--paper))] border-t border-[hsl(var(--rule))]" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8 pt-20 md:pt-28 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-10 lg:gap-12 mb-20">
          <div className="col-span-2 lg:col-span-5">
            <Link to="/" className="text-2xl md:text-3xl font-bold tracking-tighter uppercase block mb-6" style={editorial}>
              Shohrux<span className="text-[#4f46e5]">Digital</span>
            </Link>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md mb-8">{tagline}</p>
            <div className="flex gap-2">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 border border-[hsl(var(--rule))] flex items-center justify-center text-zinc-400 hover:bg-[#4f46e5] hover:border-[#4f46e5] hover:text-[hsl(var(--paper))] transition-all"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {navColumns.map((col) => (
            <div key={col.title} className="col-span-1 lg:col-span-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm font-medium text-zinc-300 hover:text-[#4f46e5] transition-colors flex items-center gap-1.5 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 lg:col-span-1 flex flex-col items-start lg:items-end">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Status</h4>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-[hsl(var(--rule))] px-3 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
              {language === 'uz' ? 'Bo\'sh' : language === 'ru' ? 'Открыт' : 'Available'}
            </div>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--rule))]/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
          <p>© {year} ShohruxDigital — {t.footer.rights}</p>
          <p className="hidden md:block">Midnight Indigo — Vol. 02</p>
          <p>
            {language === 'uz' ? 'Toshkent — Markaziy Osiyo' : language === 'ru' ? 'Ташкент — Центральная Азия' : 'Tashkent — Central Asia'}
          </p>
        </div>
      </div>
    </footer>
  );
};
