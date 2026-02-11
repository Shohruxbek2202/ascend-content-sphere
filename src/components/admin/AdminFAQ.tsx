import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';

const SERVICE_CATEGORIES = [
  { value: 'general', label: 'Umumiy' },
  { value: 'smm', label: 'SMM' },
  { value: 'seo', label: 'SEO' },
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'facebook-ads', label: 'Facebook/Meta Ads' },
  { value: 'content-marketing', label: 'Content Marketing' },
  { value: 'personal-development', label: 'Shaxsiy Rivojlanish' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
];

const AdminFAQ = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [form, setForm] = useState({
    service_category: 'general',
    question_uz: '', question_ru: '', question_en: '',
    answer_uz: '', answer_ru: '', answer_en: '',
    sort_order: 0, published: true,
  });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faqs', filterCategory],
    queryFn: async () => {
      let query = supabase.from('faqs').select('*').order('service_category').order('sort_order');
      if (filterCategory !== 'all') query = query.eq('service_category', filterCategory);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (faqData: any) => {
      if (editingFaq) {
        const { error } = await supabase.from('faqs').update(faqData).eq('id', editingFaq.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('faqs').insert(faqData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      toast.success(editingFaq ? 'FAQ yangilandi' : 'FAQ qo\'shildi');
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      toast.success('FAQ o\'chirildi');
    },
  });

  const resetForm = () => {
    setForm({ service_category: 'general', question_uz: '', question_ru: '', question_en: '', answer_uz: '', answer_ru: '', answer_en: '', sort_order: 0, published: true });
    setEditingFaq(null);
    setIsOpen(false);
  };

  const openEdit = (faq: any) => {
    setEditingFaq(faq);
    setForm({
      service_category: faq.service_category,
      question_uz: faq.question_uz, question_ru: faq.question_ru, question_en: faq.question_en,
      answer_uz: faq.answer_uz, answer_ru: faq.answer_ru, answer_en: faq.answer_en,
      sort_order: faq.sort_order, published: faq.published,
    });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="w-6 h-6" /> FAQ Boshqaruvi</h1>
          <p className="text-muted-foreground">Xizmatlar uchun savol-javoblar (FAQPage Schema avtomatik)</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { if (!v) resetForm(); setIsOpen(v); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Yangi FAQ</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'FAQ tahrirlash' : 'Yangi FAQ'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kategoriya</Label>
                  <Select value={form.service_category} onValueChange={(v) => setForm({ ...form, service_category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tartib</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
                </div>
              </div>
              {['uz', 'ru', 'en'].map(lang => (
                <div key={lang} className="space-y-2 p-3 border rounded-lg">
                  <h4 className="font-medium uppercase text-xs text-muted-foreground">{lang === 'uz' ? 'O\'zbekcha' : lang === 'ru' ? 'Ruscha' : 'Inglizcha'}</h4>
                  <div>
                    <Label>Savol ({lang})</Label>
                    <Input value={(form as any)[`question_${lang}`]} onChange={(e) => setForm({ ...form, [`question_${lang}`]: e.target.value })} />
                  </div>
                  <div>
                    <Label>Javob ({lang})</Label>
                    <Textarea rows={3} value={(form as any)[`answer_${lang}`]} onChange={(e) => setForm({ ...form, [`answer_${lang}`]: e.target.value })} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label>Chop etilgan</Label>
              </div>
              <Button className="w-full" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hammasi</SelectItem>
            {SERVICE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground self-center">{faqs?.length || 0} ta FAQ</span>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Yuklanmoqda...</div>
      ) : (
        <div className="space-y-3">
          {faqs?.map((faq: any) => (
            <Card key={faq.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{faq.service_category}</span>
                      {!faq.published && <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500">Draft</span>}
                      <span className="text-xs text-muted-foreground">#{faq.sort_order}</span>
                    </div>
                    <p className="font-medium">{faq.question_uz}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer_uz}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(faq)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(faq.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!faqs || faqs.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">Hali FAQ qo'shilmagan</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFAQ;
