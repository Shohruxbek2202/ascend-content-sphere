import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Users, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const AdminBroadcast = () => {
  const [subjectUz, setSubjectUz] = useState('');
  const [subjectRu, setSubjectRu] = useState('');
  const [subjectEn, setSubjectEn] = useState('');
  const [messageUz, setMessageUz] = useState('');
  const [messageRu, setMessageRu] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<string>('all');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { data: subscriberCounts } = useQuery({
    queryKey: ['subscriber-counts'],
    queryFn: async () => {
      const { data: subscribers, error } = await supabase
        .from('subscribers')
        .select('language, active');

      if (error) throw error;

      const counts = {
        total: subscribers?.length || 0,
        active: subscribers?.filter(s => s.active).length || 0,
        uz: subscribers?.filter(s => s.language === 'uz' && s.active).length || 0,
        ru: subscribers?.filter(s => s.language === 'ru' && s.active).length || 0,
        en: subscribers?.filter(s => s.language === 'en' && s.active).length || 0,
      };

      return counts;
    },
  });

  const getTargetCount = () => {
    if (!subscriberCounts) return 0;
    if (includeInactive) {
      if (targetLanguage === 'all') return subscriberCounts.total;
      // Would need to recalculate for inactive
      return subscriberCounts.total;
    }
    if (targetLanguage === 'all') return subscriberCounts.active;
    return subscriberCounts[targetLanguage as keyof typeof subscriberCounts] || 0;
  };

  const handleSend = async () => {
    // Validate based on target language
    if (targetLanguage === 'all' || targetLanguage === 'uz') {
      if (!subjectUz.trim() || !messageUz.trim()) {
        toast.error("O'zbek tili uchun mavzu va xabar kiritilishi shart");
        return;
      }
    }
    if (targetLanguage === 'all' || targetLanguage === 'ru') {
      if (!subjectRu.trim() || !messageRu.trim()) {
        toast.error('Rus tili uchun mavzu va xabar kiritilishi shart');
        return;
      }
    }
    if (targetLanguage === 'all' || targetLanguage === 'en') {
      if (!subjectEn.trim() || !messageEn.trim()) {
        toast.error('Ingliz tili uchun mavzu va xabar kiritilishi shart');
        return;
      }
    }

    setIsSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Avval tizimga kiring');
        return;
      }

      const response = await supabase.functions.invoke('send-broadcast', {
        body: {
          subject_uz: subjectUz,
          subject_ru: subjectRu,
          subject_en: subjectEn,
          message_uz: messageUz,
          message_ru: messageRu,
          message_en: messageEn,
          target_language: targetLanguage,
          include_inactive: includeInactive,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      toast.success(`Xabar yuborildi: ${result.sent} muvaffaqiyatli, ${result.failed} muvaffaqiyatsiz`);

      // Clear form
      setSubjectUz('');
      setSubjectRu('');
      setSubjectEn('');
      setMessageUz('');
      setMessageRu('');
      setMessageEn('');
    } catch (error: any) {
      console.error('Broadcast error:', error);
      toast.error(`Xatolik: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Xabar yuborish</h1>
        <p className="text-muted-foreground">
          Obunchilarga maxsus xabar yuboring
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{subscriberCounts?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Jami</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{subscriberCounts?.active || 0}</div>
            <p className="text-xs text-muted-foreground">Faol</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{subscriberCounts?.uz || 0}</div>
            <p className="text-xs text-muted-foreground">O'zbek</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{subscriberCounts?.ru || 0}</div>
            <p className="text-xs text-muted-foreground">Rus</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{subscriberCounts?.en || 0}</div>
            <p className="text-xs text-muted-foreground">Ingliz</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Yuborish sozlamalari</CardTitle>
          <CardDescription>Kimga xabar yuborishni tanlang</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Til bo'yicha filter</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha tillar</SelectItem>
                  <SelectItem value="uz">Faqat O'zbek</SelectItem>
                  <SelectItem value="ru">Faqat Rus</SelectItem>
                  <SelectItem value="en">Faqat Ingliz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="includeInactive"
                checked={includeInactive}
                onCheckedChange={(checked) => setIncludeInactive(checked as boolean)}
              />
              <Label htmlFor="includeInactive">Nofaol obunchilarni ham qo'shish</Label>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">
              <strong>{getTargetCount()}</strong> ta obunchiga yuboriladi
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Message Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Uzbek */}
        {(targetLanguage === 'all' || targetLanguage === 'uz') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">🇺🇿</span> O'zbek
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subjectUz">Mavzu</Label>
                <Input
                  id="subjectUz"
                  value={subjectUz}
                  onChange={(e) => setSubjectUz(e.target.value)}
                  placeholder="Email mavzusi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="messageUz">Xabar</Label>
                <Textarea
                  id="messageUz"
                  value={messageUz}
                  onChange={(e) => setMessageUz(e.target.value)}
                  placeholder="Xabar matnini yozing..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Russian */}
        {(targetLanguage === 'all' || targetLanguage === 'ru') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">🇷🇺</span> Русский
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subjectRu">Тема</Label>
                <Input
                  id="subjectRu"
                  value={subjectRu}
                  onChange={(e) => setSubjectRu(e.target.value)}
                  placeholder="Тема письма"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="messageRu">Сообщение</Label>
                <Textarea
                  id="messageRu"
                  value={messageRu}
                  onChange={(e) => setMessageRu(e.target.value)}
                  placeholder="Введите текст сообщения..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* English */}
        {(targetLanguage === 'all' || targetLanguage === 'en') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">🇬🇧</span> English
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subjectEn">Subject</Label>
                <Input
                  id="subjectEn"
                  value={subjectEn}
                  onChange={(e) => setSubjectEn(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="messageEn">Message</Label>
                <Textarea
                  id="messageEn"
                  value={messageEn}
                  onChange={(e) => setMessageEn(e.target.value)}
                  placeholder="Enter your message..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Send Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSend}
          disabled={isSending}
          className="min-w-[200px]"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Yuborilmoqda...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Xabar yuborish
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminBroadcast;
