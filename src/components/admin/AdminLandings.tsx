import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ExternalLink, Copy, Eye } from 'lucide-react';
import { TEMPLATES, defaultConfig, mergeConfig, type LandingConfig, type LandingField } from '@/lib/landing';
import { LandingRenderer } from '@/components/landing/LandingRenderer';

const FIELDS: LandingField[] = ['name', 'phone', 'email', 'service', 'message'];

const Section = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <Card className="p-5 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">{title}</h3>
      {action}
    </div>
    {children}
  </Card>
);

const AdminLandings = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [config, setConfig] = useState<LandingConfig>(defaultConfig());
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin-landings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('landing_pages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const openNew = () => {
    setEditing({ slug: '', title: '', service: '', template: 'aurora', language: 'uz', is_published: false });
    setConfig(defaultConfig());
    setPreview(false);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setConfig(mergeConfig(p.config));
    setPreview(false);
  };

  const upd = (patch: Partial<LandingConfig>) => setConfig((c) => ({ ...c, ...patch }));

  const save = async () => {
    if (!editing.slug?.trim() || !editing.title?.trim()) {
      toast.error('Slug va sarlavha majburiy');
      return;
    }
    setSaving(true);
    const payload = {
      slug: editing.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      title: editing.title.trim(),
      service: editing.service || null,
      template: editing.template,
      language: editing.language,
      is_published: editing.is_published,
      config: config as any,
    };
    const res = editing.id
      ? await supabase.from('landing_pages').update(payload).eq('id', editing.id)
      : await supabase.from('landing_pages').insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success('Saqlandi');
    qc.invalidateQueries({ queryKey: ['admin-landings'] });
    setEditing(null);
  };

  const remove = async (id: string) => {
    if (!confirm('O‘chirilsinmi?')) return;
    const { error } = await supabase.from('landing_pages').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('O‘chirildi');
    qc.invalidateQueries({ queryKey: ['admin-landings'] });
  };

  const duplicate = async (p: any) => {
    const { error } = await supabase.from('landing_pages').insert({
      slug: `${p.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      title: `${p.title} (copy)`,
      service: p.service,
      template: p.template,
      language: p.language,
      is_published: false,
      config: p.config,
    });
    if (error) return toast.error(error.message);
    toast.success('Nusxa olindi');
    qc.invalidateQueries({ queryKey: ['admin-landings'] });
  };

  /* ---------------- list view ---------------- */
  if (!editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Landing sahifalar</h1>
            <p className="text-sm text-muted-foreground">Reklama uchun lead landinglari — 5 xil shablon</p>
          </div>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Yangi landing</Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Yuklanmoqda…</p>
        ) : pages.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">Hali landing yo‘q. “Yangi landing” tugmasini bosing.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pages.map((p: any) => (
              <Card key={p.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">/lp/{p.slug}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full bg-muted px-2 py-0.5">{TEMPLATES.find((t) => t.key === p.template)?.name || p.template}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 uppercase">{p.language}</span>
                      <span className={`rounded-full px-2 py-0.5 ${p.is_published ? 'bg-green-500/15 text-green-600' : 'bg-amber-500/15 text-amber-600'}`}>
                        {p.is_published ? 'Yoqilgan' : 'Qoralama'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => openEdit(p)}>Tahrirlash</Button>
                  <Button size="sm" variant="outline" asChild><a href={`/lp/${p.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-3.5 w-3.5" />Ochish</a></Button>
                  <Button size="sm" variant="outline" onClick={() => duplicate(p)}><Copy className="mr-1 h-3.5 w-3.5" />Nusxa</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------------- editor ---------------- */
  const listEditor = <T extends Record<string, any>>(
    title: string,
    items: T[],
    empty: T,
    key: keyof LandingConfig,
    fields: { k: keyof T; label: string; area?: boolean }[],
  ) => (
    <Section
      title={title}
      action={<Button size="sm" variant="outline" onClick={() => upd({ [key]: [...items, empty] } as any)}><Plus className="h-4 w-4" /></Button>}
    >
      {items.map((it, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
            <Button size="sm" variant="ghost" onClick={() => upd({ [key]: items.filter((_, x) => x !== i) } as any)}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
          {fields.map((f) => (
            <div key={String(f.k)}>
              <Label className="text-xs">{f.label}</Label>
              {f.area ? (
                <Textarea
                  rows={2}
                  value={(it[f.k] as any) ?? ''}
                  onChange={(e) => upd({ [key]: items.map((x, xi) => (xi === i ? { ...x, [f.k]: e.target.value } : x)) } as any)}
                />
              ) : (
                <Input
                  value={(it[f.k] as any) ?? ''}
                  onChange={(e) => upd({ [key]: items.map((x, xi) => (xi === i ? { ...x, [f.k]: e.target.value } : x)) } as any)}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </Section>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{editing.id ? 'Landingni tahrirlash' : 'Yangi landing'}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreview((p) => !p)}><Eye className="mr-2 h-4 w-4" />{preview ? 'Tahrir' : 'Ko‘rish'}</Button>
          <Button variant="ghost" onClick={() => setEditing(null)}>Bekor</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saqlanmoqda…' : 'Saqlash'}</Button>
        </div>
      </div>

      {preview ? (
        <div className="overflow-hidden rounded-2xl border">
          <LandingRenderer template={editing.template} config={config} slug={editing.slug} />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Section title="Asosiy">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label className="text-xs">Sarlavha (SEO title)</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label className="text-xs">Slug (URL)</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="target-reklama" /></div>
              <div><Label className="text-xs">Xizmat nomi</Label><Input value={editing.service || ''} onChange={(e) => setEditing({ ...editing, service: e.target.value })} /></div>
              <div>
                <Label className="text-xs">Til</Label>
                <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={editing.language} onChange={(e) => setEditing({ ...editing, language: e.target.value })}>
                  <option value="uz">O‘zbekcha</option><option value="ru">Русский</option><option value="en">English</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Shablon</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setEditing({ ...editing, template: t.key })}
                    className={`rounded-lg border p-3 text-left transition ${editing.template === t.key ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                  >
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="text-sm font-medium">E’lon qilish</p><p className="text-xs text-muted-foreground">Yoqilganda /lp/{editing.slug || 'slug'} ochiladi</p></div>
              <Switch checked={editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
            </div>
          </Section>

          <Section title="Hero (yuqori blok)">
            <div><Label className="text-xs">Brend nomi</Label><Input value={config.brand} onChange={(e) => upd({ brand: e.target.value })} /></div>
            <div><Label className="text-xs">Logo harflari</Label><Input value={config.logoText || ''} onChange={(e) => upd({ logoText: e.target.value })} /></div>
            <div><Label className="text-xs">Badge</Label><Input value={config.hero.badge || ''} onChange={(e) => upd({ hero: { ...config.hero, badge: e.target.value } })} /></div>
            <div><Label className="text-xs">Sarlavha</Label><Input value={config.hero.title} onChange={(e) => upd({ hero: { ...config.hero, title: e.target.value } })} /></div>
            <div><Label className="text-xs">Ajratilgan so‘z</Label><Input value={config.hero.highlight || ''} onChange={(e) => upd({ hero: { ...config.hero, highlight: e.target.value } })} /></div>
            <div><Label className="text-xs">Tavsif</Label><Textarea rows={3} value={config.hero.subtitle || ''} onChange={(e) => upd({ hero: { ...config.hero, subtitle: e.target.value } })} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label className="text-xs">Asosiy tugma</Label><Input value={config.hero.ctaPrimary || ''} onChange={(e) => upd({ hero: { ...config.hero, ctaPrimary: e.target.value } })} /></div>
              <div><Label className="text-xs">Ikkinchi tugma</Label><Input value={config.hero.ctaSecondary || ''} onChange={(e) => upd({ hero: { ...config.hero, ctaSecondary: e.target.value } })} /></div>
            </div>
            <div><Label className="text-xs">Kichik izoh</Label><Input value={config.hero.note || ''} onChange={(e) => upd({ hero: { ...config.hero, note: e.target.value } })} /></div>
          </Section>

          {listEditor('Statistika', config.stats, { value: '', label: '' }, 'stats', [
            { k: 'value', label: 'Qiymat' }, { k: 'label', label: 'Izoh' },
          ])}

          {listEditor('Afzalliklar', config.benefits, { title: '', text: '' }, 'benefits', [
            { k: 'title', label: 'Sarlavha' }, { k: 'text', label: 'Matn', area: true },
          ])}

          <Section title="Xizmat paketlari" action={<Button size="sm" variant="outline" onClick={() => upd({ services: [...config.services, { title: '', price: '', desc: '', features: [] }] })}><Plus className="h-4 w-4" /></Button>}>
            {config.services.map((sv, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs">
                      <Switch checked={!!sv.highlight} onCheckedChange={(v) => upd({ services: config.services.map((x, xi) => (xi === i ? { ...x, highlight: v } : x)) })} />
                      Ajratilgan
                    </label>
                    <Button size="sm" variant="ghost" onClick={() => upd({ services: config.services.filter((_, x) => x !== i) })}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input placeholder="Nomi" value={sv.title} onChange={(e) => upd({ services: config.services.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)) })} />
                  <Input placeholder="Narx" value={sv.price || ''} onChange={(e) => upd({ services: config.services.map((x, xi) => (xi === i ? { ...x, price: e.target.value } : x)) })} />
                </div>
                <Input placeholder="Tavsif" value={sv.desc || ''} onChange={(e) => upd({ services: config.services.map((x, xi) => (xi === i ? { ...x, desc: e.target.value } : x)) })} />
                <Textarea rows={3} placeholder="Xususiyatlar (har qatorga bittadan)" value={sv.features.join('\n')} onChange={(e) => upd({ services: config.services.map((x, xi) => (xi === i ? { ...x, features: e.target.value.split('\n').filter(Boolean) } : x)) })} />
              </div>
            ))}
          </Section>

          {listEditor('Ish jarayoni', config.steps, { title: '', text: '' }, 'steps', [
            { k: 'title', label: 'Bosqich' }, { k: 'text', label: 'Izoh', area: true },
          ])}

          {listEditor('Mijoz fikrlari', config.testimonials, { name: '', role: '', text: '' }, 'testimonials', [
            { k: 'name', label: 'Ism' }, { k: 'role', label: 'Kim' }, { k: 'text', label: 'Fikr', area: true },
          ])}

          {listEditor('FAQ', config.faq, { q: '', a: '' }, 'faq', [
            { k: 'q', label: 'Savol' }, { k: 'a', label: 'Javob', area: true },
          ])}

          <Section title="Lead formasi">
            <div><Label className="text-xs">Forma sarlavhasi</Label><Input value={config.form.title} onChange={(e) => upd({ form: { ...config.form, title: e.target.value } })} /></div>
            <div><Label className="text-xs">Tavsif</Label><Input value={config.form.subtitle || ''} onChange={(e) => upd({ form: { ...config.form, subtitle: e.target.value } })} /></div>
            <div><Label className="text-xs">Tugma matni</Label><Input value={config.form.button} onChange={(e) => upd({ form: { ...config.form, button: e.target.value } })} /></div>
            <div>
              <Label className="text-xs">Maydonlar</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {FIELDS.map((f) => {
                  const on = config.form.fields.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => upd({ form: { ...config.form, fields: on ? config.form.fields.filter((x) => x !== f) : [...config.form.fields, f] } })}
                      className={`rounded-full border px-3 py-1 text-xs ${on ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                    >{f}</button>
                  );
                })}
              </div>
            </div>
            <div><Label className="text-xs">Xizmat variantlari (har qatorga bittadan)</Label>
              <Textarea rows={4} value={config.form.serviceOptions.join('\n')} onChange={(e) => upd({ form: { ...config.form, serviceOptions: e.target.value.split('\n').filter(Boolean) } })} />
            </div>
            <div><Label className="text-xs">Muvaffaqiyat xabari</Label><Input value={config.form.success} onChange={(e) => upd({ form: { ...config.form, success: e.target.value } })} /></div>
            <div><Label className="text-xs">Maxfiylik izohi</Label><Input value={config.form.privacy || ''} onChange={(e) => upd({ form: { ...config.form, privacy: e.target.value } })} /></div>
          </Section>

          <Section title="Kontakt va dizayn">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label className="text-xs">Telefon</Label><Input value={config.contact.phone || ''} onChange={(e) => upd({ contact: { ...config.contact, phone: e.target.value } })} /></div>
              <div><Label className="text-xs">Telegram havola</Label><Input value={config.contact.telegram || ''} onChange={(e) => upd({ contact: { ...config.contact, telegram: e.target.value } })} /></div>
              <div><Label className="text-xs">Email</Label><Input value={config.contact.email || ''} onChange={(e) => upd({ contact: { ...config.contact, email: e.target.value } })} /></div>
              <div><Label className="text-xs">Manzil</Label><Input value={config.contact.address || ''} onChange={(e) => upd({ contact: { ...config.contact, address: e.target.value } })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {(['primary', 'bg', 'surface', 'text', 'muted'] as const).map((k) => (
                <div key={k}>
                  <Label className="text-xs capitalize">{k}</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" className="h-9 w-9 rounded border" value={config.colors[k]} onChange={(e) => upd({ colors: { ...config.colors, [k]: e.target.value } })} />
                    <Input value={config.colors[k]} onChange={(e) => upd({ colors: { ...config.colors, [k]: e.target.value } })} />
                  </div>
                </div>
              ))}
            </div>
            <div><Label className="text-xs">Footer matni</Label><Input value={config.footerNote || ''} onChange={(e) => upd({ footerNote: e.target.value })} /></div>
          </Section>
        </div>
      )}
    </div>
  );
};

export default AdminLandings;
