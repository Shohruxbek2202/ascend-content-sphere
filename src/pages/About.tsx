import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Award, ArrowRight, BookOpen, FolderOpen, Globe, Briefcase, GraduationCap, CheckCircle, ExternalLink } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

interface Stats {
  posts: number;
  categories: number;
  subscribers: number;
}

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

      setStats({
        posts: postsCount.count || 0,
        categories: categoriesCount.count || 0,
        subscribers: subscribersCount.count || 0,
      });

      const map: Record<string, { uz: string; ru: string; en: string }> = {};
      (settingsRes.data || []).forEach((s: any) => {
        map[s.key] = { uz: s.value_uz || '', ru: s.value_ru || '', en: s.value_en || '' };
      });
      setAboutSettings(map);
      setCertifications(certsRes.data || []);
      setSocialLinks(socialsRes.data || []);
      setExperiences(expRes.data || []);
    };

    fetchAll();
  }, []);

  const getSetting = (key: string) => {
    const s = aboutSettings[key];
    if (!s) return '';
    return s[language] || s.uz || '';
  };

  const authorName = getSetting('author_name') || 'Shohruxbek Fayzullayev';
  const authorRole = getSetting('author_role') || 'Digital Marketing Specialist';
  const authorBio = getSetting('author_bio') || '';
  const authorAvatar = getSetting('author_avatar_url') || '';
  const missionTitle = getSetting('mission_title');
  const missionDesc = getSetting('mission_description');

  // Fallback static labels
  const labels = {
    uz: {
      title: 'Biz Haqimizda', subtitle: 'Digital marketing va shaxsiy rivojlanish sohasida professional bilim va tajribalar ulashuvchi platforma',
      certTitle: 'Sertifikatlar', cta: 'Blogni ko\'rish', join: 'Bizga qo\'shiling!', joinDesc: 'Eng so\'nggi maqolalar va qo\'llanmalarni o\'qing',
      stats: { posts: 'Maqolalar', categories: 'Kategoriyalar', languages: 'Tillar', subscribers: 'Obunachilar' },
      missionFallback: 'Bizning Maqsadimiz',
      values: [
        { icon: Target, title: 'Sifat', description: 'Faqat tekshirilgan va amaliy jihatdan qimmatli kontentni taqdim etamiz.' },
        { icon: Users, title: 'Jamiyat', description: 'Professional marketologlar jamiyatini shakllantiramiz.' },
        { icon: Award, title: 'Innovatsiya', description: 'Eng so\'nggi tendentsiyalarni doimiy ravishda o\'rganamiz.' },
      ],
    },
    ru: {
      title: 'О Нас', subtitle: 'Платформа для обмена профессиональными знаниями о цифровом маркетинге и личном развитии',
      certTitle: 'Сертификаты', cta: 'Смотреть блог', join: 'Присоединяйтесь!', joinDesc: 'Читайте последние статьи и руководства',
      stats: { posts: 'Статей', categories: 'Категории', languages: 'Языка', subscribers: 'Подписчиков' },
      missionFallback: 'Наша Миссия',
      values: [
        { icon: Target, title: 'Качество', description: 'Предоставляем только проверенный и практически ценный контент.' },
        { icon: Users, title: 'Сообщество', description: 'Формируем профессиональное сообщество маркетологов.' },
        { icon: Award, title: 'Инновации', description: 'Постоянно изучаем новейшие тренды и стратегии.' },
      ],
    },
    en: {
      title: 'About Us', subtitle: 'A platform for sharing professional knowledge in digital marketing and personal development',
      certTitle: 'Certifications', cta: 'View Blog', join: 'Join us!', joinDesc: 'Read the latest articles and guides',
      stats: { posts: 'Articles', categories: 'Categories', languages: 'Languages', subscribers: 'Subscribers' },
      missionFallback: 'Our Mission',
      values: [
        { icon: Target, title: 'Quality', description: 'We provide only verified and practically valuable content.' },
        { icon: Users, title: 'Community', description: 'We build a professional community of marketers.' },
        { icon: Award, title: 'Innovation', description: 'We constantly learn and share the latest trends.' },
      ],
    },
  };

  const t = labels[language];

  const seoTitle = `${t.title} | ShohruxDigital`;
  const seoDescription = t.subtitle;

  const statItems = [
    { icon: BookOpen, value: stats.posts, label: t.stats.posts },
    { icon: FolderOpen, value: stats.categories, label: t.stats.categories },
    { icon: Globe, value: 3, label: t.stats.languages },
    { icon: Users, value: stats.subscribers, label: t.stats.subscribers },
  ];

  const initials = authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={seoTitle} description={seoDescription} url={typeof window !== 'undefined' ? window.location.href : ''} type="website" />
      <BreadcrumbJsonLd items={[{ name: t.title, url: '/about' }]} />
      <Header />

      <main className="relative pt-20 pb-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-secondary/20 via-secondary/5 to-transparent blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-0 w-[350px] h-[350px] rounded-full bg-gradient-to-bl from-primary/15 via-primary/5 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero */}
          <section className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t.title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground">{t.subtitle}</p>
          </section>

          {/* Author Section */}
          <section className="max-w-4xl mx-auto mb-12">
            <div className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  {authorAvatar ? (
                    <img src={authorAvatar} alt={authorName} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-xl" />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-xl">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">{authorName}</h2>
                  <p className="text-secondary font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />{authorRole}
                  </p>
                  {authorBio && <p className="text-muted-foreground mb-4 leading-relaxed">{authorBio}</p>}

                  {/* Experience from DB */}
                  {experiences.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {experiences.map(exp => {
                        const text = language === 'uz' ? exp.text_uz : language === 'ru' ? exp.text_ru : exp.text_en;
                        if (!text) return null;
                        return (
                          <div key={exp.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-foreground">{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Social Links from DB */}
                  {socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {socialLinks.map(link => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-sm font-medium"
                        >
                          {link.platform}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Certifications from DB */}
              {certifications.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-secondary" />{t.certTitle}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {certifications.map(cert => (
                      <div key={cert.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                        {cert.image_url && (
                          <img src={cert.image_url} alt={cert.name} className="h-10 w-10 rounded object-contain flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{cert.name}</p>
                          {cert.cert_url && (
                            <a href={cert.cert_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                              <ExternalLink className="w-3 h-3" /> Tasdiqlash
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Mission */}
          <section className="max-w-3xl mx-auto mb-12">
            <div className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl p-6 md:p-8 text-center">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                {missionTitle || t.missionFallback}
              </h2>
              {missionDesc && <p className="text-muted-foreground text-lg">{missionDesc}</p>}
            </div>
          </section>

          {/* Values */}
          <section className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {t.values.map((value, index) => (
                <div key={index} className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg p-5 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <value.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="max-w-4xl mx-auto mb-12">
            <div className="rounded-2xl bg-foreground/95 backdrop-blur-xl shadow-2xl p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-background">
                {statItems.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center mb-2">
                      <stat.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold">{stat.value}+</div>
                    <div className="text-sm text-background/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="max-w-xl mx-auto text-center">
            <div className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">{t.join}</h2>
              <p className="text-muted-foreground mb-5">{t.joinDesc}</p>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl font-semibold shadow-lg shadow-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/30" asChild>
                <Link to="/blog" className="flex items-center gap-2">{t.cta}<ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
