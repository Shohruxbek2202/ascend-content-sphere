import { useState } from 'react';
import { Newspaper, Loader2, Play, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminAutoNews = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunNow = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Auth required');

      const { data, error } = await supabase.functions.invoke('auto-news', {
        body: { max_posts: 3 },
      });

      if (error) throw error;

      setResult(data);
      if (data?.posts_created > 0) {
        toast.success(`${data.posts_created} ta yangi post yaratildi!`);
      } else {
        toast.info(data?.message || 'Yangi yangilik topilmadi');
      }
    } catch (error) {
      console.error('Auto-news error:', error);
      toast.error(error instanceof Error ? error.message : 'Xatolik yuz berdi');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-primary" />
          Avtomatik Yangiliklar
        </h1>
        <p className="text-muted-foreground mt-1">
          Digital marketing va AI yangiliklari avtomatik ravishda post sifatida yaratiladi
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Jadval
            </CardTitle>
            <CardDescription>
              Avtomatik yangiliklar har 6 soatda ishga tushadi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Faol
              </Badge>
              <span className="text-sm text-muted-foreground">
                Har 6 soatda (0:00, 6:00, 12:00, 18:00)
              </span>
            </div>

            <div className="text-sm space-y-2">
              <p className="font-medium">Manba RSS feedlar:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Search Engine Land</li>
                <li>Search Engine Journal</li>
                <li>Social Media Examiner</li>
                <li>HubSpot Marketing</li>
                <li>TechCrunch AI</li>
                <li>The Verge AI</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Manual Run Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Qo'lda ishga tushirish
            </CardTitle>
            <CardDescription>
              Hoziroq yangiliklar olish va post yaratish
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleRunNow}
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yangiliklar olinmoqda... (1-3 daqiqa)
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Hozir ishga tushirish
                </>
              )}
            </Button>

            {result && (
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <div className="flex items-center gap-2">
                  {result.posts_created > 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="font-medium">{result.message}</span>
                </div>
                {result.slugs?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Yaratilgan postlar:</p>
                    {result.slugs.map((slug: string) => (
                      <a
                        key={slug}
                        href={`/post/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-primary hover:underline"
                      >
                        /post/{slug}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>Qanday ishlaydi?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>RSS feedlardan so'nggi 24 soatdagi yangiliklar olinadi</li>
            <li>Dublikat postlar tekshiriladi va o'tkazib yuboriladi</li>
            <li>OpenAI GPT-4o-mini yordamida har bir yangilik uchun 3 tilda (UZ, RU, EN) post yaratiladi</li>
            <li>SEO meta ma'lumotlari, teglar va kalit so'zlar avtomatik generatsiya qilinadi</li>
            <li>Post avtomatik published holatda saqlandi</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAutoNews;
