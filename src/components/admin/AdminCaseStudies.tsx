import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';

const AdminCaseStudies = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    slug: '', client_name: '', service_type: 'digital-marketing',
    title_uz: '', title_ru: '', title_en: '',
    description_uz: '', description_ru: '', description_en: '',
    challenge_uz: '', challenge_ru: '', challenge_en: '',
    solution_uz: '', solution_ru: '', solution_en: '',
    results_uz: '', results_ru: '', results_en: '',
    featured_image: '', published: false, featured: false,
    metrics: '[]',
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-case-studies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('case_studies').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (d: any) => {
      const saveData = { ...d, metrics: JSON.parse(d.metrics || '[]') };
      if (editingItem) {
        const { error } = await supabase.from('case_studies').update(saveData).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('case_studies').insert(saveData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-case-studies'] });
      toast.success(editingItem ? 'Yangilandi' : 'Qo\'shildi');
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('case_studies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-case-studies'] });
      toast.success('O\'chirildi');
    },
  });

  const resetForm = () => {
    setForm({ slug: '', client_name: '', service_type: 'digital-marketing', title_uz: '', title_ru: '', title_en: '', description_uz: '', description_ru: '', description_en: '', challenge_uz: '', challenge_ru: '', challenge_en: '', solution_uz: '', solution_ru: '', solution_en: '', results_uz: '', results_ru: '', results_en: '', featured_image: '', published: false, featured: false, metrics: '[]' });
    setEditingItem(null);
    setIsOpen(false);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      slug: item.slug, client_name: item.client_name || '', service_type: item.service_type,
      title_uz: item.title_uz, title_ru: item.title_ru, title_en: item.title_en,
      description_uz: item.description_uz, description_ru: item.description_ru, description_en: item.description_en,
      challenge_uz: item.challenge_uz || '', challenge_ru: item.challenge_ru || '', challenge_en: item.challenge_en || '',
      solution_uz: item.solution_uz || '', solution_ru: item.solution_ru || '', solution_en: item.solution_en || '',
      results_uz: item.results_uz || '', results_ru: item.results_ru || '', results_en: item.results_en || '',
      featured_image: item.featured_image || '', published: item.published, featured: item.featured,
      metrics: JSON.stringify(item.metrics || [], null, 2),
    });
    setIsOpen(true);
  };

  const updateField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="w-6 h-6" /> Case Studies</h1>
          <p className="text-muted-foreground">Real natijalar va tajribalar</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { if (!v) resetForm(); setIsOpen(v); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Yangi Case Study</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Tahrirlash' : 'Yangi Case Study'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Slug</Label><Input value={form.slug} onChange={e => updateField('slug', e.target.value)} /></div>
                <div><Label>Mijoz nomi</Label><Input value={form.client_name} onChange={e => updateField('client_name', e.target.value)} /></div>
                <div>
                  <Label>Xizmat turi</Label>
                  <Select value={form.service_type} onValueChange={v => updateField('service_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                      <SelectItem value="smm">SMM</SelectItem>
                      <SelectItem value="seo">SEO</SelectItem>
                      <SelectItem value="google-ads">Google Ads</SelectItem>
                      <SelectItem value="facebook-ads">Facebook Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Rasm URL</Label><Input value={form.featured_image} onChange={e => updateField('featured_image', e.target.value)} /></div>
              {['uz', 'ru', 'en'].map(lang => (
                <div key={lang} className="space-y-2 p-3 border rounded-lg">
                  <h4 className="font-medium uppercase text-xs text-muted-foreground">{lang}</h4>
                  <div><Label>Sarlavha</Label><Input value={(form as any)[`title_${lang}`]} onChange={e => updateField(`title_${lang}`, e.target.value)} /></div>
                  <div><Label>Tavsif</Label><Textarea rows={2} value={(form as any)[`description_${lang}`]} onChange={e => updateField(`description_${lang}`, e.target.value)} /></div>
                  <div><Label>Muammo</Label><Textarea rows={2} value={(form as any)[`challenge_${lang}`]} onChange={e => updateField(`challenge_${lang}`, e.target.value)} /></div>
                  <div><Label>Yechim</Label><Textarea rows={2} value={(form as any)[`solution_${lang}`]} onChange={e => updateField(`solution_${lang}`, e.target.value)} /></div>
                  <div><Label>Natijalar</Label><Textarea rows={2} value={(form as any)[`results_${lang}`]} onChange={e => updateField(`results_${lang}`, e.target.value)} /></div>
                </div>
              ))}
              <div>
                <Label>Metrikalar (JSON)</Label>
                <Textarea rows={3} value={form.metrics} onChange={e => updateField('metrics', e.target.value)} placeholder='[{"label": "ROI", "value": "350%"}]' />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={v => updateField('published', v)} /><Label>Chop etilgan</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={v => updateField('featured', v)} /><Label>Featured</Label></div>
              </div>
              <Button className="w-full" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="text-center py-8">Yuklanmoqda...</div> : (
        <div className="grid gap-4">
          {items?.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{item.service_type}</span>
                    {item.published ? <span className="text-xs text-green-500">✓ Published</span> : <span className="text-xs text-yellow-500">Draft</span>}
                  </div>
                  <p className="font-medium">{item.title_uz}</p>
                  <p className="text-sm text-muted-foreground">{item.client_name} · {item.description_uz?.substring(0, 100)}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!items || items.length === 0) && <div className="text-center py-12 text-muted-foreground">Hali case study qo'shilmagan</div>}
        </div>
      )}
    </div>
  );
};

export default AdminCaseStudies;
