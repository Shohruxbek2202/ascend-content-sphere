import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Network, Link2 } from 'lucide-react';

const AdminTopicClusters = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState<any>(null);
  const [linkOpen, setLinkOpen] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [form, setForm] = useState({
    name_uz: '', name_ru: '', name_en: '',
    slug: '',
    description_uz: '', description_ru: '', description_en: '',
    pillar_post_id: '',
  });

  const { data: clusters, isLoading } = useQuery({
    queryKey: ['admin-topic-clusters'],
    queryFn: async () => {
      const { data, error } = await supabase.from('topic_clusters').select('*, cluster_posts(*, posts:post_id(id, title_uz, slug))').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: allPosts } = useQuery({
    queryKey: ['all-posts-for-clusters'],
    queryFn: async () => {
      const { data, error } = await supabase.from('posts').select('id, title_uz, slug').eq('published', true).order('title_uz');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (d: any) => {
      const saveData = { ...d, pillar_post_id: d.pillar_post_id || null };
      if (editingCluster) {
        const { error } = await supabase.from('topic_clusters').update(saveData).eq('id', editingCluster.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('topic_clusters').insert(saveData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topic-clusters'] });
      toast.success('Saqlandi');
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('topic_clusters').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topic-clusters'] });
      toast.success('O\'chirildi');
    },
  });

  const addPostMutation = useMutation({
    mutationFn: async ({ clusterId, postId }: { clusterId: string; postId: string }) => {
      const { error } = await supabase.from('cluster_posts').insert({ cluster_id: clusterId, post_id: postId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topic-clusters'] });
      setSelectedPostId('');
      toast.success('Post qo\'shildi');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cluster_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topic-clusters'] });
      toast.success('Post olib tashlandi');
    },
  });

  const resetForm = () => {
    setForm({ name_uz: '', name_ru: '', name_en: '', slug: '', description_uz: '', description_ru: '', description_en: '', pillar_post_id: '' });
    setEditingCluster(null);
    setIsOpen(false);
  };

  const openEdit = (cluster: any) => {
    setEditingCluster(cluster);
    setForm({
      name_uz: cluster.name_uz, name_ru: cluster.name_ru, name_en: cluster.name_en,
      slug: cluster.slug,
      description_uz: cluster.description_uz || '', description_ru: cluster.description_ru || '', description_en: cluster.description_en || '',
      pillar_post_id: cluster.pillar_post_id || '',
    });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Network className="w-6 h-6" /> Topic Clusters</h1>
          <p className="text-muted-foreground">Kontent klasterlar — pillar post + cluster maqolalar</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { if (!v) resetForm(); setIsOpen(v); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Yangi Cluster</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingCluster ? 'Tahrirlash' : 'Yangi Cluster'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
              {['uz', 'ru', 'en'].map(lang => (
                <div key={lang} className="space-y-2 p-3 border rounded-lg">
                  <h4 className="font-medium uppercase text-xs text-muted-foreground">{lang}</h4>
                  <div><Label>Nomi</Label><Input value={(form as any)[`name_${lang}`]} onChange={e => setForm({ ...form, [`name_${lang}`]: e.target.value })} /></div>
                  <div><Label>Tavsif</Label><Textarea rows={2} value={(form as any)[`description_${lang}`]} onChange={e => setForm({ ...form, [`description_${lang}`]: e.target.value })} /></div>
                </div>
              ))}
              <div>
                <Label>Pillar Post</Label>
                <Select value={form.pillar_post_id} onValueChange={v => setForm({ ...form, pillar_post_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Tanlang..." /></SelectTrigger>
                  <SelectContent>
                    {allPosts?.map(p => <SelectItem key={p.id} value={p.id}>{p.title_uz}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="text-center py-8">Yuklanmoqda...</div> : (
        <div className="space-y-4">
          {clusters?.map((cluster: any) => (
            <Card key={cluster.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{cluster.name_uz}</p>
                    <p className="text-sm text-muted-foreground">{cluster.slug} · {cluster.cluster_posts?.length || 0} post</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setLinkOpen(linkOpen === cluster.id ? null : cluster.id)}><Link2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(cluster)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(cluster.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                {linkOpen === cluster.id && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex gap-2">
                      <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Post tanlang..." /></SelectTrigger>
                        <SelectContent>
                          {allPosts?.filter(p => !cluster.cluster_posts?.some((cp: any) => cp.post_id === p.id)).map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.title_uz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => selectedPostId && addPostMutation.mutate({ clusterId: cluster.id, postId: selectedPostId })}>Qo'shish</Button>
                    </div>
                    {cluster.cluster_posts?.map((cp: any) => (
                      <div key={cp.id} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                        <span>{cp.posts?.title_uz || 'Unknown'}</span>
                        <Button variant="ghost" size="sm" onClick={() => removePostMutation.mutate(cp.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {(!clusters || clusters.length === 0) && <div className="text-center py-12 text-muted-foreground">Hali cluster yaratilmagan</div>}
        </div>
      )}
    </div>
  );
};

export default AdminTopicClusters;
