import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Mail, User, FileText, MapPin, Clock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email').max(255, 'Email too long'),
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().trim().min(10, 'Message too short').max(2000, 'Message too long (max 2000)'),
});

const Contact = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const content = {
    uz: {
      title: 'Biz bilan bog\'laning',
      subtitle: 'Savollaringiz bormi? Biz bilan bog\'laning va tez orada javob oling.',
      form: { name: 'Ismingiz', email: 'Email manzilingiz', subject: 'Mavzu', message: 'Xabaringiz', submit: 'Yuborish', sending: 'Yuborilmoqda...' },
      success: 'Xabaringiz muvaffaqiyatli yuborildi!',
      error: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.',
      contactInfo: { title: 'Bog\'lanish ma\'lumotlari', email: 'Email', location: 'Manzil', locationValue: 'Toshkent, O\'zbekiston', hours: 'Ish vaqti', hoursValue: 'Dushanba - Juma: 9:00 - 18:00', response: 'Javob vaqti', responseValue: '24 soat ichida' },
      validation: { name: 'Ismingizni kiriting', email: 'To\'g\'ri email kiriting', subject: 'Mavzuni kiriting', messageShort: 'Xabar kamida 10 belgi bo\'lishi kerak', messageLong: 'Xabar 2000 belgidan oshmasligi kerak' }
    },
    ru: {
      title: 'Свяжитесь с нами',
      subtitle: 'Есть вопросы? Свяжитесь с нами и получите быстрый ответ.',
      form: { name: 'Ваше имя', email: 'Ваш email', subject: 'Тема', message: 'Ваше сообщение', submit: 'Отправить', sending: 'Отправка...' },
      success: 'Ваше сообщение успешно отправлено!',
      error: 'Произошла ошибка. Попробуйте снова.',
      contactInfo: { title: 'Контактная информация', email: 'Email', location: 'Адрес', locationValue: 'Ташкент, Узбекистан', hours: 'Рабочие часы', hoursValue: 'Понедельник - Пятница: 9:00 - 18:00', response: 'Время ответа', responseValue: 'В течение 24 часов' },
      validation: { name: 'Введите имя', email: 'Введите корректный email', subject: 'Введите тему', messageShort: 'Сообщение минимум 10 символов', messageLong: 'Сообщение максимум 2000 символов' }
    },
    en: {
      title: 'Contact Us',
      subtitle: 'Have questions? Contact us and get a quick response.',
      form: { name: 'Your name', email: 'Your email', subject: 'Subject', message: 'Your message', submit: 'Send', sending: 'Sending...' },
      success: 'Your message has been sent successfully!',
      error: 'An error occurred. Please try again.',
      contactInfo: { title: 'Contact Information', email: 'Email', location: 'Location', locationValue: 'Tashkent, Uzbekistan', hours: 'Business Hours', hoursValue: 'Monday - Friday: 9:00 AM - 6:00 PM', response: 'Response Time', responseValue: 'Within 24 hours' },
      validation: { name: 'Name is required', email: 'Valid email is required', subject: 'Subject is required', messageShort: 'Message must be at least 10 characters', messageLong: 'Message must be under 2000 characters' }
    }
  };

  const t = content[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as string;
        if (field === 'name') fieldErrors.name = t.validation.name;
        else if (field === 'email') fieldErrors.email = t.validation.email;
        else if (field === 'subject') fieldErrors.subject = t.validation.subject;
        else if (field === 'message') {
          fieldErrors.message = err.code === 'too_small' ? t.validation.messageShort : t.validation.messageLong;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: result.data.name,
          email: result.data.email,
          subject: result.data.subject,
          message: result.data.message
        });

      if (error) throw error;

      toast.success(t.success);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const contactItems = [
    { icon: Mail, label: t.contactInfo.email, value: 'contact@shohruxdigital.com', href: 'mailto:contact@shohruxdigital.com' },
    { icon: MapPin, label: t.contactInfo.location, value: t.contactInfo.locationValue, href: null },
    { icon: Clock, label: t.contactInfo.hours, value: t.contactInfo.hoursValue, href: null },
    { icon: Phone, label: t.contactInfo.response, value: t.contactInfo.responseValue, href: null }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={language === 'uz' ? 'Bog\'lanish | ShohruxDigital' : language === 'ru' ? 'Контакты | ShohruxDigital' : 'Contact Us | ShohruxDigital'}
        description={language === 'uz' ? 'ShohruxDigital bilan bog\'laning — savollar, takliflar va hamkorlik uchun' : language === 'ru' ? 'Свяжитесь с ShohruxDigital — вопросы, предложения и сотрудничество' : 'Contact ShohruxDigital — questions, suggestions and partnerships'}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        type="website"
      />
      <BreadcrumbJsonLd items={[{ name: language === 'uz' ? 'Bog\'lanish' : language === 'ru' ? 'Контакты' : 'Contact', url: '/contact' }]} />
      <Header />
      
      <main className="relative pt-20 pb-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-1/4 w-[350px] h-[350px] rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{t.title}</h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">{t.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <div className="rounded-2xl bg-card border border-border shadow-xl p-6">
                  <h2 className="font-semibold text-lg text-foreground mb-5">{t.contactInfo.title}</h2>
                  <div className="space-y-5">
                    {contactItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          {item.href ? (
                            <a href={item.href} className="text-foreground font-medium hover:text-secondary transition-colors">{item.value}</a>
                          ) : (
                            <p className="text-foreground font-medium">{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="rounded-2xl bg-card border border-border shadow-xl p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">{t.form.name}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); setErrors(prev => ({ ...prev, name: '' })); }}
                            className={`pl-10 h-11 rounded-xl bg-background border-border focus:border-secondary ${errors.name ? 'border-destructive' : ''}`}
                            maxLength={100}
                          />
                        </div>
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">{t.form.email}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => { setFormData(prev => ({ ...prev, email: e.target.value })); setErrors(prev => ({ ...prev, email: '' })); }}
                            className={`pl-10 h-11 rounded-xl bg-background border-border focus:border-secondary ${errors.email ? 'border-destructive' : ''}`}
                            maxLength={255}
                          />
                        </div>
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">{t.form.subject}</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => { setFormData(prev => ({ ...prev, subject: e.target.value })); setErrors(prev => ({ ...prev, subject: '' })); }}
                          className={`pl-10 h-11 rounded-xl bg-background border-border focus:border-secondary ${errors.subject ? 'border-destructive' : ''}`}
                          maxLength={200}
                        />
                      </div>
                      {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">{t.form.message}</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => { setFormData(prev => ({ ...prev, message: e.target.value })); setErrors(prev => ({ ...prev, message: '' })); }}
                        className={`rounded-xl bg-background border-border focus:border-secondary resize-none ${errors.message ? 'border-destructive' : ''}`}
                        maxLength={2000}
                      />
                      <div className="flex justify-between">
                        {errors.message ? <p className="text-xs text-destructive">{errors.message}</p> : <span />}
                        <span className="text-xs text-muted-foreground">{formData.message.length}/2000</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold shadow-lg shadow-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/30" 
                      disabled={isLoading}
                    >
                      {isLoading ? t.form.sending : (<><Send className="w-4 h-4 mr-2" />{t.form.submit}</>)}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
