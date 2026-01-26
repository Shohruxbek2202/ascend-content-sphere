import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Mail, User, FileText } from 'lucide-react';
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
      
      <main className="relative pt-20 pb-12">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-1/4 w-[350px] h-[350px] rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{t.title}</h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">{t.subtitle}</p>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl bg-card border border-border shadow-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">{t.form.name}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10 h-11 rounded-xl bg-background border-border focus:border-secondary"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">{t.form.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 h-11 rounded-xl bg-background border-border focus:border-secondary"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">{t.form.subject}</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="pl-10 h-11 rounded-xl bg-background border-border focus:border-secondary"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">{t.form.message}</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="rounded-xl bg-background border-border focus:border-secondary resize-none"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold shadow-lg shadow-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/30" 
                  disabled={isLoading}
                >
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
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;