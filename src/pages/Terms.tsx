import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const Terms = () => {
  const { language } = useLanguage();

  const content = {
    uz: {
      title: 'Foydalanish Shartlari',
      lastUpdated: "So'nggi yangilanish: 2024-yil Dekabr",
      sections: [
        {
          title: 'Umumiy shartlar',
          content: "Bu saytdan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz. Agar shartlarga rozi bo'lmasangiz, saytdan foydalanmang."
        },
        {
          title: 'Mualliflik huquqi',
          content: "Saytdagi barcha materiallar mualliflik huquqi bilan himoyalangan. Materiallarni nusxalash yoki tarqatish uchun yozma ruxsat olinishi shart."
        },
        {
          title: "Foydalanuvchi majburiyatlari",
          content: "Foydalanuvchilar qonunga zid kontentni joylashtirish, spam yuborish yoki boshqa foydalanuvchilarga zarar yetkazishdan tiyilishlari shart."
        },
        {
          title: "Javobgarlik chegarasi",
          content: "Sayt ma'muriyati foydalanuvchilar tomonidan joylashtirilgan izohlar uchun javobgar emas."
        }
      ]
    },
    ru: {
      title: 'Условия Использования',
      lastUpdated: 'Последнее обновление: Декабрь 2024',
      sections: [
        {
          title: 'Общие условия',
          content: 'Используя этот сайт, вы соглашаетесь с данными условиями. Если вы не согласны с условиями, не используйте сайт.'
        },
        {
          title: 'Авторские права',
          content: 'Все материалы на сайте защищены авторским правом. Для копирования или распространения материалов требуется письменное разрешение.'
        },
        {
          title: 'Обязанности пользователей',
          content: 'Пользователи обязаны воздерживаться от размещения незаконного контента, спама или нанесения вреда другим пользователям.'
        },
        {
          title: 'Ограничение ответственности',
          content: 'Администрация сайта не несет ответственности за комментарии, размещенные пользователями.'
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: December 2024',
      sections: [
        {
          title: 'General Terms',
          content: 'By using this site, you agree to these terms. If you do not agree to the terms, do not use the site.'
        },
        {
          title: 'Copyright',
          content: 'All materials on the site are protected by copyright. Written permission is required to copy or distribute materials.'
        },
        {
          title: 'User Responsibilities',
          content: 'Users must refrain from posting illegal content, spamming, or harming other users.'
        },
        {
          title: 'Limitation of Liability',
          content: 'Site administration is not responsible for comments posted by users.'
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

export default Terms;