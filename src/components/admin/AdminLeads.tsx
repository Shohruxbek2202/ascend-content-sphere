import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'];

const AdminLeads = () => {
  const qc = useQueryClient();
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ['admin-leads'] });
  };

  const remove = async (id: string) => {
    if (!confirm('O‘chirilsinmi?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('O‘chirildi');
    qc.invalidateQueries({ queryKey: ['admin-leads'] });
  };

  const csv = () => {
    const rows = [['Sana', 'Ism', 'Telefon', 'Email', 'Xizmat', 'Landing', 'Status', 'Xabar']];
    leads.forEach((l: any) => rows.push([
      new Date(l.created_at).toLocaleString(), l.name || '', l.phone || '', l.email || '',
      l.service || '', l.landing_slug || '', l.status, (l.message || '').replace(/\n/g, ' '),
    ]));
    const blob = new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leads.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leadlar</h1>
          <p className="text-sm text-muted-foreground">Landinglardan kelgan arizalar ({leads.length})</p>
        </div>
        <Button variant="outline" onClick={csv} disabled={!leads.length}>CSV yuklab olish</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Yuklanmoqda…</p>
      ) : leads.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">Hozircha lead yo‘q.</Card>
      ) : (
        <div className="space-y-3">
          {leads.map((l: any) => (
            <Card key={l.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{l.name || 'Ismsiz'}</span>
                    {l.phone && <a className="text-sm text-primary underline" href={`tel:${l.phone}`}>{l.phone}</a>}
                    {l.email && <span className="text-sm text-muted-foreground">{l.email}</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleString()} · {l.landing_slug || '—'} {l.service ? `· ${l.service}` : ''}
                  </p>
                  {l.message && <p className="mt-2 text-sm">{l.message}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <select className="h-9 rounded-md border bg-background px-2 text-sm" value={l.status} onChange={(e) => setStatus(l.id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Button size="sm" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
