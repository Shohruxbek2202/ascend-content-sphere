import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

interface Category {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  icon: string | null;
  color: string | null;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    slug: '',
    name_uz: '',
    name_ru: '',
    name_en: '',
    description_uz: '',
    description_ru: '',
    description_en: '',
    icon: '',
    color: '#3B82F6',
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name_en');

    if (data) setCategories(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      slug: '',
      name_uz: '',
      name_ru: '',
      name_en: '',
      description_uz: '',
      description_ru: '',
      description_en: '',
      icon: '',
      color: '#3B82F6',
    });
    setEditingCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      name_uz: category.name_uz,
      name_ru: category.name_ru,
      name_en: category.name_en,
      description_uz: category.description_uz || '',
      description_ru: category.description_ru || '',
      description_en: category.description_en || '',
      icon: category.icon || '',
      color: category.color || '#3B82F6',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name_uz || !formData.name_ru || !formData.name_en) {
      toast.error('Barcha tillardagi nomlarni kiriting');
      return;
    }

    setIsSaving(true);

    const categoryData = {
      slug: formData.slug || formData.name_en.toLowerCase().replace(/\s+/g, '-'),
      name_uz: formData.name_uz,
      name_ru: formData.name_ru,
      name_en: formData.name_en,
      description_uz: formData.description_uz || null,
      description_ru: formData.description_ru || null,
      description_en: formData.description_en || null,
      icon: formData.icon || null,
      color: formData.color,
    };

    let error;

    if (editingCategory) {
      const result = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      error = result.error;
    } else {
      const result = await supabase.from('categories').insert(categoryData);
      error = result.error;
    }

    if (error) {
      toast.error('Xatolik: ' + error.message);
    } else {
      toast.success(editingCategory ? 'Kategoriya yangilandi' : 'Kategoriya yaratildi');
      setIsDialogOpen(false);
      resetForm();
      fetchCategories();
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('categories').delete().eq('id', deleteId);

    if (error) {
      toast.error('Xatolik: ' + error.message);
    } else {
      toast.success('Kategoriya o\'chirildi');
      fetchCategories();
    }

    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kategoriyalar</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yangi Kategoriya
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="category-slug"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Icon (Lucide nomi)</Label>
                    <Input
                      value={formData.icon}
                      onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                      placeholder="TrendingUp"
                    />
                  </div>
                  <div>
                    <Label>Rang</Label>
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Nom (UZ)</Label>
                  <Input
                    value={formData.name_uz}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name_uz: e.target.value }))}
                    placeholder="O'zbekcha nom"
                  />
                </div>
                <div>
                  <Label>Nom (RU)</Label>
                  <Input
                    value={formData.name_ru}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name_ru: e.target.value }))}
                    placeholder="Русское название"
                  />
                </div>
                <div>
                  <Label>Nom (EN)</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name_en: e.target.value }))}
                    placeholder="English name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Tavsif (UZ)</Label>
                  <Input
                    value={formData.description_uz}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description_uz: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Tavsif (RU)</Label>
                  <Input
                    value={formData.description_ru}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description_ru: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Tavsif (EN)</Label>
                  <Input
                    value={formData.description_en}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description_en: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  >
                    {category.icon ? category.icon.charAt(0) : '📁'}
                  </div>
                  <div>
                    <CardTitle className="text-base">{category.name_uz}</CardTitle>
                    <p className="text-xs text-muted-foreground">{category.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(category.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description_uz || 'Tavsif yo\'q'}
                </p>
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
              Bu kategoriyani o'chirsangiz, unga bog'langan postlar kategoriyasiz qoladi.
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

export default AdminCategories;
