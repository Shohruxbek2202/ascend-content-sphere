import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Mic, ExternalLink } from "lucide-react";

interface Podcast {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  html_embed: string;
  cover_image: string | null;
  episode_number: number | null;
  duration: string | null;
  guest_name: string | null;
  published: boolean;
  published_at: string;
}

const empty = {
  slug: "",
  title: "",
  description: "",
  html_embed: "",
  cover_image: "",
  episode_number: "",
  duration: "",
  guest_name: "",
  published: true,
};

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const AdminPodcasts = () => {
  const [list, setList] = useState<Podcast[]>([]);
  const [editing, setEditing] = useState<Podcast | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("podcasts").select("*").order("published_at", { ascending: false });
    setList((data || []) as Podcast[]);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (p: Podcast) => {
    setEditing(p);
    setForm({
      slug: p.slug,
      title: p.title,
      description: p.description || "",
      html_embed: p.html_embed,
      cover_image: p.cover_image || "",
      episode_number: p.episode_number?.toString() || "",
      duration: p.duration || "",
      guest_name: p.guest_name || "",
      published: p.published,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.html_embed.trim()) {
      toast.error("Sarlavha va HTML embed majburiy");
      return;
    }
    setSaving(true);
    const payload = {
      slug: form.slug.trim() || slugify(form.title),
      title: form.title.trim(),
      description: form.description.trim() || null,
      html_embed: form.html_embed,
      cover_image: form.cover_image.trim() || null,
      episode_number: form.episode_number ? Number(form.episode_number) : null,
      duration: form.duration.trim() || null,
      guest_name: form.guest_name.trim() || null,
      published: form.published,
    };

    const { error } = editing
      ? await supabase.from("podcasts").update(payload).eq("id", editing.id)
      : await supabase.from("podcasts").insert(payload);

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Yangilandi" : "Qo'shildi");
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    const { error } = await supabase.from("podcasts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("O'chirildi");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mic className="w-7 h-7 text-primary" /> Podcast Epizodlar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">HTML embed'larni qo'lda joylashtiring (Spotify, SoundCloud, YouTube va h.k.)</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Yangi Epizod
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">{editing ? "Epizodni tahrirlash" : "Yangi epizod"}</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Sarlavha *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Slug (bo'sh qoldiring — avtomatik)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="episode-1-marketing" />
            </div>
            <div>
              <Label>Epizod raqami</Label>
              <Input type="number" value={form.episode_number} onChange={(e) => setForm({ ...form, episode_number: e.target.value })} />
            </div>
            <div>
              <Label>Davomiyligi</Label>
              <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="42:15" />
            </div>
            <div>
              <Label>Mehmon</Label>
              <Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} />
            </div>
            <div>
              <Label>Muqova URL</Label>
              <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
            </div>
          </div>

          <div>
            <Label>Tavsif</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <Label>HTML Embed kodi *</Label>
            <Textarea
              rows={8}
              value={form.html_embed}
              onChange={(e) => setForm({ ...form, html_embed: e.target.value })}
              placeholder={'<iframe src="https://open.spotify.com/embed/episode/..." width="100%" height="232" ...></iframe>'}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Spotify / SoundCloud / YouTube / Apple Podcasts embed kodini shu yerga joylashtiring
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
            <Label>Chop etilgan (public'da ko'rinadi)</Label>
          </div>

          {form.html_embed && (
            <div>
              <Label>Ko'rinishi</Label>
              <div className="border rounded p-3 bg-muted/30 mt-1" dangerouslySetInnerHTML={{ __html: form.html_embed }} />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Bekor qilish</Button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {list.length === 0 && !showForm && (
          <div className="border rounded-lg p-12 text-center text-muted-foreground">
            <Mic className="w-10 h-10 mx-auto mb-3 opacity-50" />
            Hali epizod yo'q. Birinchisini qo'shing.
          </div>
        )}
        {list.map((p) => (
          <div key={p.id} className="bg-card border rounded-lg p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
              {p.cover_image ? (
                <img src={p.cover_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Mic className="w-6 h-6 opacity-40" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                {p.episode_number != null && <span className="font-mono">EP {String(p.episode_number).padStart(2, "0")}</span>}
                {p.duration && <span>· {p.duration}</span>}
                {!p.published && <span className="text-orange-500 font-semibold">· DRAFT</span>}
              </div>
              <div className="font-semibold truncate">{p.title}</div>
              <div className="text-xs text-muted-foreground truncate">/{p.slug}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" asChild>
                <a href={`/podcast/${p.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" /></a>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPodcasts;
