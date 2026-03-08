import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const Terms = () => {
  const { language } = useLanguage();

  const content = {
    uz: {
      title: 'Foydalanish Shartlari',
      lastUpdated: "So'nggi yangilanish: 2026-yil Mart",
      sections: [
        {
          title: 'Umumiy shartlar',
          content: "ShohruxDigital (https://shohruxdigital.uz) saytidan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz. Agar shartlarga rozi bo'lmasangiz, iltimos saytdan foydalanmang. Biz ushbu shartlarni istalgan vaqtda o'zgartirish huquqini saqlaymiz."
        },
        {
          title: 'Mualliflik huquqi va intellektual mulk',
          content: "Saytdagi barcha materiallar — maqolalar, rasmlar, dizayn, logotip va boshqa kontent — ShohruxDigital va/yoki Shohruxbek Foziljonovning intellektual mulki hisoblanadi. Materiallarni nusxalash, tarqatish yoki qayta nashr etish uchun yozma ruxsat olinishi shart. Iqtibos keltirish uchun manba ko'rsatilishi va saytga havola berilishi majburiy."
        },
        {
          title: "Foydalanuvchi majburiyatlari",
          content: "Foydalanuvchilar quyidagilarga amal qilishlari shart:\n\n• Qonunga zid kontentni joylashtirmaslik\n• Spam yubormaslik yoki boshqa foydalanuvchilarga zarar yetkazmaslik\n• Saytning texnik infratuzilmasiga zarar yetkazmaslik\n• Soxta yoki chalg'ituvchi ma'lumotlar tarqatmaslik\n• Boshqa foydalanuvchilarning shaxsiy ma'lumotlarini yig'maslik"
        },
        {
          title: 'Izohlar va foydalanuvchi kontenti',
          content: "Foydalanuvchilar tomonidan joylashtirilgan izohlar moderatsiyadan o'tadi. Biz quyidagi kontentni o'chirish yoki rad etish huquqini saqlaymiz:\n\n• Haqoratli, kamsituvchi yoki zo'ravonlikka undovchi kontentni\n• Spam yoki reklama xarakteridagi kontentni\n• Boshqalarning mualliflik huquqlarini buzuvchi kontentni"
        },
        {
          title: "Javobgarlik chegarasi",
          content: "Saytdagi ma'lumotlar faqat axborot maqsadida taqdim etiladi va professional maslahat o'rnini bosmaydi. ShohruxDigital saytdagi materiallardan foydalanish natijasida yuzaga kelgan har qanday zarar uchun javobgar emas. Uchinchi tomon saytlarga havolalar uchun javobgarlik o'sha saytlarga tegishli."
        },
        {
          title: 'Reklama va hamkorlik',
          content: "Saytda Google AdSense va boshqa reklama tarmoqlari orqali reklamalar ko'rsatilishi mumkin. Reklama kontenti sayt ma'muriyatining fikrini aks ettirmaydi. Biz reklamadorlar tomonidan taqdim etilgan mahsulot va xizmatlar uchun javobgar emasmiz."
        },
        {
          title: "Nizolarni hal qilish",
          content: "Ushbu shartlar bilan bog'liq har qanday nizo O'zbekiston Respublikasi qonunchiligiga muvofiq hal qilinadi."
        }
      ]
    },
    ru: {
      title: 'Условия Использования',
      lastUpdated: 'Последнее обновление: Март 2026',
      sections: [
        {
          title: 'Общие условия',
          content: 'Используя сайт ShohruxDigital (https://shohruxdigital.uz), вы соглашаетесь с данными условиями. Если вы не согласны с условиями, пожалуйста, не используйте сайт. Мы оставляем за собой право изменять данные условия в любое время.'
        },
        {
          title: 'Авторские права и интеллектуальная собственность',
          content: 'Все материалы на сайте — статьи, изображения, дизайн, логотип и прочий контент — являются интеллектуальной собственностью ShohruxDigital и/или Шохрухбека Фозилжонова. Для копирования, распространения или переиздания материалов требуется письменное разрешение. При цитировании обязательно указание источника и ссылка на сайт.'
        },
        {
          title: 'Обязанности пользователей',
          content: 'Пользователи обязаны соблюдать следующие правила:\n\n• Не размещать незаконный контент\n• Не отправлять спам и не причинять вред другим пользователям\n• Не наносить ущерб технической инфраструктуре сайта\n• Не распространять ложную или вводящую в заблуждение информацию\n• Не собирать персональные данные других пользователей'
        },
        {
          title: 'Комментарии и пользовательский контент',
          content: 'Комментарии, размещенные пользователями, проходят модерацию. Мы оставляем за собой право удалять или отклонять:\n\n• Оскорбительный, унизительный или призывающий к насилию контент\n• Спам или рекламный контент\n• Контент, нарушающий авторские права других лиц'
        },
        {
          title: 'Ограничение ответственности',
          content: 'Информация на сайте предоставляется исключительно в информационных целях и не заменяет профессиональную консультацию. ShohruxDigital не несет ответственности за любой ущерб, возникший в результате использования материалов сайта. Ответственность за ссылки на сторонние сайты несут соответствующие сайты.'
        },
        {
          title: 'Реклама и партнерство',
          content: 'На сайте может отображаться реклама через Google AdSense и другие рекламные сети. Рекламный контент не отражает мнение администрации сайта. Мы не несем ответственности за товары и услуги, предоставляемые рекламодателями.'
        },
        {
          title: 'Разрешение споров',
          content: 'Любые споры, связанные с настоящими условиями, разрешаются в соответствии с законодательством Республики Узбекистан.'
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: March 2026',
      sections: [
        {
          title: 'General Terms',
          content: 'By using ShohruxDigital (https://shohruxdigital.uz), you agree to these terms. If you do not agree, please do not use the site. We reserve the right to modify these terms at any time without prior notice.'
        },
        {
          title: 'Copyright and Intellectual Property',
          content: 'All materials on the site — articles, images, design, logo, and other content — are the intellectual property of ShohruxDigital and/or Shohruxbek Foziljonov. Written permission is required to copy, distribute, or republish any materials. When quoting, proper attribution and a link to the site are mandatory.'
        },
        {
          title: 'User Responsibilities',
          content: 'Users must adhere to the following rules:\n\n• Do not post illegal content\n• Do not send spam or harm other users\n• Do not damage the site\'s technical infrastructure\n• Do not distribute false or misleading information\n• Do not collect personal data of other users'
        },
        {
          title: 'Comments and User-Generated Content',
          content: 'Comments posted by users are subject to moderation. We reserve the right to remove or reject:\n\n• Offensive, degrading, or violence-promoting content\n• Spam or promotional content\n• Content that infringes on the copyrights of others'
        },
        {
          title: 'Limitation of Liability',
          content: 'Information on the site is provided for informational purposes only and does not constitute professional advice. ShohruxDigital is not liable for any damages arising from the use of site materials. Responsibility for links to third-party sites lies with the respective sites.'
        },
        {
          title: 'Advertising and Partnerships',
          content: 'The site may display advertisements through Google AdSense and other advertising networks. Advertising content does not reflect the opinions of the site administration. We are not responsible for products and services provided by advertisers.'
        },
        {
          title: 'Governing Law',
          content: 'Any disputes related to these terms shall be resolved in accordance with the laws of the Republic of Uzbekistan.'
        },
        {
          title: 'Contact Information',
          content: 'If you have any questions about these terms, please contact us at contact@shohruxdigital.uz or through the contact form on our website.'
        }
      ]
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={language === 'uz' ? 'Foydalanish Shartlari | ShohruxDigital' : language === 'ru' ? 'Условия Использования | ShohruxDigital' : 'Terms of Service | ShohruxDigital'}
        description={language === 'uz' ? 'ShohruxDigital foydalanish shartlari va qoidalari' : language === 'ru' ? 'Условия использования и правила ShohruxDigital' : 'ShohruxDigital terms of service — user responsibilities, copyright, advertising policies, and limitation of liability'}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        type="website"
      />
      <BreadcrumbJsonLd items={[{ name: language === 'uz' ? 'Foydalanish Shartlari' : language === 'ru' ? 'Условия' : 'Terms of Service', url: '/terms' }]} />
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

export default Terms;
