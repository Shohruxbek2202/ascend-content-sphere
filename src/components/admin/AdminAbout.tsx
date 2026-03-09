import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, GripVertical, Save, ExternalLink } from 'lucide-react';

interface AboutSetting {
  id: string;
  key: string;
  value_uz: string;
  value_ru: string;
  value_en: string;
}

interface Certification {
  id: string;
  name: string;
  image_url: string;
  cert_url: string;
  sort_order: number;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sort_order: number;
}

interface Experience {
  id: string;
  text_uz: string;
  text_ru: string;
  text_en: string;
  sort_order: number;
}

const SETTING_KEYS = [
  { key: 'author_name', label: 'Muallif ismi' },
  { key: 'author_role', label: 'Lavozimi / Roli' },
  { key: 'author_bio', label: 'Biografiya' },
  { key: 'author_avatar_url', label: 'Avatar rasm URL' },
  { key: 'mission_title', label: 'Missiya sarlavhasi' },
  { key: 'mission_description', label: 'Missiya tavsifi' },
];

const AdminAbout = () => {
  const [settings, setSettings] = useState<AboutSetting[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [settingsRes, certsRes, socialsRes, expRes] = await Promise.all([
      supabase.from('about_settings').select('*').order('key'),
      supabase.from('author_certifications').select('*').order('sort_order'),
      supabase.from('author_social_links').select('*').order('sort_order'),
      supabase.from('author_experience').select('*').order('sort_order'),
    ]);

    // Initialize missing settings
    const existing = settingsRes.data || [];
    const existingKeys = existing.map(s => s.key);
    const missingKeys = SETTING_KEYS.filter(k => !existingKeys.includes(k.key));

    if (missingKeys.length > 0) {
      const { data: newSettings } = await supabase
        .from('about_settings')
        .insert(missingKeys.map(k => ({ key: k.key, value_uz: '', value_ru: '', value_en: '' })))
        .select();
      if (newSettings) existing.push(...newSettings);
    }

    setSettings(existing);
    setCertifications(certsRes.data || []);
    setSocialLinks(socialsRes.data || []);
    setExperiences(expRes.data || []);
    setLoading(false);
  };

  // --- SETTINGS ---
  const updateSetting = (id: string, field: string, value: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveSettings = async () => {
    setSaving(true);
    for (const s of settings) {
      await supabase.from('about_settings').update({
        value_uz: s.value_uz,
        value_ru: s.value_ru,
        value_en: s.value_en,
      }).eq('id', s.id);
    }
    toast.success('Sozlamalar saqlandi');
    setSaving(false);
  };

  // --- CERTIFICATIONS ---
  const addCertification = async () => {
    const { data } = await supabase.from('author_certifications')
      .insert({ name: 'Yangi sertifikat', sort_order: certifications.length })
      .select()
      .single();
    if (data) setCertifications(prev => [...prev, data]);
  };

  const updateCert = (id: string, field: string, value: string) => {
    setCertifications(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const saveCertifications = async () => {
    setSaving(true);
    for (const c of certifications) {
      await supabase.from('author_certifications').update({
        name: c.name,
        image_url: c.image_url,
        cert_url: c.cert_url,
        sort_order: c.sort_order,
      }).eq('id', c.id);
    }
    toast.success('Sertifikatlar saqlandi');
    setSaving(false);
  };

  const deleteCert = async (id: string) => {
    await supabase.from('author_certifications').delete().eq('id', id);
    setCertifications(prev => prev.filter(c => c.id !== id));
    toast.success('Sertifikat o\'chirildi');
  };

  // --- SOCIAL LINKS ---
  const addSocialLink = async () => {
    const { data } = await supabase.from('author_social_links')
      .insert({ platform: 'Yangi', url: '', icon: '', sort_order: socialLinks.length })
      .select()
      .single();
    if (data) setSocialLinks(prev => [...prev, data]);
  };

  const updateSocial = (id: string, field: string, value: string) => {
    setSocialLinks(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveSocialLinks = async () => {
    setSaving(true);
    for (const s of socialLinks) {
      await supabase.from('author_social_links').update({
        platform: s.platform,
        url: s.url,
        icon: s.icon,
        sort_order: s.sort_order,
      }).eq('id', s.id);
    }
    toast.success('Ijtimoiy tarmoqlar saqlandi');
    setSaving(false);
  };

  const deleteSocial = async (id: string) => {
    await supabase.from('author_social_links').delete().eq('id', id);
    setSocialLinks(prev => prev.filter(s => s.id !== id));
    toast.success('Link o\'chirildi');
  };

  // --- EXPERIENCE ---
  const addExperience = async () => {
    const { data } = await supabase.from('author_experience')
      .insert({ text_uz: '', text_ru: '', text_en: '', sort_order: experiences.length })
      .select()
      .single();
    if (data) setExperiences(prev => [...prev, data]);
  };

  const updateExp = (id: string, field: string, value: string) => {
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const saveExperiences = async () => {
    setSaving(true);
    for (const e of experiences) {
      await supabase.from('author_experience').update({
        text_uz: e.text_uz,
        text_ru: e.text_ru,
        text_en: e.text_en,
        sort_order: e.sort_order,
      }).eq('id', e.id);
    }
    toast.success('Tajriba ma\'lumotlari saqlandi');
    setSaving(false);
  };

  const deleteExp = async (id: string) => {
    await supabase.from('author_experience').delete().eq('id', id);
    setExperiences(prev => prev.filter(e => e.id !== id));
    toast.success('Tajriba o\'chirildi');
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const getSettingByKey = (key: string) => settings.find(s => s.key === key);
  const isTextarea = (key: string) => ['author_bio', 'mission_description'].includes(key);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">About Sahifasi Boshqaruvi</h1>

      <Tabs defaultValue="settings">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="settings">Asosiy Ma'lumotlar</TabsTrigger>
          <TabsTrigger value="certifications">Sertifikatlar</TabsTrigger>
          <TabsTrigger value="social">Ijtimoiy Tarmoqlar</TabsTrigger>
          <TabsTrigger value="experience">Tajriba</TabsTrigger>
        </TabsList>

        {/* SETTINGS TAB */}
        <TabsContent value="settings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Muallif & Missiya Ma'lumotlari</CardTitle>
              <Button onClick={saveSettings} disabled={saving} size="sm">
                <Save className="w-4 h-4 mr-2" />Saqlash
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {SETTING_KEYS.map(({ key, label }) => {
                const setting = getSettingByKey(key);
                if (!setting) return null;
                return (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{label}</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(['value_uz', 'value_ru', 'value_en'] as const).map(lang => (
                        <div key={lang}>
                          <span className="text-xs text-muted-foreground uppercase">
                            {lang === 'value_uz' ? '🇺🇿 UZ' : lang === 'value_ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
                          </span>
                          {isTextarea(key) ? (
                            <Textarea
                              value={setting[lang] || ''}
                              onChange={e => updateSetting(setting.id, lang, e.target.value)}
                              rows={3}
                            />
                          ) : (
                            <Input
                              value={setting[lang] || ''}
                              onChange={e => updateSetting(setting.id, lang, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CERTIFICATIONS TAB */}
        <TabsContent value="certifications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sertifikatlar (rasm + URL)</CardTitle>
              <div className="flex gap-2">
                <Button onClick={saveCertifications} disabled={saving} size="sm">
                  <Save className="w-4 h-4 mr-2" />Saqlash
                </Button>
                <Button onClick={addCertification} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />Qo'shish
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {certifications.map((cert, idx) => (
                <div key={cert.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">#{idx + 1}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteCert(cert.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Sertifikat nomi</label>
                      <Input value={cert.name} onChange={e => updateCert(cert.id, 'name', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Rasm URL</label>
                      <Input value={cert.image_url || ''} onChange={e => updateCert(cert.id, 'image_url', e.target.value)} placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Sertifikat URL (tekshirish uchun)</label>
                      <Input value={cert.cert_url || ''} onChange={e => updateCert(cert.id, 'cert_url', e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                  {cert.image_url && (
                    <div className="flex items-center gap-3">
                      <img src={cert.image_url} alt={cert.name} className="h-12 rounded border object-contain" />
                      {cert.cert_url && (
                        <a href={cert.cert_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Ko'rish
                        </a>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-muted-foreground">Tartib raqami</label>
                    <Input type="number" value={cert.sort_order} onChange={e => updateCert(cert.id, 'sort_order', e.target.value)} className="w-24" />
                  </div>
                </div>
              ))}
              {certifications.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Hali sertifikatlar qo'shilmagan</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOCIAL LINKS TAB */}
        <TabsContent value="social">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ijtimoiy Tarmoq Linklari</CardTitle>
              <div className="flex gap-2">
                <Button onClick={saveSocialLinks} disabled={saving} size="sm">
                  <Save className="w-4 h-4 mr-2" />Saqlash
                </Button>
                <Button onClick={addSocialLink} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />Qo'shish
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.map((link, idx) => (
                <div key={link.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">#{idx + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteSocial(link.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Platforma nomi</label>
                      <Input value={link.platform} onChange={e => updateSocial(link.id, 'platform', e.target.value)} placeholder="LinkedIn" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">URL</label>
                      <Input value={link.url} onChange={e => updateSocial(link.id, 'url', e.target.value)} placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Ikonka (lucide nomi)</label>
                      <Input value={link.icon || ''} onChange={e => updateSocial(link.id, 'icon', e.target.value)} placeholder="linkedin, mail, globe..." />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Tartib</label>
                      <Input type="number" value={link.sort_order} onChange={e => updateSocial(link.id, 'sort_order', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              {socialLinks.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Hali link qo'shilmagan</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXPERIENCE TAB */}
        <TabsContent value="experience">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tajriba va Ko'nikmalar</CardTitle>
              <div className="flex gap-2">
                <Button onClick={saveExperiences} disabled={saving} size="sm">
                  <Save className="w-4 h-4 mr-2" />Saqlash
                </Button>
                <Button onClick={addExperience} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />Qo'shish
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={exp.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">#{idx + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteExp(exp.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">🇺🇿 UZ</span>
                      <Input value={exp.text_uz} onChange={e => updateExp(exp.id, 'text_uz', e.target.value)} />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">🇷🇺 RU</span>
                      <Input value={exp.text_ru} onChange={e => updateExp(exp.id, 'text_ru', e.target.value)} />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">🇬🇧 EN</span>
                      <Input value={exp.text_en} onChange={e => updateExp(exp.id, 'text_en', e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-xs text-muted-foreground">Tartib</label>
                    <Input type="number" value={exp.sort_order} onChange={e => updateExp(exp.id, 'sort_order', e.target.value)} className="w-24" />
                  </div>
                </div>
              ))}
              {experiences.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Hali tajriba qo'shilmagan</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAbout;
