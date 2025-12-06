import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const content = {
    uz: {
      title: 'Biz bilan bog\'laning',
      subtitle: 'Savollaringiz bormi? Biz bilan bog\'laning va tez orada javob oling.',
      form: {
        name: 'Ismingiz',
        email: 'Email manzilingiz',
        subject: 'Mavzu',
        message: 'Xabaringiz',
        submit: 'Yuborish',
        sending: 'Yuborilmoqda...'
      },
      success: 'Xabaringiz muvaffaqiyatli yuborildi!',
      error: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.'
    },
    ru: {
      title: 'Свяжитесь с нами',
      subtitle: 'Есть вопросы? Свяжитесь с нами и получите быстрый ответ.',
      form: {
        name: 'Ваше имя',
        email: 'Ваш email',
        subject: 'Тема',
        message: 'Ваше сообщение',
        submit: 'Отправить',
        sending: 'Отправка...'
      },
      success: 'Ваше сообщение успешно отправлено!',
      error: 'Произошла ошибка. Попробуйте снова.'
    },
    en: {
      title: 'Contact Us',
      subtitle: 'Have questions? Contact us and get a quick response.',
      form: {
        name: 'Your name',
        email: 'Your email',
        subject: 'Subject',
        message: 'Your message',
        submit: 'Send',
        sending: 'Sending...'
      },
      success: 'Your message has been sent successfully!',
      error: 'An error occurred. Please try again.'
    }
  };

  const t = content[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-4">{t.title}</h1>
            <p className="text-muted-foreground text-lg">{t.subtitle}</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.form.name}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.form.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t.form.subject}</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t.form.message}</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    t.form.sending
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t.form.submit}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;