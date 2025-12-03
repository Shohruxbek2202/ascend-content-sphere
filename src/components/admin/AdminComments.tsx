import { useState, useEffect } from 'react';
import { Check, X, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

interface Comment {
  id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  approved: boolean;
  created_at: string;
  posts?: {
    title_uz: string;
    slug: string;
  };
}

const AdminComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchComments = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        posts (
          title_uz,
          slug
        )
      `)
      .order('created_at', { ascending: false });

    if (data) setComments(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('comments')
      .update({ approved: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Xatolik yuz berdi');
    } else {
      toast.success(currentStatus ? 'Izoh yashirildi' : 'Izoh tasdiqlandi');
      fetchComments();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('comments').delete().eq('id', deleteId);

    if (error) {
      toast.error('Xatolik yuz berdi');
    } else {
      toast.success('Izoh o\'chirildi');
      fetchComments();
    }

    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Izohlar</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Izohlar</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <MessageSquare className="w-4 h-4 mr-2" />
          {comments.length} ta izoh
        </Badge>
      </div>

      {comments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Hali izohlar yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{comment.author_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={comment.approved ? 'default' : 'secondary'}>
                        {comment.approved ? 'Tasdiqlangan' : 'Kutilmoqda'}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-3">{comment.content}</p>

                    {comment.posts && (
                      <a
                        href={`/blog/${comment.posts.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        📝 {comment.posts.title_uz}
                      </a>
                    )}
                  </div>

                  <div className="flex sm:flex-col gap-2">
                    <Button
                      variant={comment.approved ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toggleApproval(comment.id, comment.approved)}
                    >
                      {comment.approved ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Yashirish
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Tasdiqlash
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(comment.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      O'chirish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ishonchingiz komilmi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu izohni o'chirsangiz, uni qaytarib bo'lmaydi.
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

export default AdminComments;
