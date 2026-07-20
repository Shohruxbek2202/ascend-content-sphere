import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@/i18n/LocalizedLink';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

const emailSchema = z.string().email('Email manzil noto\'g\'ri formatda');
const passwordSchema = z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak');

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (roleData) {
            navigate('/admin');
          } else {
            await supabase.auth.signOut();
            toast.error('Admin paneliga kirish uchun ruxsatingiz yo\'q');
          }
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleData) {
          navigate('/admin');
        } else {
          await supabase.auth.signOut();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          toast.error('Email yoki parol noto\'g\'ri');
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success('Muvaffaqiyatli kirdingiz!');
    } catch {
      toast.error('Kutilmagan xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))] selection:bg-[#4f46e5] selection:text-white grid grid-cols-1 lg:grid-cols-12"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      {/* Left rail — editorial brand panel */}
      <aside className="hidden lg:flex lg:col-span-5 xl:col-span-6 border-r border-[hsl(var(--rule))] p-12 xl:p-16 flex-col justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-[#4f46e5] transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" strokeWidth={2.5} />
          Bosh sahifaga qaytish
        </Link>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-6" style={editorial}>
            Tahririyat · Xizmat ostonasi
          </p>
          <h1 className="text-5xl xl:text-7xl font-bold uppercase tracking-tight leading-[0.9] mb-8" style={editorial}>
            Press<br/>Room.
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-md mb-10">
            Bu yer — jamoatchilik uchun emas. Faqat tahririyat ekipaji uchun yopiq ostona. Materiallar shu yerda yoziladi, tahrirlanadi va e'longa tayyorlanadi.
          </p>
          <div className="border-t border-[hsl(var(--rule))] pt-6 grid grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold" style={editorial}>01</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">Muharrir</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={editorial}>∞</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">Arxiv</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={editorial}>24/7</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">Smena</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
          Toshkent · {new Date().getFullYear()} · Tahririyat
        </p>
      </aside>

      {/* Right rail — sign-in form */}
      <section className="lg:col-span-7 xl:col-span-6 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-10">
            <ArrowLeft className="w-3 h-3" strokeWidth={2.5} />
            Orqaga
          </Link>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-4" style={editorial}>
            Yopiq kirish · Muharrir
          </p>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight leading-[0.95] mb-3" style={editorial}>
            Kirish.
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed mb-10 border-l-2 border-[#4f46e5] pl-4">
            Hisob ma'lumotlaringizni kiriting. Faqat tasdiqlangan muharrirlar tahririyatga kira oladi.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2" style={editorial}>
                Email manzili
              </label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" strokeWidth={2} />
                <input
                  id="email"
                  type="email"
                  placeholder="muharrir@shohruxdigital.uz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-transparent border-0 border-b border-[hsl(var(--rule))] pl-8 pr-2 py-3 text-base text-[hsl(var(--paper))] placeholder:text-zinc-600 focus:outline-none focus:border-[#4f46e5] transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2" style={editorial}>
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" strokeWidth={2} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-transparent border-0 border-b border-[hsl(var(--rule))] pl-8 pr-10 py-3 text-base text-[hsl(var(--paper))] placeholder:text-zinc-600 focus:outline-none focus:border-[#4f46e5] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#4f46e5] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4f46e5] text-white px-6 py-4 font-bold uppercase tracking-wider text-xs hover:bg-[#3d34d1] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              style={editorial}
            >
              {isLoading ? 'Tekshirilmoqda…' : 'Tahririyatga kirish'}
              {!isLoading && <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />}
            </button>
          </form>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-10 leading-relaxed">
            Bu sahifa ommaviy ro'yxatdan o'tish uchun emas. Faqat tasdiqlangan muharrirlar uchun.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Auth;
