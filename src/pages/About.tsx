import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublicPageHero } from '@/components/PublicPageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import authorPortrait from '@/assets/author-shohruxbek.png';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

interface Stats { posts: number; categories: number; subscribers: number; }

const About = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stats>({ posts: 0, categories: 0, subscribers: 0 });
  const [aboutSettings, setAboutSettings] = useState<Record<string, { uz: string; ru: string; en: string }>>({});
  const [certifications, setCertifications] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [postsCount, categoriesCount, subscribersCount, settingsRes, certsRes, socialsRes, expRes] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('active', true),
        supabase.from('about_settings').select('*'),
        supabase.from('author_certifications').select('*').order('sort_order'),
        supabase.from('author_social_links').select('*').order('sort_order'),
        supabase.from('author_experience').select('*').order('sort_order'),
      ]);
      setStats({ posts: postsCount.count || 0, categories: categoriesCount.count || 0, subscribers: subscribersCount.count || 0 });
      const map: Record<string, { uz: string; ru: string; en: string }> = {};
      (settingsRes.data || []).forEach((s: any) => { map[s.key] = { uz: s.value_uz || '', ru: s.value_ru || '', en: s.value_en || '' }; });
      setAboutSettings(map);
      setCertifications(certsRes.data || []);
      setSocialLinks(socialsRes.data || []);
      setExperiences(expRes.data || []);
    };
    fetchAll();
  }, []);

  const t = (uz: string, ru: string, en: string) => (language === 'uz' ? uz : language === 'ru' ? ru : en);
  const getSetting = (key: string) => {
    const s = aboutSettings[key];
    if (!s) return '';
    return s[language] || s.uz || '';
  };

  const authorName = getSetting('author_name') || 'Shohruxbek Foziljonov';
  const authorRole = getSetting('author_role') || 'Digital Marketing Strategist';
  const authorBio = getSetting('author_bio') || '';
  const authorAvatar = getSetting('author_avatar_url') || authorPortrait;
  const missionTitle = getSetting('mission_title');
  const missionDesc = getSetting('mission_description');

  const initials = authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <SEOHead
        title={t('Muallif | ShohruxDigital', 'Автор | ShohruxDigital', 'Masthead | ShohruxDigital')}
        description={t(
          'Jurnal kim tomonidan yoziladi — marketing strategiyasi va brending bo\'yicha amaliyotchi.',
          'Кто стоит за журналом — практик по маркетинговой стратегии и брендингу.',
          'The person behind the journal — marketing strategist and brand operator.'
        )}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        type="website"
      />
      <BreadcrumbJsonLd items={[{ name: t('Muallif', 'Автор', 'Masthead'), url: '/about' }]} />
      <Header />

      <main className="max-w-screen-2xl mx-auto">
        <PublicPageHero
          eyebrow={t('Masthead', 'Шапка журнала', 'Masthead')}
          title={<>{t('Muallif', 'Автор', 'The Author')}</>}
          meta={t('Editor-in-chief', 'Главный редактор', 'Editor-in-chief')}
          lede={t(
            'Bir kishilik tahririyat. Strategiya, ma\'lumotlar va ishlaydigan playbook\'lar haqida yoziladi — amaliyotda natija beradigani shu.',
            'Редакция из одного человека. Пишу про стратегию, данные и рабочие плейбуки — то, что реально двигает результат.',
            'A one-person desk. I write about strategy, data, and playbooks that actually ship — because in the field, that is what moves the needle.'
          )}
        />

        {/* Author block */}
        <section className="px-6 md:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 border-b border-[hsl(var(--rule))]">
          <div className="lg:col-span-4">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="w-full aspect-[4/5] object-cover grayscale" />
            ) : (
              <div className="w-full aspect-[4/5] bg-[hsl(var(--ink-2))] flex items-center justify-center">
                <span className="text-7xl font-bold uppercase tracking-tighter text-[#4f46e5]" style={editorial}>{initials}</span>
              </div>
            )}
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              {t('Tasvir — portret', 'Фото — портрет', 'Image — portrait')}
            </p>
          </div>

          <div className="lg:col-span-8 flex flex-col">
            <p className="text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              {authorRole}
            </p>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight leading-[0.95] mb-8" style={editorial}>
              {authorName}
            </h2>
            {authorBio && (
              <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl">{authorBio}</p>
            )}

            {experiences.length > 0 && (
              <div className="border-t border-[hsl(var(--rule))] pt-8 mb-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">
                  {t('Yo\'l xulosalari', 'Послужной список', 'Track Record')}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                  {experiences.map(exp => {
                    const text = language === 'uz' ? exp.text_uz : language === 'ru' ? exp.text_ru : exp.text_en;
                    if (!text) return null;
                    return (
                      <li key={exp.id} className="flex items-start gap-3 text-sm md:text-base text-zinc-300">
                        <CheckCircle className="w-4 h-4 mt-1 text-[#4f46e5] flex-shrink-0" strokeWidth={2} />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="border-t border-[hsl(var(--rule))] pt-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-5">
                  {t('Bog\'lanish kanallari', 'Каналы связи', 'Direct Channels')}
                </p>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-[hsl(var(--rule))] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#4f46e5] hover:border-[#4f46e5] hover:text-white transition-all"
                    >
                      {link.platform} <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Mission */}
        {(missionTitle || missionDesc) && (
          <section className="px-6 md:px-8 py-20 md:py-28 border-b border-[hsl(var(--rule))]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5]">
                  {t('Maqsad', 'Миссия', 'Mission')}
                </p>
              </div>
              <div className="lg:col-span-9">
                {missionTitle && (
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[0.95] mb-6" style={editorial}>
                    {missionTitle}
                  </h2>
                )}
                {missionDesc && (
                  <p className="text-lg md:text-2xl text-zinc-400 leading-relaxed max-w-3xl font-light">{missionDesc}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="px-6 md:px-8 py-16 md:py-20 border-b border-[hsl(var(--rule))]">
            <div className="flex items-end justify-between mb-10">
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter" style={editorial}>
                {t('Sertifikatlar', 'Сертификаты', 'Credentials')}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                {String(certifications.length).padStart(2, '0')} {t('hujjat', 'документов', 'documents')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[hsl(var(--rule))] border border-[hsl(var(--rule))]">
              {certifications.map(cert => (
                <div key={cert.id} className="bg-[hsl(var(--ink))] p-6 flex items-center gap-4">
                  {cert.image_url && (
                    <img src={cert.image_url} alt={cert.name} className="w-12 h-12 object-contain flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold uppercase tracking-tight text-[hsl(var(--paper))] truncate" style={editorial}>{cert.name}</p>
                    {cert.cert_url && (
                      <a href={cert.cert_url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4f46e5] inline-flex items-center gap-1 mt-1 hover:underline">
                        <ExternalLink className="w-3 h-3" /> {t('Tasdiqlash', 'Проверить', 'Verify')}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stats strip */}
        <section className="px-6 md:px-8 py-16 md:py-20 border-b border-[hsl(var(--rule))]">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[hsl(var(--rule))]">
            {[
              { v: stats.posts, l: t('Maqolalar', 'Статей', 'Articles') },
              { v: stats.categories, l: t('Yo\'nalishlar', 'Разделов', 'Sections') },
              { v: 3, l: t('Til', 'Языка', 'Languages') },
              { v: stats.subscribers, l: t('Obunachi', 'Подписчиков', 'Subscribers') },
            ].map((s, i) => (
              <div key={i} className="px-4 md:px-6 first:pl-0">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3">{s.l}</p>
                <p className="text-4xl md:text-6xl font-bold tracking-tighter text-[hsl(var(--paper))]" style={editorial}>
                  {s.v}<span className="text-[#4f46e5]">+</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 md:px-8 py-20 md:py-28 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-4">
              {t('Keyingi qadam', 'Следующий шаг', 'Next move')}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter max-w-2xl" style={editorial}>
              {t('Arxivni o\'qing — bitta yozuvdan boshlang.', 'Откройте архив — начните с одной статьи.', 'Open the archive — start with one piece.')}
            </h2>
          </div>
          <Link to="/blog"
            className="inline-flex items-center gap-2 px-6 py-4 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#4f46e5] hover:text-white transition-all whitespace-nowrap">
            {t('Jurnalga o\'tish', 'К журналу', 'Enter the Journal')} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
