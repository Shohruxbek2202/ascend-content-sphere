import { useState, useEffect } from 'react';
import { Save, Instagram, Youtube, Facebook, Twitter, Linkedin, Send, Globe, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Settings {
  [key: string]: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (data) {
      const settingsMap: Settings = {};
      data.forEach(item => {
        settingsMap[item.key] = item.value || '';
      });
      setSettings(settingsMap);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value })
          .eq('key', key);

        if (error) {
          toast.error(`Xatolik: ${key} saqlanmadi`);
          console.error(error);
        }
      }
      toast.success('Sozlamalar saqlandi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Sozlamalar</h1>
          <p className="text-muted-foreground">Sayt sozlamalarini boshqaring</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>

      <Tabs defaultValue="social" className="space-y-6">
        <TabsList>
          <TabsTrigger value="social">Ijtimoiy tarmoqlar</TabsTrigger>
          <TabsTrigger value="analytics">Analitika kodlari</TabsTrigger>
          <TabsTrigger value="api">API Kalitlari</TabsTrigger>
        </TabsList>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Ijtimoiy tarmoq havolalari
              </CardTitle>
              <CardDescription>
                Bu havolalar saytning footer qismida avtomatik ko'rinadi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    value={settings.instagram_url || ''}
                    onChange={(e) => updateSetting('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Telegram
                  </Label>
                  <Input
                    value={settings.telegram_url || ''}
                    onChange={(e) => updateSetting('telegram_url', e.target.value)}
                    placeholder="https://t.me/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </Label>
                  <Input
                    value={settings.youtube_url || ''}
                    onChange={(e) => updateSetting('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/@channel"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Label>
                  <Input
                    value={settings.facebook_url || ''}
                    onChange={(e) => updateSetting('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/page"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter / X
                  </Label>
                  <Input
                    value={settings.twitter_url || ''}
                    onChange={(e) => updateSetting('twitter_url', e.target.value)}
                    placeholder="https://x.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    value={settings.linkedin_url || ''}
                    onChange={(e) => updateSetting('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analitika integratsiyasi</CardTitle>
              <CardDescription>
                Bu kodlar saytning head qismiga avtomatik qo'shiladi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Google Analytics 4 (GA4) Measurement ID</Label>
                <Input
                  value={settings.ga4_measurement_id || ''}
                  onChange={(e) => updateSetting('ga4_measurement_id', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Google Analytics 4 dan olingan o'lchov ID si
                </p>
              </div>

              <div className="space-y-2">
                <Label>Google Tag Manager Container ID</Label>
                <Input
                  value={settings.gtm_container_id || ''}
                  onChange={(e) => updateSetting('gtm_container_id', e.target.value)}
                  placeholder="GTM-XXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Google Tag Manager konteyner ID si
                </p>
              </div>

              <div className="space-y-2">
                <Label>Meta Pixel (Facebook Pixel) ID</Label>
                <Input
                  value={settings.meta_pixel_id || ''}
                  onChange={(e) => updateSetting('meta_pixel_id', e.target.value)}
                  placeholder="123456789012345"
                />
                <p className="text-xs text-muted-foreground">
                  Meta Business Suite dan olingan Pixel ID
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* API Keys Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Kalitlari
              </CardTitle>
              <CardDescription>
                Avto-yangiliklar uchun ishlatiladigan OpenAI API kalitini boshqaring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showOpenaiKey ? 'text' : 'password'}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!openaiKey.trim()) {
                        toast.error('API kalitni kiriting');
                        return;
                      }
                      setIsSavingKey(true);
                      try {
                        const { error } = await supabase.functions.invoke('update-openai-key', {
                          body: { key: openaiKey.trim() },
                        });
                        if (error) throw error;
                        toast.success('OpenAI API kalit yangilandi');
                        setOpenaiKey('');
                      } catch (e) {
                        toast.error('Xatolik: kalit saqlanmadi');
                        console.error(e);
                      } finally {
                        setIsSavingKey(false);
                      }
                    }}
                    disabled={isSavingKey}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSavingKey ? 'Saqlanmoqda...' : 'Yangilash'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  OpenAI platformasidan olingan API kalit. Avto-yangiliklar generatsiyasi uchun ishlatiladi.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;