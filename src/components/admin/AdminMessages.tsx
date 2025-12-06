import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Trash2, Check, Eye } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setMessages(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      toast.error('Xatolik yuz berdi');
    } else {
      fetchMessages();
    }
  };

  const handleView = (message: ContactMessage) => {
    setViewMessage(message);
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('contact_messages').delete().eq('id', deleteId);

    if (error) {
      toast.error('Xatolik yuz berdi');
    } else {
      toast.success('Xabar o\'chirildi');
      fetchMessages();
    }

    setDeleteId(null);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Xabarlar</h1>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Xabarlar</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} yangi</Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{messages.length}</div>
            <div className="text-sm text-muted-foreground">Jami xabarlar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{unreadCount}</div>
            <div className="text-sm text-muted-foreground">O'qilmagan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {messages.length - unreadCount}
            </div>
            <div className="text-sm text-muted-foreground">O'qilgan</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Hali xabarlar yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ism</TableHead>
                <TableHead>Mavzu</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id} className={!message.read ? 'bg-accent/20' : ''}>
                  <TableCell className="font-medium">{message.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{message.subject}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {message.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(message.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={message.read ? 'secondary' : 'default'}>
                      {message.read ? 'O\'qilgan' : 'Yangi'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(message)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!message.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(message.id)}
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(message.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Message Dialog */}
      <Dialog open={!!viewMessage} onOpenChange={() => setViewMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewMessage?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Ism: </span>
                <span className="font-medium">{viewMessage?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <a href={`mailto:${viewMessage?.email}`} className="font-medium text-primary">
                  {viewMessage?.email}
                </a>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Sana: </span>
                <span className="font-medium">
                  {viewMessage && new Date(viewMessage.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-muted-foreground text-sm mb-2">Xabar:</p>
              <p className="whitespace-pre-wrap">{viewMessage?.message}</p>
            </div>
            <div className="flex justify-end">
              <Button asChild>
                <a href={`mailto:${viewMessage?.email}?subject=Re: ${viewMessage?.subject}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Javob yozish
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ishonchingiz komilmi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu xabarni o'chirsangiz, uni qaytarib bo'lmaydi.
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

export default AdminMessages;