export type LandingField = 'name' | 'phone' | 'email' | 'message' | 'service';

export interface LandingConfig {
  brand: string;
  logoText?: string;
  hero: {
    badge?: string;
    title: string;
    highlight?: string;
    subtitle?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    image?: string;
    note?: string;
  };
  stats: { value: string; label: string }[];
  logos: string[];
  benefits: { title: string; text: string }[];
  services: { title: string; price?: string; desc?: string; features: string[]; highlight?: boolean }[];
  steps: { title: string; text: string }[];
  testimonials: { name: string; role?: string; text: string }[];
  faq: { q: string; a: string }[];
  form: {
    title: string;
    subtitle?: string;
    button: string;
    fields: LandingField[];
    serviceOptions: string[];
    success: string;
    privacy?: string;
  };
  contact: { phone?: string; telegram?: string; email?: string; address?: string };
  colors: { primary: string; bg: string; surface: string; text: string; muted: string };
  footerNote?: string;
}

export const TEMPLATES = [
  { key: 'aurora', name: 'Aurora', desc: 'Gradientli, yumshoq, SaaS uslubi' },
  { key: 'bold', name: 'Bold Editorial', desc: 'Qattiq tipografiya, qora-oq, kuchli' },
  { key: 'split', name: 'Split Convert', desc: 'Chap kontent / o‘ng yopishqoq forma' },
  { key: 'neon', name: 'Neon Night', desc: 'Qorong‘i, neon aksentli, tech' },
  { key: 'clean', name: 'Clean Trust', desc: 'Oq, ishonchli, agentlik uslubi' },
] as const;

export type TemplateKey = typeof TEMPLATES[number]['key'];

export const defaultConfig = (): LandingConfig => ({
  brand: 'Shohrux Digital',
  logoText: 'SD',
  hero: {
    badge: 'Digital Marketing Agency',
    title: 'Reklamadan real',
    highlight: 'mijoz oqimi',
    subtitle:
      'Biz sizning biznesingiz uchun lead generatsiya tizimini quramiz: strategiya, kreativ, target va analitika — bitta jamoada.',
    ctaPrimary: 'Bepul konsultatsiya olish',
    ctaSecondary: 'Xizmatlarni ko‘rish',
    note: '24 soat ichida javob beramiz',
    image: '',
  },
  stats: [
    { value: '120+', label: 'Loyiha' },
    { value: '4.2x', label: "O'rtacha ROAS" },
    { value: '18k+', label: 'Jalb qilingan lead' },
    { value: '7 yil', label: 'Tajriba' },
  ],
  logos: [],
  benefits: [
    { title: 'Strategiya, taxmin emas', text: 'Har bir kampaniya bozor va raqobat tahlilidan boshlanadi.' },
    { title: 'Shaffof hisobot', text: 'Har hafta raqamlar: xarajat, lead narxi, konversiya.' },
    { title: 'Tez ishga tushirish', text: '5 kun ichida birinchi kampaniya efirda.' },
    { title: "To'liq voronka", text: 'Landing, kreativ, target va CRM — bir tizimda.' },
  ],
  services: [
    {
      title: 'Start',
      price: '$390/oy',
      desc: 'Yangi boshlayotgan biznes uchun',
      features: ['1 ta platforma', 'Landing sozlash', '8 ta kreativ', 'Haftalik hisobot'],
    },
    {
      title: 'Growth',
      price: '$790/oy',
      desc: 'Barqaror lead oqimi kerak bo‘lganlar uchun',
      features: ['2-3 platforma', 'A/B testlar', '20 ta kreativ', 'CRM integratsiya', 'Analitika dashboard'],
      highlight: true,
    },
    {
      title: 'Scale',
      price: 'Kelishilgan',
      desc: 'Katta byudjet va agressiv o‘sish',
      features: ['To‘liq voronka', 'Alohida menejer', 'Cheksiz kreativ', 'Haftalik strategiya sessiya'],
    },
  ],
  steps: [
    { title: 'Brief va tahlil', text: 'Biznesingiz, mijoz portreti va raqobatchilarni o‘rganamiz.' },
    { title: 'Strategiya', text: 'Voronka, taklif va byudjet rejasini tayyorlaymiz.' },
    { title: 'Ishga tushirish', text: 'Kreativ, landing va kampaniyalar efirga chiqadi.' },
    { title: 'Optimizatsiya', text: 'Har hafta lead narxini pasaytirib boramiz.' },
  ],
  testimonials: [
    { name: 'Aziz K.', role: 'Mebel brendi', text: 'Lead narxi 2 oyda 3 barobar arzonlashdi. Hisobotlar juda tushunarli.' },
    { name: 'Nilufar S.', role: 'Klinika', text: 'Oyiga 200+ murojaat. Endi savdo bo‘limi ulgurmayapti.' },
  ],
  faq: [
    { q: 'Natijani qachon ko‘raman?', a: 'Odatda birinchi leadlar ishga tushirilgandan 3-7 kun ichida keladi.' },
    { q: 'Byudjet qancha bo‘lishi kerak?', a: 'Minimal reklama byudjeti oyiga $300 dan boshlanadi, nishaga qarab hisoblaymiz.' },
    { q: 'Shartnoma tuzasizmi?', a: 'Ha, barcha ishlar rasmiy shartnoma asosida olib boriladi.' },
  ],
  form: {
    title: 'Bepul strategiya sessiyasi',
    subtitle: 'Formani to‘ldiring — 24 soat ichida bog‘lanamiz.',
    button: 'Ariza qoldirish',
    fields: ['name', 'phone', 'service', 'message'],
    serviceOptions: ['Target reklama', 'SMM', 'Landing page', 'SEO', 'Boshqa'],
    success: 'Rahmat! Tez orada siz bilan bog‘lanamiz.',
    privacy: 'Ma’lumotlaringiz uchinchi shaxsga berilmaydi.',
  },
  contact: { phone: '+998 90 000 00 00', telegram: 'https://t.me/', email: 'hello@example.com', address: 'Toshkent' },
  colors: { primary: '#4f46e5', bg: '#0a0a12', surface: '#12121c', text: '#ffffff', muted: '#a1a1aa' },
  footerNote: '© Shohrux Digital. Barcha huquqlar himoyalangan.',
});

export const mergeConfig = (raw: unknown): LandingConfig => {
  const d = defaultConfig();
  const c = (raw && typeof raw === 'object' ? raw : {}) as Partial<LandingConfig>;
  return {
    ...d,
    ...c,
    hero: { ...d.hero, ...(c.hero || {}) },
    form: { ...d.form, ...(c.form || {}) },
    contact: { ...d.contact, ...(c.contact || {}) },
    colors: { ...d.colors, ...(c.colors || {}) },
    stats: c.stats ?? d.stats,
    logos: c.logos ?? d.logos,
    benefits: c.benefits ?? d.benefits,
    services: c.services ?? d.services,
    steps: c.steps ?? d.steps,
    testimonials: c.testimonials ?? d.testimonials,
    faq: c.faq ?? d.faq,
  };
};
