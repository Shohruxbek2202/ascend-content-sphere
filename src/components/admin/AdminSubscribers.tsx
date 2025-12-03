import { useState, useEffect } from 'react';
import { Users, Mail, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Subscriber {
  id: string;
  email: string;
  language: string;
  active: boolean;
  subscribed_at: string;
}

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (data) setSubscribers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('subscribers')
      .update({ 
        active: !currentStatus,
        unsubscribed_at: !currentStatus ? null : new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      toast.error('Xatolik yuz berdi');
    } else {
      toast.success(currentStatus ? 'Obunachi faolsizlantirildi' : 'Obunachi faollashtirildi');
      fetchSubscribers();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('subscribers').delete().eq('id', deleteId);

    if (error) {
      toast.error('Xatolik yuz berdi');
    } else {
      toast.success('Obunachi o\'chirildi');
      fetchSubscribers();
    }

    setDeleteId(null);
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Til', 'Status', 'Obuna sanasi'];
    const rows = subscribers.map((s) => [
      s.email,
      s.language.toUpperCase(),
      s.active ? 'Faol' : 'Faolsiz',
      new Date(s.subscribed_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('CSV fayl yuklandi');
  };

  const activeCount = subscribers.filter((s) => s.active).length;
  const langStats = subscribers.reduce(
    (acc, s) => {
      acc[s.language] = (acc[s.language] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Obunchilar</h1>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold">Obunchilar</h1>
        <Button onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          CSV Yuklash
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{subscribers.length}</div>
            <div className="text-sm text-muted-foreground">Jami</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{activeCount}</div>
            <div className="text-sm text-muted-foreground">Faol</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {subscribers.length - activeCount}
            </div>
            <div className="text-sm text-muted-foreground">Faolsiz</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center gap-2">
              {Object.entries(langStats).map(([lang, count]) => (
                <Badge key={lang} variant="outline">
                  {lang.toUpperCase()}: {count}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground text-center mt-1">Tillar</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {subscribers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Hali obunchilar yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Til</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Obuna sanasi</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {subscriber.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {subscriber.language === 'uz' && '🇺🇿 UZ'}
                      {subscriber.language === 'ru' && '🇷🇺 RU'}
                      {subscriber.language === 'en' && '🇬🇧 EN'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={subscriber.active ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleActive(subscriber.id, subscriber.active)}
                    >
                      {subscriber.active ? 'Faol' : 'Faolsiz'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(subscriber.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ishonchingiz komilmi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu obunachini o'chirsangiz, uni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSubscribers;
