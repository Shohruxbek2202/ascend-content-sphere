import { Link } from 'react-router-dom';
import { Users, Target, Award, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { language } = useLanguage();

  const content = {
    uz: {
      title: 'Biz Haqimizda',
      subtitle: 'Digital marketing va shaxsiy rivojlanish sohasida professional bilim va tajribalar ulashuvchi platforma',
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
          description: 'Professional marketologlar jamiyatini shakllantiramiz va ulashuvlarni qo\'llab-quvvatlaymiz.',
        },
        {
          icon: Award,
          title: 'Innovatsiya',
          description: 'Eng so\'nggi tendentsiyalar va strategiyalarni doimiy ravishda o\'rganamiz va ulashib boramiz.',
        },
      ],
      cta: 'Blogni ko\'rish',
    },
    ru: {
      title: 'О Нас',
      subtitle: 'Платформа для обмена профессиональными знаниями и опытом в области цифрового маркетинга и личного развития',
      mission: {
        title: 'Наша Миссия',
        description: 'Помогать маркетологам и предпринимателям расти, делясь профессиональными знаниями о современных маркетинговых стратегиях и личном развитии.',
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
          description: 'Формируем профессиональное сообщество маркетологов и поддерживаем обмен опытом.',
        },
        {
          icon: Award,
          title: 'Инновации',
          description: 'Постоянно изучаем и делимся новейшими трендами и стратегиями.',
        },
      ],
      cta: 'Смотреть блог',
    },
    en: {
      title: 'About Us',
      subtitle: 'A platform for sharing professional knowledge and experience in digital marketing and personal development',
      mission: {
        title: 'Our Mission',
        description: 'To help marketers and entrepreneurs grow by sharing professional knowledge about modern marketing strategies and personal development.',
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
          description: 'We build a professional community of marketers and support knowledge sharing.',
        },
        {
          icon: Award,
          title: 'Innovation',
          description: 'We constantly learn and share the latest trends and strategies.',
        },
      ],
      cta: 'View Blog',
    },
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              {currentContent.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {currentContent.subtitle}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-muted/30 py-16 mb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                {currentContent.mission.title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {currentContent.mission.description}
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentContent.values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent mb-4">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-br from-primary via-accent to-secondary py-16 mb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <div className="text-white/80">
                  {language === 'uz' && 'Maqolalar'}
                  {language === 'ru' && 'Статей'}
                  {language === 'en' && 'Articles'}
                </div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
                <div className="text-white/80">
                  {language === 'uz' && 'O\'quvchilar'}
                  {language === 'ru' && 'Читателей'}
                  {language === 'en' && 'Readers'}
                </div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">3</div>
                <div className="text-white/80">
                  {language === 'uz' && 'Tillar'}
                  {language === 'ru' && 'Языка'}
                  {language === 'en' && 'Languages'}
                </div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
                <div className="text-white/80">
                  {language === 'uz' && 'Obunchilar'}
                  {language === 'ru' && 'Подписчиков'}
                  {language === 'en' && 'Subscribers'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              {language === 'uz' && 'Bizga qo\'shiling!'}
              {language === 'ru' && 'Присоединяйтесь к нам!'}
              {language === 'en' && 'Join us!'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {language === 'uz' && 'Eng so\'nggi maqolalar va qo\'llanmalarni o\'qing'}
              {language === 'ru' && 'Читайте последние статьи и руководства'}
              {language === 'en' && 'Read the latest articles and guides'}
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 group"
              asChild
            >
              <Link to="/blog">
                {currentContent.cta}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
