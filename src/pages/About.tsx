import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Award, ArrowRight, BookOpen, FolderOpen, Globe, Briefcase, GraduationCap, CheckCircle, Linkedin, Mail } from 'lucide-react';
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

  useEffect(() => {
    const fetchStats = async () => {
      const [postsCount, categoriesCount, subscribersCount] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('active', true),
      ]);

      setStats({
        posts: postsCount.count || 0,
        categories: categoriesCount.count || 0,
        subscribers: subscribersCount.count || 0,
      });
    };

    fetchStats();
  }, []);

  const content = {
    uz: {
      title: 'Biz Haqimizda',
      subtitle: 'Digital marketing va shaxsiy rivojlanish sohasida professional bilim va tajribalar ulashuvchi platforma',
      authorSection: {
        title: 'Muallif Haqida',
        name: 'Shohruxbek Fayzullayev',
        role: 'Digital Marketing Mutaxassisi & SEO Eksperti',
        bio: 'Men 5+ yillik tajribaga ega professional digital marketolog va SEO ekspertiman. Google Ads, Meta Ads, va qidiruv tizimlarini optimallashtirish sohasida 100+ muvaffaqiyatli loyihalarni amalga oshirganman. Mening maqsadim — O\'zbekistonda digital marketing madaniyatini rivojlantirish va professional bilimlarni ulashish.',
        experience: [
          '5+ yillik digital marketing tajribasi',
          '100+ muvaffaqiyatli SEO loyihalari',
          'Google Ads & Meta Ads sertifikatlari',
          'O\'zbekistondagi yirik brendlar bilan hamkorlik'
        ],
        certifications: 'Sertifikatlar',
        certList: [
          'Google Ads Search Certification',
          'Google Analytics Individual Qualification',
          'HubSpot Inbound Marketing Certification',
          'Meta Blueprint Certification'
        ]
      },
      mission: {
        title: 'Bizning Maqsadimiz',
        description: 'Zamonaviy marketing strategiyalari va shaxsiy rivojlanish bo\'yicha professional bilimlarni ulashish orqali marketologlar va tadbirkorlarning o\'sishiga yordam berish.',
      },
      values: [
        {
          icon: Target,
          title: 'Sifat',
          description: 'Faqat tekshirilgan va amaliy jihatdan qimmatli kontentni taqdim etamiz.',
        },
        {
          icon: Users,
          title: 'Jamiyat',
          description: 'Professional marketologlar jamiyatini shakllantiramiz.',
        },
        {
          icon: Award,
          title: 'Innovatsiya',
          description: 'Eng so\'nggi tendentsiyalarni doimiy ravishda o\'rganamiz.',
        },
      ],
      cta: 'Blogni ko\'rish',
      join: 'Bizga qo\'shiling!',
      joinDesc: 'Eng so\'nggi maqolalar va qo\'llanmalarni o\'qing',
      stats: { posts: 'Maqolalar', categories: 'Kategoriyalar', languages: 'Tillar', subscribers: 'Obunachilar' }
    },
    ru: {
      title: 'О Нас',
      subtitle: 'Платформа для обмена профессиональными знаниями о цифровом маркетинге и личном развитии',
      authorSection: {
        title: 'Об Авторе',
        name: 'Шохрухбек Файзуллаев',
        role: 'Специалист по Digital Marketing & SEO Эксперт',
        bio: 'Я профессиональный digital маркетолог и SEO эксперт с опытом более 5 лет. Реализовал более 100 успешных проектов в области Google Ads, Meta Ads и поисковой оптимизации. Моя цель — развивать культуру digital маркетинга в Узбекистане и делиться профессиональными знаниями.',
        experience: [
          '5+ лет опыта в digital маркетинге',
          '100+ успешных SEO проектов',
          'Сертификаты Google Ads & Meta Ads',
          'Сотрудничество с крупными брендами Узбекистана'
        ],
        certifications: 'Сертификаты',
        certList: [
          'Google Ads Search Certification',
          'Google Analytics Individual Qualification',
          'HubSpot Inbound Marketing Certification',
          'Meta Blueprint Certification'
        ]
      },
      mission: {
        title: 'Наша Миссия',
        description: 'Помогать маркетологам и предпринимателям расти, делясь профессиональными знаниями о современных маркетинговых стратегиях.',
      },
      values: [
        {
          icon: Target,
          title: 'Качество',
          description: 'Предоставляем только проверенный и практически ценный контент.',
        },
        {
          icon: Users,
          title: 'Сообщество',
          description: 'Формируем профессиональное сообщество маркетологов.',
        },
        {
          icon: Award,
          title: 'Инновации',
          description: 'Постоянно изучаем новейшие тренды и стратегии.',
        },
      ],
      cta: 'Смотреть блог',
      join: 'Присоединяйтесь!',
      joinDesc: 'Читайте последние статьи и руководства',
      stats: { posts: 'Статей', categories: 'Категории', languages: 'Языка', subscribers: 'Подписчиков' }
    },
    en: {
      title: 'About Us',
      subtitle: 'A platform for sharing professional knowledge in digital marketing and personal development',
      authorSection: {
        title: 'About the Author',
        name: 'Shohruxbek Fayzullayev',
        role: 'Digital Marketing Specialist & SEO Expert',
        bio: 'I am a professional digital marketer and SEO expert with over 5 years of experience. I have successfully completed 100+ projects in Google Ads, Meta Ads, and search engine optimization. My goal is to develop the digital marketing culture in Uzbekistan and share professional knowledge.',
        experience: [
          '5+ years of digital marketing experience',
          '100+ successful SEO projects',
          'Google Ads & Meta Ads certified',
          'Collaboration with major brands in Uzbekistan'
        ],
        certifications: 'Certifications',
        certList: [
          'Google Ads Search Certification',
          'Google Analytics Individual Qualification',
          'HubSpot Inbound Marketing Certification',
          'Meta Blueprint Certification'
        ]
      },
      mission: {
        title: 'Our Mission',
        description: 'To help marketers and entrepreneurs grow by sharing professional knowledge about modern marketing strategies.',
      },
      values: [
        {
          icon: Target,
          title: 'Quality',
          description: 'We provide only verified and practically valuable content.',
        },
        {
          icon: Users,
          title: 'Community',
          description: 'We build a professional community of marketers.',
        },
        {
          icon: Award,
          title: 'Innovation',
          description: 'We constantly learn and share the latest trends.',
        },
      ],
      cta: 'View Blog',
      join: 'Join us!',
      joinDesc: 'Read the latest articles and guides',
      stats: { posts: 'Articles', categories: 'Categories', languages: 'Languages', subscribers: 'Subscribers' }
    },
  };

  const t = content[language];

  const seoTitle = language === 'uz' 
    ? 'Biz Haqimizda | ShohruxDigital'
    : language === 'ru'
    ? 'О Нас | ShohruxDigital'
    : 'About Us | ShohruxDigital';

  const seoDescription = language === 'uz'
    ? 'Digital marketing va shaxsiy rivojlanish sohasida professional bilim va tajribalar ulashuvchi platforma'
    : language === 'ru'
    ? 'Платформа для обмена профессиональными знаниями о цифровом маркетинге и личном развитии'
    : 'A platform for sharing professional knowledge in digital marketing and personal development';

  const statItems = [
    { icon: BookOpen, value: stats.posts, label: t.stats.posts },
    { icon: FolderOpen, value: stats.categories, label: t.stats.categories },
    { icon: Globe, value: 3, label: t.stats.languages },
    { icon: Users, value: stats.subscribers, label: t.stats.subscribers },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        type="website"
      />
      <BreadcrumbJsonLd items={[{ name: language === 'uz' ? 'Biz Haqimizda' : language === 'ru' ? 'О Нас' : 'About Us', url: '/about' }]} />
      <Header />

      <main className="relative pt-20 pb-12">
        {/* Liquid Glass Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-secondary/20 via-secondary/5 to-transparent blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-0 w-[350px] h-[350px] rounded-full bg-gradient-to-bl from-primary/15 via-primary/5 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero Section */}
          <section className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              {t.subtitle}
            </p>
          </section>

          {/* Author Section - E-E-A-T Critical */}
          <section className="max-w-4xl mx-auto mb-12">
            <div className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Author Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-xl">
                    SF
                  </div>
                </div>
                
                {/* Author Info */}
                <div className="flex-1">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {t.authorSection.name}
                  </h2>
                  <p className="text-secondary font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {t.authorSection.role}
                  </p>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {t.authorSection.bio}
                  </p>
                  
                  {/* Experience Points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {t.authorSection.experience.map((exp, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-foreground">{exp}</span>
                      </div>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-3">
                    <a 
                      href="https://linkedin.com/in/shohruxbek" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors text-sm font-medium"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                    <a 
                      href="mailto:shohruxbek@shohruxdigital.com"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-sm font-medium"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                  {t.authorSection.certifications}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {t.authorSection.certList.map((cert, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-sm font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Mission Section - Liquid Glass */}
          <section className="max-w-3xl mx-auto mb-12">
            <div className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl p-6 md:p-8 text-center">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                {t.mission.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t.mission.description}
              </p>
            </div>
          </section>

          {/* Values Section - Liquid Glass Cards */}
          <section className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {t.values.map((value, index) => (
                <div 
                  key={index} 
                  className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg p-5 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <value.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats Section - Liquid Glass */}
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

          {/* CTA Section */}
          <section className="max-w-xl mx-auto text-center">
            <div className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {t.join}
              </h2>
              <p className="text-muted-foreground mb-5">
                {t.joinDesc}
              </p>
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl font-semibold shadow-lg shadow-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/30"
                asChild
              >
                <Link to="/blog" className="flex items-center gap-2">
                  {t.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
