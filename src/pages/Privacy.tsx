import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const Privacy = () => {
  const { language } = useLanguage();

  const content = {
    uz: {
      title: 'Maxfiylik Siyosati',
      lastUpdated: "So'nggi yangilanish: 2024-yil Dekabr",
      sections: [
        {
          title: "Ma'lumotlarni yig'ish",
          content: "Biz foydalanuvchilardan quyidagi ma'lumotlarni yig'amiz: email manzil (obuna uchun), IP manzil (analitika uchun), cookie fayllar (foydalanuvchi tajribasini yaxshilash uchun)."
        },
        {
          title: "Ma'lumotlardan foydalanish",
          content: "Yig'ilgan ma'lumotlar faqat xizmatlarimizni yaxshilash, yangiliklar yuborish va sayt statistikasini tahlil qilish uchun ishlatiladi."
        },
        {
          title: "Ma'lumotlar xavfsizligi",
          content: "Barcha shaxsiy ma'lumotlar shifrlangan holda saqlanadi va uchinchi shaxslarga berilmaydi."
        },
        {
          title: "Cookie siyosati",
          content: "Saytimiz cookie fayllardan foydalanadi. Siz brauzer sozlamalarida cookie fayllarni o'chirib qo'yishingiz mumkin."
        }
      ]
    },
    ru: {
      title: 'Политика Конфиденциальности',
      lastUpdated: 'Последнее обновление: Декабрь 2024',
      sections: [
        {
          title: 'Сбор данных',
          content: 'Мы собираем следующие данные от пользователей: email адрес (для подписки), IP адрес (для аналитики), файлы cookie (для улучшения пользовательского опыта).'
        },
        {
          title: 'Использование данных',
          content: 'Собранные данные используются только для улучшения наших услуг, отправки новостей и анализа статистики сайта.'
        },
        {
          title: 'Безопасность данных',
          content: 'Все персональные данные хранятся в зашифрованном виде и не передаются третьим лицам.'
        },
        {
          title: 'Политика Cookie',
          content: 'Наш сайт использует файлы cookie. Вы можете отключить cookie в настройках браузера.'
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: December 2024',
      sections: [
        {
          title: 'Data Collection',
          content: 'We collect the following information from users: email address (for subscriptions), IP address (for analytics), cookies (for improving user experience).'
        },
        {
          title: 'Data Usage',
          content: 'Collected data is used only to improve our services, send newsletters, and analyze site statistics.'
        },
        {
          title: 'Data Security',
          content: 'All personal data is stored encrypted and is not shared with third parties.'
        },
        {
          title: 'Cookie Policy',
          content: 'Our site uses cookies. You can disable cookies in your browser settings.'
        }
      ]
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-muted-foreground mb-8">{t.lastUpdated}</p>
          
          <div className="space-y-8">
            {t.sections.map((section, index) => (
              <section key={index}>
                <h2 className="font-display text-2xl font-semibold mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;