import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const Privacy = () => {
  const { language } = useLanguage();

  const content = {
    uz: {
      title: 'Maxfiylik Siyosati',
      lastUpdated: "So'nggi yangilanish: 2026-yil Mart",
      sections: [
        {
          title: 'Kirish',
          content: 'ShohruxDigital (https://shohruxdigital.uz) saytiga xush kelibsiz. Biz foydalanuvchilarimizning maxfiyligini hurmat qilamiz va shaxsiy ma\'lumotlaringizni himoya qilishga intilamiz. Ushbu maxfiylik siyosati saytimizda qanday ma\'lumotlar yig\'ilishi, ulardan qanday foydalanilishi va himoya qilinishini tushuntiradi.'
        },
        {
          title: "Yig'iladigan ma'lumotlar",
          content: "Biz quyidagi turdagi ma'lumotlarni yig'amiz:\n\n• Shaxsiy ma'lumotlar: Email manzil (newsletter obunasi uchun), ism (aloqa formasi orqali yuborilganda), izohlarni joylashtirish uchun kiritilgan ma'lumotlar.\n• Avtomatik yig'iladigan ma'lumotlar: IP manzil, brauzer turi, qurilma ma'lumotlari, sahifa ko'rishlari, saytda o'tkazilgan vaqt — analitika xizmatlari orqali.\n• Cookie fayllar: Foydalanuvchi tajribasini yaxshilash, til sozlamalarini saqlash va sayt statistikasini o'rganish uchun."
        },
        {
          title: "Ma'lumotlardan foydalanish maqsadi",
          content: "Yig'ilgan ma'lumotlar quyidagi maqsadlarda ishlatiladi:\n\n• Sayt xizmatlarini ta'minlash va yaxshilash\n• Newsletter va yangiliklar yuborish (faqat rozilik bilan)\n• Sayt trafigi va foydalanuvchi xatti-harakatlarini tahlil qilish\n• Foydalanuvchi so'rovlari va izohlariga javob berish\n• Reklama kontentini moslashtirish (Google AdSense orqali)"
        },
        {
          title: 'Google AdSense va uchinchi tomon reklamalari',
          content: "Saytimizda Google AdSense xizmati orqali reklamalar ko'rsatilishi mumkin. Google va uning hamkorlari cookie fayllar va web beacon texnologiyalaridan foydalanib, foydalanuvchilarga mos reklamalarni ko'rsatadi. Google'ning DART cookie fayli foydalanuvchilarning saytimizga va boshqa saytlarga tashriflariga asoslanadi. Foydalanuvchilar Google'ning reklama sozlamalari sahifasida (https://adssettings.google.com) DART cookie faylini o'chirib qo'yishlari mumkin."
        },
        {
          title: "Ma'lumotlar xavfsizligi",
          content: "Barcha shaxsiy ma'lumotlar zamonaviy shifrlash texnologiyalari (SSL/TLS) yordamida himoyalangan. Ma'lumotlar uchinchi shaxslarga sotilmaydi yoki ruxsatsiz berilmaydi. Faqat qonun tomonidan talab qilingan holatlarda ma'lumotlar oshkor etilishi mumkin."
        },
        {
          title: "Foydalanuvchi huquqlari",
          content: "Siz quyidagi huquqlarga egasiz:\n\n• O'z shaxsiy ma'lumotlaringizni ko'rish, tahrirlash yoki o'chirish huquqi\n• Newsletter obunasidan istalgan vaqtda chiqish huquqi\n• Cookie fayllarni brauzer sozlamalarida boshqarish huquqi\n\nShu maqsadda bizga contact@shohruxdigital.uz manzili orqali murojaat qilishingiz mumkin."
        },
        {
          title: "O'zgarishlar",
          content: "Biz ushbu maxfiylik siyosatini vaqti-vaqti bilan yangilashimiz mumkin. Har qanday o'zgarish ushbu sahifada e'lon qilinadi."
        }
      ]
    },
    ru: {
      title: 'Политика Конфиденциальности',
      lastUpdated: 'Последнее обновление: Март 2026',
      sections: [
        {
          title: 'Введение',
          content: 'Добро пожаловать на ShohruxDigital (https://shohruxdigital.uz). Мы уважаем конфиденциальность наших пользователей и стремимся защитить ваши персональные данные. Настоящая политика конфиденциальности объясняет, какие данные собираются на нашем сайте, как они используются и защищаются.'
        },
        {
          title: 'Собираемые данные',
          content: 'Мы собираем следующие типы данных:\n\n• Персональные данные: email адрес (для подписки на рассылку), имя (при отправке через контактную форму), данные для публикации комментариев.\n• Автоматически собираемые данные: IP адрес, тип браузера, информация об устройстве, просмотры страниц, время на сайте — через аналитические сервисы.\n• Файлы cookie: для улучшения пользовательского опыта, сохранения языковых настроек и изучения статистики сайта.'
        },
        {
          title: 'Цели использования данных',
          content: 'Собранные данные используются для следующих целей:\n\n• Предоставление и улучшение услуг сайта\n• Отправка рассылки и новостей (только с согласия)\n• Анализ трафика и поведения пользователей\n• Ответы на запросы и комментарии пользователей\n• Персонализация рекламного контента (через Google AdSense)'
        },
        {
          title: 'Google AdSense и сторонняя реклама',
          content: 'На нашем сайте может отображаться реклама через сервис Google AdSense. Google и его партнеры используют cookie файлы и технологии web beacon для показа релевантной рекламы. Cookie файл DART от Google основан на посещениях пользователей нашего и других сайтов. Пользователи могут отключить cookie DART на странице настроек рекламы Google (https://adssettings.google.com).'
        },
        {
          title: 'Безопасность данных',
          content: 'Все персональные данные защищены современными технологиями шифрования (SSL/TLS). Данные не продаются и не передаются третьим лицам без разрешения. Раскрытие данных возможно только в случаях, предусмотренных законом.'
        },
        {
          title: 'Права пользователей',
          content: 'Вы имеете следующие права:\n\n• Право просматривать, редактировать или удалять свои персональные данные\n• Право отписаться от рассылки в любое время\n• Право управлять cookie файлами в настройках браузера\n\nДля этого свяжитесь с нами по адресу contact@shohruxdigital.uz.'
        },
        {
          title: 'Изменения',
          content: 'Мы можем периодически обновлять настоящую политику конфиденциальности. Любые изменения будут опубликованы на этой странице.'
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: March 2026',
      sections: [
        {
          title: 'Introduction',
          content: 'Welcome to ShohruxDigital (https://shohruxdigital.uz). We respect the privacy of our users and are committed to protecting your personal information. This privacy policy explains what data is collected on our site, how it is used, and how it is protected.'
        },
        {
          title: 'Information We Collect',
          content: 'We collect the following types of information:\n\n• Personal Information: Email address (for newsletter subscriptions), name (when submitted through the contact form), and data provided when posting comments.\n• Automatically Collected Information: IP address, browser type, device information, page views, and time spent on the site — through analytics services.\n• Cookies: To improve user experience, save language preferences, and analyze site statistics.'
        },
        {
          title: 'How We Use Your Information',
          content: 'Collected data is used for the following purposes:\n\n• Providing and improving site services\n• Sending newsletters and updates (only with consent)\n• Analyzing site traffic and user behavior\n• Responding to user inquiries and comments\n• Personalizing advertising content (via Google AdSense)'
        },
        {
          title: 'Google AdSense and Third-Party Advertising',
          content: 'Our site may display advertisements through Google AdSense. Google and its partners use cookies and web beacon technologies to serve relevant ads to users. Google\'s DART cookie is based on users\' visits to our site and other sites. Users can opt out of the DART cookie on Google\'s ad settings page (https://adssettings.google.com). We may also use third-party advertising companies that use cookies to serve ads based on your prior visits to our website and other websites.'
        },
        {
          title: 'Data Security',
          content: 'All personal data is protected using modern encryption technologies (SSL/TLS). Data is not sold or shared with third parties without permission. Data may only be disclosed in cases required by law.'
        },
        {
          title: 'Your Rights',
          content: 'You have the following rights:\n\n• The right to view, edit, or delete your personal data\n• The right to unsubscribe from newsletters at any time\n• The right to manage cookies in your browser settings\n\nTo exercise these rights, contact us at contact@shohruxdigital.uz.'
        },
        {
          title: 'Children\'s Privacy',
          content: 'Our site is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a child, please contact us immediately.'
        },
        {
          title: 'Changes to This Policy',
          content: 'We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.'
        }
      ]
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={language === 'uz' ? 'Maxfiylik Siyosati | ShohruxDigital' : language === 'ru' ? 'Политика Конфиденциальности | ShohruxDigital' : 'Privacy Policy | ShohruxDigital'}
        description={language === 'uz' ? 'ShohruxDigital maxfiylik siyosati — ma\'lumotlaringiz qanday himoyalanadi' : language === 'ru' ? 'Политика конфиденциальности ShohruxDigital — как защищены ваши данные' : 'ShohruxDigital privacy policy — learn how your data is collected, used, and protected'}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        type="website"
      />
      <BreadcrumbJsonLd items={[{ name: language === 'uz' ? 'Maxfiylik Siyosati' : language === 'ru' ? 'Конфиденциальность' : 'Privacy Policy', url: '/privacy' }]} />
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-muted-foreground mb-8">{t.lastUpdated}</p>
          
          <div className="space-y-8">
            {t.sections.map((section, index) => (
              <section key={index}>
                <h2 className="font-display text-2xl font-semibold mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
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
