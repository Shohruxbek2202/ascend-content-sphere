import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import PostEditor from './PostEditor';

interface Post {
  id: string;
  slug: string;
  title_uz: string;
  published: boolean;
  views: number | null;
  likes: number | null;
  created_at: string;
  categories?: {
    name_uz: string;
  };
}

const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);

    const { data } = await supabase
      .from('posts')
      .select(`
        id,
        slug,
        title_uz,
        published,
        views,
        likes,
        created_at,
        categories (
          name_uz
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('posts').delete().eq('id', deleteId);

    if (error) {
      toast.error('Xatolik yuz berdi');
    } else {
      toast.success('Post o\'chirildi');
      fetchPosts();
    }

    setDeleteId(null);
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('posts')
      .update({ 
        published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (error) {
      toast.error('Xatolik yuz berdi');
    } else {
      toast.success(currentStatus ? 'Post yashirildi' : 'Post nashr qilindi');
      fetchPosts();
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title_uz.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <Link to="/admin/posts/new">
            <Plus className="w-4 h-4 mr-2" />
            Yangi Post
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sarlavha</TableHead>
              <TableHead>Kategoriya</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ko'rishlar</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Hech narsa topilmadi
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {post.title_uz}
                  </TableCell>
                  <TableCell>
                    {post.categories?.name_uz || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.published ? 'default' : 'secondary'}>
                      {post.published ? 'Nashr qilingan' : 'Qoralama'}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.views || 0}</TableCell>
                  <TableCell>
                    {new Date(post.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/posts/${post.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Tahrirlash
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => togglePublished(post.id, post.published)}
                        >
                          {post.published ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Yashirish
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Nashr qilish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(post.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          O'chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ishonchingiz komilmi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni bekor qilib bo'lmaydi. Post butunlay o'chiriladi.
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

const AdminPosts = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Postlar</h1>
      <Routes>
        <Route path="/" element={<PostsList />} />
        <Route path="/new" element={<PostEditor />} />
        <Route path="/:id" element={<PostEditor />} />
      </Routes>
    </div>
  );
};

export default AdminPosts;
