import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Category {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
}

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title_uz: '',
    title_ru: '',
    title_en: '',
    excerpt_uz: '',
    excerpt_ru: '',
    excerpt_en: '',
    content_uz: '',
    content_ru: '',
    content_en: '',
    category_id: '',
    featured_image: '',
    tags: '',
    reading_time: 5,
    published: false,
    featured: false,
  });

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };

    fetchCategories();

    // Fetch post if editing
    if (isEditing) {
      const fetchPost = async () => {
        setIsLoading(true);
        const { data } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          setFormData({
            slug: data.slug,
            title_uz: data.title_uz,
            title_ru: data.title_ru,
            title_en: data.title_en,
            excerpt_uz: data.excerpt_uz || '',
            excerpt_ru: data.excerpt_ru || '',
            excerpt_en: data.excerpt_en || '',
            content_uz: data.content_uz,
            content_ru: data.content_ru,
            content_en: data.content_en,
            category_id: data.category_id || '',
            featured_image: data.featured_image || '',
            tags: (data.tags || []).join(', '),
            reading_time: data.reading_time || 5,
            published: data.published,
            featured: data.featured,
          });
        }
        setIsLoading(false);
      };

      fetchPost();
    }
  }, [id, isEditing]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string, lang: 'uz' | 'ru' | 'en') => {
    setFormData((prev) => ({
      ...prev,
      [`title_${lang}`]: value,
      ...(lang === 'en' && !isEditing ? { slug: generateSlug(value) } : {}),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm fayllari yuklanishi mumkin');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, featured_image: publicUrl }));
      toast.success('Rasm muvaffaqiyatli yuklandi');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Rasm yuklashda xatolik: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_uz || !formData.title_ru || !formData.title_en) {
      toast.error('Barcha tillardagi sarlavhalarni kiriting');
      return;
    }

    if (!formData.content_uz || !formData.content_ru || !formData.content_en) {
      toast.error('Barcha tillardagi kontentni kiriting');
      return;
    }

    setIsSaving(true);

    const postData = {
      slug: formData.slug || generateSlug(formData.title_en),
      title_uz: formData.title_uz,
      title_ru: formData.title_ru,
      title_en: formData.title_en,
      excerpt_uz: formData.excerpt_uz || null,
      excerpt_ru: formData.excerpt_ru || null,
      excerpt_en: formData.excerpt_en || null,
      content_uz: formData.content_uz,
      content_ru: formData.content_ru,
      content_en: formData.content_en,
      category_id: formData.category_id || null,
      featured_image: formData.featured_image || null,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      reading_time: formData.reading_time,
      published: formData.published,
      featured: formData.featured,
      published_at: formData.published ? new Date().toISOString() : null,
    };

    let error;

    if (isEditing) {
      const result = await supabase
        .from('posts')
        .update(postData)
        .eq('id', id);
      error = result.error;
    } else {
      const result = await supabase.from('posts').insert(postData);
      error = result.error;
    }

    if (error) {
      toast.error('Xatolik yuz berdi: ' + error.message);
    } else {
      toast.success(isEditing ? 'Post yangilandi' : 'Post yaratildi');
      navigate('/admin/posts');
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={() => navigate('/admin/posts')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga
        </Button>
        <Button type="submit" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Multilingual Content */}
          <Card>
            <CardHeader>
              <CardTitle>Kontent</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="uz">
                <TabsList className="mb-4">
                  <TabsTrigger value="uz">🇺🇿 O'zbek</TabsTrigger>
                  <TabsTrigger value="ru">🇷🇺 Русский</TabsTrigger>
                  <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                </TabsList>

                {(['uz', 'ru', 'en'] as const).map((lang) => (
                  <TabsContent key={lang} value={lang} className="space-y-4">
                    <div>
                      <Label>Sarlavha ({lang.toUpperCase()})</Label>
                      <Input
                        value={formData[`title_${lang}`]}
                        onChange={(e) => handleTitleChange(e.target.value, lang)}
                        placeholder={`Sarlavha (${lang})`}
                      />
                    </div>
                    <div>
                      <Label>Qisqa tavsif ({lang.toUpperCase()})</Label>
                      <Textarea
                        value={formData[`excerpt_${lang}`]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            [`excerpt_${lang}`]: e.target.value,
                          }))
                        }
                        placeholder={`Qisqa tavsif (${lang})`}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Kontent ({lang.toUpperCase()})</Label>
                      <Textarea
                        value={formData[`content_${lang}`]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            [`content_${lang}`]: e.target.value,
                          }))
                        }
                        placeholder={`To'liq kontent (${lang}) - HTML qo'llab-quvvatlanadi`}
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Nashr qilish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Nashr qilish</Label>
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, published: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Tanlangan post</Label>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, featured: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Meta */}
          <Card>
            <CardHeader>
              <CardTitle>Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="post-url-slug"
                />
              </div>
              <div>
                <Label>Kategoriya</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategoriya tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name_uz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>O'qish vaqti (daqiqa)</Label>
                <Input
                  type="number"
                  value={formData.reading_time}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reading_time: parseInt(e.target.value) || 5,
                    }))
                  }
                  min={1}
                />
              </div>
              <div>
                <Label>Teglar (vergul bilan ajrating)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="marketing, seo, tips"
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Asosiy rasm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Rasm yuklash
                    </>
                  )}
                </Button>
              </div>

              {/* Or URL input */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">yoki</span>
                </div>
              </div>

              <div>
                <Label>Rasm URL</Label>
                <Input
                  value={formData.featured_image}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured_image: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
              </div>

              {/* Preview */}
              {formData.featured_image && (
                <div className="relative">
                  <img
                    src={formData.featured_image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, featured_image: '' }))
                    }
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {!formData.featured_image && (
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Rasm yuklanmagan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default PostEditor;