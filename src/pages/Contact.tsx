import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublicPageHero } from '@/components/PublicPageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { z } from 'zod';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(10).max(2000),
});

const Contact = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const t = (uz: string, ru: string, en: string) => (language === 'uz' ? uz : language === 'ru' ? ru : en);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const f = err.path[0] as string;
        if (f === 'name') fe.name = t('Ismingizni kiriting', 'Введите имя', 'Name is required');
        else if (f === 'email') fe.email = t('To\'g\'ri email kiriting', 'Введите корректный email', 'Valid email required');
        else if (f === 'subject') fe.subject = t('Mavzuni kiriting', 'Введите тему', 'Subject required');
        else if (f === 'message') fe.message = err.code === 'too_small'
          ? t('Kamida 10 belgi', 'Минимум 10 символов', 'At least 10 characters')
          : t('Maksimum 2000 belgi', 'Максимум 2000 символов', 'Max 2000 characters');
      });
      setErrors(fe);
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert(result.data);
      if (error) throw error;
      toast.success(t('Xabaringiz yuborildi', 'Сообщение отправлено', 'Message dispatched'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      toast.error(t('Xatolik. Qaytadan urinib ko\'ring', 'Ошибка. Попробуйте снова', 'Error. Please try again'));
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { id: 'name', label: t('Ism', 'Имя', 'Name'), maxLength: 100 },
    { id: 'email', label: t('Email manzili', 'Email', 'Email address'), type: 'email', maxLength: 255 },
    { id: 'subject', label: t('Mavzu', 'Тема', 'Subject'), maxLength: 200 },
  ] as const;

  return (
    <div
      className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <SEOHead
        title={t('Bog\'lanish | ShohruxDigital', 'Контакты | ShohruxDigital', 'Direct Line | ShohruxDigital')}
        description={t(
          'To\'g\'ridan-to\'g\'ri yozing — savol, hamkorlik yoki kampaniya bo\'yicha.',
          'Пишите напрямую — по вопросу, сотрудничеству или кампании.',
          'Write directly — for questions, partnerships, or campaigns.'
        )}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        type="website"
      />
      <BreadcrumbJsonLd items={[{ name: t('Bog\'lanish', 'Контакты', 'Contact'), url: '/contact' }]} />
      <Header />

      <main className="max-w-screen-2xl mx-auto">
        <PublicPageHero
          eyebrow={t('Tahririyatga xat', 'Письмо в редакцию', 'Letter to the Desk')}
          title={<>{t('Direct Line', 'Прямая линия', 'Direct Line')}</>}
          meta={t('Javob — 24 soat', 'Ответ — 24 часа', 'Response — 24h')}
          lede={t(
            'Sovuq xat, hamkorlik takliflari, intervyu so\'rovlari — barchasi shu joydan o\'tadi.',
            'Холодные письма, предложения о сотрудничестве, заявки на интервью — всё проходит здесь.',
            'Cold pitches, partnership notes, interview requests — everything routes through this line.'
          )}
        />

        <section className="px-6 md:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Sidebar info */}
          <aside className="lg:col-span-4 space-y-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-3">
                {t('Bevosita pochta', 'Прямой адрес', 'Direct')}
              </p>
              <a href="mailto:contact@shohruxdigital.com"
                className="text-xl md:text-2xl font-bold uppercase tracking-tight hover:text-[#4f46e5] transition-colors break-all" style={editorial}>
                contact@shohruxdigital.com
              </a>
            </div>

            <div className="border-t border-[hsl(var(--rule))] pt-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3">
                {t('Joylashuv', 'Местоположение', 'Bureau')}
              </p>
              <p className="text-base text-zinc-300">{t('Toshkent, O\'zbekiston', 'Ташкент, Узбекистан', 'Tashkent, Uzbekistan')}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">UTC+05</p>
            </div>

            <div className="border-t border-[hsl(var(--rule))] pt-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3">
                {t('Ish vaqti', 'Часы работы', 'Hours')}
              </p>
              <p className="text-base text-zinc-300">{t('Du–Ju · 09:00–18:00', 'Пн–Пт · 09:00–18:00', 'Mon–Fri · 09:00–18:00')}</p>
            </div>

            <div className="border-t border-[hsl(var(--rule))] pt-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3">
                {t('Javob vaqti', 'Время ответа', 'Reply window')}
              </p>
              <p className="text-3xl md:text-4xl font-bold tracking-tighter text-[#4f46e5]" style={editorial}>≤ 24h</p>
            </div>
          </aside>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="lg:col-span-8 border border-[hsl(var(--rule))] p-6 md:p-10">
            <div className="flex items-baseline justify-between mb-10 pb-6 border-b border-[hsl(var(--rule))]">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight" style={editorial}>
                {t('Xabar tuzing', 'Составьте сообщение', 'Compose a message')}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Form / 01</span>
            </div>

            <div className="space-y-8">
              {fields.map(field => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={('type' in field ? field.type : 'text') as string}
                    value={formData[field.id as keyof typeof formData]}
                    onChange={(e) => {
                      setFormData(p => ({ ...p, [field.id]: e.target.value }));
                      setErrors(p => ({ ...p, [field.id]: '' }));
                    }}
                    maxLength={field.maxLength}
                    className="w-full bg-transparent border-b border-[hsl(var(--rule))] focus:border-[#4f46e5] py-3 text-lg md:text-xl text-[hsl(var(--paper))] focus:outline-none transition-colors"
                  />
                  {errors[field.id] && <p className="mt-2 text-xs uppercase tracking-widest text-red-400">{errors[field.id]}</p>}
                </div>
              ))}

              <div>
                <label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                  {t('Xabar', 'Сообщение', 'Message')}
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData(p => ({ ...p, message: e.target.value }));
                    setErrors(p => ({ ...p, message: '' }));
                  }}
                  maxLength={2000}
                  className="w-full bg-transparent border-b border-[hsl(var(--rule))] focus:border-[#4f46e5] py-3 text-base md:text-lg text-[hsl(var(--paper))] focus:outline-none resize-none transition-colors"
                />
                <div className="flex justify-between mt-2">
                  <span>{errors.message && <span className="text-xs uppercase tracking-widest text-red-400">{errors.message}</span>}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{formData.message.length}/2000</span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[hsl(var(--rule))] flex items-center justify-between gap-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 max-w-xs">
                {t('Yuborish bilan tahririyat siyosatini qabul qilasiz.', 'Отправляя, вы принимаете правила редакции.', 'By sending, you accept the editorial policy.')}
              </p>
              <button type="submit" disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-4 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#4f46e5] hover:text-white transition-all disabled:opacity-50">
                {isLoading ? t('Yuborilmoqda', 'Отправка', 'Sending') : t('Yuborish', 'Отправить', 'Dispatch')}
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
