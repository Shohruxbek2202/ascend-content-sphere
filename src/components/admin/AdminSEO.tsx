import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Globe, Tag, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SEOKeyword {
  id: string;
  keyword: string;
  keyword_group: string;
  url: string | null;
  language: string;
  priority: number;
  created_at: string;
}

const AdminSEO = () => {
  const [keywords, setKeywords] = useState<SEOKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    keyword: '',
    keyword_group: 'general',
    url: '',
    language: 'uz',
    priority: 0,
  });

  // Bulk add state
  const [bulkKeywords, setBulkKeywords] = useState('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  const fetchKeywords = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('seo_keywords')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Kalit so\'zlarni yuklashda xatolik');
    } else {
      setKeywords(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.keyword.trim()) {
      toast.error('Kalit so\'z kiriting');
      return;
    }

    const { error } = await supabase.from('seo_keywords').insert({
      keyword: formData.keyword.trim(),
      keyword_group: formData.keyword_group,
      url: formData.url || null,
      language: formData.language,
      priority: formData.priority,
    });

    if (error) {
      toast.error('Xatolik: ' + error.message);
    } else {
      toast.success('Kalit so\'z qo\'shildi');
      setFormData({
        keyword: '',
        keyword_group: 'general',
        url: '',
        language: 'uz',
        priority: 0,
      });
      setIsDialogOpen(false);
      fetchKeywords();
    }
  };

  const handleBulkAdd = async () => {
    const keywordList = bulkKeywords
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywordList.length === 0) {
      toast.error('Kalit so\'zlar kiriting');
      return;
    }

    const keywordsToInsert = keywordList.map((keyword) => ({
      keyword,
      keyword_group: formData.keyword_group,
      url: formData.url || null,
      language: formData.language,
      priority: formData.priority,
    }));

    const { error } = await supabase.from('seo_keywords').insert(keywordsToInsert);

    if (error) {
      toast.error('Xatolik: ' + error.message);
    } else {
      toast.success(`${keywordList.length} ta kalit so'z qo'shildi`);
      setBulkKeywords('');
      setIsBulkDialogOpen(false);
      fetchKeywords();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('seo_keywords').delete().eq('id', id);

    if (error) {
      toast.error('Xatolik: ' + error.message);
    } else {
      toast.success('Kalit so\'z o\'chirildi');
      fetchKeywords();
    }
  };

  // Get unique groups
  const groups = [...new Set(keywords.map((k) => k.keyword_group))];

  // Filter keywords
  const filteredKeywords = keywords.filter((k) => {
    const matchesSearch = k.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'all' || k.keyword_group === filterGroup;
    const matchesLanguage = filterLanguage === 'all' || k.language === filterLanguage;
    return matchesSearch && matchesGroup && matchesLanguage;
  });

  // Stats
  const totalKeywords = keywords.length;
  const groupStats = groups.map((g) => ({
    name: g,
    count: keywords.filter((k) => k.keyword_group === g).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">SEO Boshqaruvi</h1>
          <p className="text-muted-foreground">
            Kalit so'zlar va SEO sozlamalarini boshqaring
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Ko'plab qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Ko'plab kalit so'z qo'shish</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Kalit so'zlar (har bir qatorda bitta)</Label>
                  <textarea
                    className="w-full h-40 p-3 border rounded-lg text-sm"
                    placeholder="marketing&#10;digital marketing&#10;seo&#10;smm"
                    value={bulkKeywords}
                    onChange={(e) => setBulkKeywords(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Guruh</Label>
                    <Input
                      value={formData.keyword_group}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, keyword_group: e.target.value }))
                      }
                      placeholder="general"
                    />
                  </div>
                  <div>
                    <Label>Til</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uz">O'zbek</SelectItem>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>URL (ixtiyoriy)</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <Button onClick={handleBulkAdd} className="w-full">
                  Qo'shish
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Kalit so'z qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi kalit so'z</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Kalit so'z</Label>
                  <Input
                    value={formData.keyword}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, keyword: e.target.value }))
                    }
                    placeholder="digital marketing"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Guruh</Label>
                    <Input
                      value={formData.keyword_group}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, keyword_group: e.target.value }))
                      }
                      placeholder="general"
                    />
                  </div>
                  <div>
                    <Label>Til</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uz">O'zbek</SelectItem>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>URL (ixtiyoriy)</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Muhimlik (0-100)</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) || 0 }))
                    }
                    min={0}
                    max={100}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Qo'shish
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalKeywords}</p>
                <p className="text-sm text-muted-foreground">Jami kalit so'zlar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Folder className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{groups.length}</p>
                <p className="text-sm text-muted-foreground">Guruhlar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {keywords.filter((k) => k.url).length}
                </p>
                <p className="text-sm text-muted-foreground">URL bilan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {keywords.filter((k) => k.priority > 50).length}
                </p>
                <p className="text-sm text-muted-foreground">Muhim</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups Overview */}
      {groupStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Guruhlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {groupStats.map((g) => (
                <Badge
                  key={g.name}
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setFilterGroup(g.name)}
                >
                  {g.name} ({g.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Kalit so'z qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterGroup} onValueChange={setFilterGroup}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Guruh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha guruhlar</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Til" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha tillar</SelectItem>
                <SelectItem value="uz">O'zbek</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Keywords Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Kalit so'zlar topilmadi
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kalit so'z</TableHead>
                  <TableHead>Guruh</TableHead>
                  <TableHead>Til</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Muhimlik</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeywords.map((keyword) => (
                  <TableRow key={keyword.id}>
                    <TableCell className="font-medium">{keyword.keyword}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{keyword.keyword_group}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {keyword.language === 'uz' && '🇺🇿'}
                        {keyword.language === 'ru' && '🇷🇺'}
                        {keyword.language === 'en' && '🇬🇧'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {keyword.url ? (
                        <a
                          href={keyword.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm truncate max-w-xs block"
                        >
                          {keyword.url}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          keyword.priority > 50
                            ? 'text-green-600'
                            : keyword.priority > 20
                            ? 'text-orange-500'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {keyword.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(keyword.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSEO;
