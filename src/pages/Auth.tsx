import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Email manzil noto\'g\'ri formatda');
const passwordSchema = z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak');

// Admin email - faqat shu email admin panelga kirishi mumkin
const ADMIN_EMAIL = 'Shoxruxcoder5@gmail.com';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Faqat admin email bo'lsa ruxsat beramiz
          if (session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            navigate('/admin');
          } else {
            // Admin bo'lmagan foydalanuvchilarni chiqaramiz
            supabase.auth.signOut();
            toast.error('Sizga admin panelga kirish ruxsati yo\'q');
          }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          navigate('/admin');
        } else {
          supabase.auth.signOut();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    // Admin email tekshirish
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      toast.error('Sizga admin panelga kirish ruxsati yo\'q');
      return;
    }

    setIsLoading(true);

    try {
      if (isFirstTimeSetup) {
        // Birinchi marta ro'yxatdan o'tish
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Bu email allaqachon ro\'yxatdan o\'tgan. Login qiling.');
            setIsFirstTimeSetup(false);
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message === 'Invalid login credentials') {
            toast.error('Email yoki parol noto\'g\'ri. Agar birinchi marta kirmoqchi bo\'lsangiz, "Birinchi marta sozlash" tugmasini bosing.');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('Muvaffaqiyatli kirdingiz!');
      }
    } catch (error) {
      toast.error('Kutilmagan xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

      <Card className="w-full max-w-md relative z-10 shadow-xl">
        <CardHeader className="space-y-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>

          {/* Logo */}
          <div className="flex justify-center pt-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center">
            <CardTitle className="text-2xl font-display">
              {isFirstTimeSetup ? 'Birinchi marta sozlash' : 'Admin Kirish'}
            </CardTitle>
            <CardDescription>
              {isFirstTimeSetup 
                ? 'Admin hisobini yaratish uchun ma\'lumotlaringizni kiriting'
                : 'Admin paneliga kirish uchun ma\'lumotlaringizni kiriting'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading 
                ? 'Kutilmoqda...' 
                : isFirstTimeSetup 
                  ? 'Hisob yaratish' 
                  : 'Kirish'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsFirstTimeSetup(!isFirstTimeSetup)}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              {isFirstTimeSetup 
                ? 'Hisobingiz bormi? Kirish' 
                : 'Birinchi marta kiryapsizmi? Hisob yarating'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
