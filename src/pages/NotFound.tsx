import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Set noindex for 404 pages
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    document.title = language === 'uz' ? 'Sahifa topilmadi | ShohruxDigital' 
      : language === 'ru' ? 'Страница не найдена | ShohruxDigital' 
      : 'Page Not Found | ShohruxDigital';

    return () => {
      robotsMeta?.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    };
  }, [location.pathname, language]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-20 pb-12">
        <div className="text-center px-4">
          <h1 className="font-display text-7xl md:text-9xl font-bold text-primary/20 mb-4">404</h1>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            {language === 'uz' ? 'Sahifa topilmadi' : language === 'ru' ? 'Страница не найдена' : 'Page Not Found'}
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            {language === 'uz' ? 'Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki ko\'chirilgan' 
              : language === 'ru' ? 'Извините, запрашиваемая страница не существует или была перемещена' 
              : 'Sorry, the page you are looking for does not exist or has been moved'}
          </p>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              {language === 'uz' ? 'Bosh sahifaga qaytish' : language === 'ru' ? 'На главную' : 'Back to Home'}
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
