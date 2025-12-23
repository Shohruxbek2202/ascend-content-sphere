import { useState, useEffect } from 'react';
import { 
  Globe, 
  RefreshCw, 
  Save, 
  ExternalLink,
  FileText,
  Map,
  Plus,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SitemapEntry {
  loc: string;
  priority: string;
  changefreq: string;
  enabled: boolean;
}

interface RobotsRule {
  userAgent: string;
  rules: string[];
}

const AdminSitemapRobots = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  // Sitemap settings
  const [staticPages, setStaticPages] = useState<SitemapEntry[]>([
    { loc: '/', priority: '1.0', changefreq: 'daily', enabled: true },
    { loc: '/blog', priority: '0.9', changefreq: 'daily', enabled: true },
    { loc: '/categories', priority: '0.8', changefreq: 'weekly', enabled: true },
    { loc: '/about', priority: '0.7', changefreq: 'monthly', enabled: true },
    { loc: '/contact', priority: '0.7', changefreq: 'monthly', enabled: true },
    { loc: '/subscribe', priority: '0.6', changefreq: 'monthly', enabled: true },
    { loc: '/privacy', priority: '0.3', changefreq: 'yearly', enabled: true },
    { loc: '/terms', priority: '0.3', changefreq: 'yearly', enabled: true },
  ]);
  
  const [newPage, setNewPage] = useState({ loc: '', priority: '0.5', changefreq: 'weekly' });
  
  // Robots.txt settings
  const [robotsConfig, setRobotsConfig] = useState({
    allowAll: true,
    disallowPaths: ['/admin', '/admin/*', '/auth', '/auth/*', '/api/', '/*.json$', '/*?*'],
    allowPaths: ['/post/*', '/blog', '/categories', '/about', '/contact'],
    crawlDelay: '1',
    customRules: '',
  });

  // Stats
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalCategories: 0,
    lastGenerated: null as Date | null,
  });

  const baseUrl = 'https://shohruxdigital.uz';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    loadSettings();
    fetchStats();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: sitemapData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'sitemap_config')
        .maybeSingle();

      if (sitemapData?.value) {
        setStaticPages(JSON.parse(sitemapData.value));
      }

      const { data: robotsData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'robots_config')
        .maybeSingle();

      if (robotsData?.value) {
        setRobotsConfig(JSON.parse(robotsData.value));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const fetchStats = async () => {
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    const { count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    setStats({
      totalPosts: postsCount || 0,
      totalCategories: categoriesCount || 0,
      lastGenerated: new Date(),
    });
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Save sitemap config
      await supabase
        .from('site_settings')
        .upsert({ 
          key: 'sitemap_config', 
          value: JSON.stringify(staticPages),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      // Save robots config
      await supabase
        .from('site_settings')
        .upsert({ 
          key: 'robots_config', 
          value: JSON.stringify(robotsConfig),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      toast.success('Sozlamalar saqlandi');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Saqlashda xatolik');
    }
    setIsLoading(false);
  };

  const addStaticPage = () => {
    if (!newPage.loc) {
      toast.error('URL kiriting');
      return;
    }
    setStaticPages([...staticPages, { ...newPage, enabled: true }]);
    setNewPage({ loc: '', priority: '0.5', changefreq: 'weekly' });
  };

  const removePage = (index: number) => {
    setStaticPages(staticPages.filter((_, i) => i !== index));
  };

  const togglePage = (index: number) => {
    const updated = [...staticPages];
    updated[index].enabled = !updated[index].enabled;
    setStaticPages(updated);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Nusxalandi');
  };

  const generateRobotsTxt = () => {
    let txt = `# robots.txt for ShohruxDigital
# ${baseUrl}
# Generated: ${new Date().toISOString()}

`;

    // Default rules
    txt += `User-agent: Googlebot
Allow: /
Crawl-delay: ${robotsConfig.crawlDelay}

User-agent: Bingbot
Allow: /
Crawl-delay: ${robotsConfig.crawlDelay}

User-agent: Yandex
Allow: /
Crawl-delay: 2

User-agent: *
`;

    if (robotsConfig.allowAll) {
      txt += `Allow: /\n`;
    }

    // Disallow paths
    robotsConfig.disallowPaths.forEach(path => {
      txt += `Disallow: ${path}\n`;
    });

    // Allow paths
    robotsConfig.allowPaths.forEach(path => {
      txt += `Allow: ${path}\n`;
    });

    txt += `
# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${supabaseUrl}/functions/v1/sitemap

# Host
Host: ${baseUrl}
`;

    if (robotsConfig.customRules) {
      txt += `\n# Custom Rules\n${robotsConfig.customRules}\n`;
    }

    return txt;
  };

  const pingSearchEngines = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ping-search-engines', {
        body: { url: `${baseUrl}/sitemap.xml` }
      });
      if (error) throw error;
      toast.success('Sitemap qidiruv tizimlariga yuborildi');
    } catch (error) {
      toast.error('Ping xatosi');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Sitemap & Robots.txt</h1>
          <p className="text-muted-foreground">
            Qidiruv tizimi sozlamalari
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={pingSearchEngines} disabled={isLoading}>
            <Globe className="w-4 h-4 mr-2" />
            Google Ping
          </Button>
          <Button onClick={saveSettings} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Saqlash
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{stats.totalPosts}</div>
            <div className="text-sm text-muted-foreground">Postlar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{stats.totalCategories}</div>
            <div className="text-sm text-muted-foreground">Kategoriyalar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{staticPages.filter(p => p.enabled).length}</div>
            <div className="text-sm text-muted-foreground">Statik sahifalar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">
              {stats.totalPosts + stats.totalCategories + staticPages.filter(p => p.enabled).length}
            </div>
            <div className="text-sm text-muted-foreground">Jami URL</div>
          </CardContent>
        </Card>
      </div>

      {/* URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Sitemap & Robots.txt URLlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm">{supabaseUrl}/functions/v1/sitemap</code>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => copyToClipboard(`${supabaseUrl}/functions/v1/sitemap`, 'sitemap')}
            >
              {copied === 'sitemap' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={`${supabaseUrl}/functions/v1/sitemap`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm">{supabaseUrl}/functions/v1/robots</code>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => copyToClipboard(`${supabaseUrl}/functions/v1/robots`, 'robots')}
            >
              {copied === 'robots' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={`${supabaseUrl}/functions/v1/robots`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sitemap">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sitemap" className="gap-2">
            <Map className="w-4 h-4" />
            Sitemap
          </TabsTrigger>
          <TabsTrigger value="robots" className="gap-2">
            <FileText className="w-4 h-4" />
            Robots.txt
          </TabsTrigger>
        </TabsList>

        {/* Sitemap Tab */}
        <TabsContent value="sitemap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statik sahifalar</CardTitle>
              <CardDescription>
                Sitemapga qo'shiladigan statik sahifalar. Postlar va kategoriyalar avtomatik qo'shiladi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Faol</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Changefreq</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staticPages.map((page, index) => (
                    <TableRow key={index} className={!page.enabled ? 'opacity-50' : ''}>
                      <TableCell>
                        <Switch 
                          checked={page.enabled} 
                          onCheckedChange={() => togglePage(index)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{page.loc}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{page.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{page.changefreq}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePage(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Add new page */}
              <div className="flex gap-2 mt-4 p-4 border rounded-lg bg-muted/50">
                <Input
                  placeholder="/yangi-sahifa"
                  value={newPage.loc}
                  onChange={(e) => setNewPage({ ...newPage, loc: e.target.value })}
                  className="flex-1"
                />
                <Select 
                  value={newPage.priority} 
                  onValueChange={(v) => setNewPage({ ...newPage, priority: v })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.0">1.0</SelectItem>
                    <SelectItem value="0.9">0.9</SelectItem>
                    <SelectItem value="0.8">0.8</SelectItem>
                    <SelectItem value="0.7">0.7</SelectItem>
                    <SelectItem value="0.6">0.6</SelectItem>
                    <SelectItem value="0.5">0.5</SelectItem>
                    <SelectItem value="0.4">0.4</SelectItem>
                    <SelectItem value="0.3">0.3</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={newPage.changefreq} 
                  onValueChange={(v) => setNewPage({ ...newPage, changefreq: v })}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">always</SelectItem>
                    <SelectItem value="hourly">hourly</SelectItem>
                    <SelectItem value="daily">daily</SelectItem>
                    <SelectItem value="weekly">weekly</SelectItem>
                    <SelectItem value="monthly">monthly</SelectItem>
                    <SelectItem value="yearly">yearly</SelectItem>
                    <SelectItem value="never">never</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addStaticPage}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Robots.txt Tab */}
        <TabsContent value="robots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Robots.txt sozlamalari</CardTitle>
              <CardDescription>
                Qidiruv botlari uchun qoidalar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Barcha sahifalarni indeksatsiya qilish</Label>
                  <p className="text-sm text-muted-foreground">Allow: / qo'shiladi</p>
                </div>
                <Switch 
                  checked={robotsConfig.allowAll}
                  onCheckedChange={(v) => setRobotsConfig({ ...robotsConfig, allowAll: v })}
                />
              </div>

              <div>
                <Label>Crawl Delay (soniya)</Label>
                <Input
                  type="number"
                  value={robotsConfig.crawlDelay}
                  onChange={(e) => setRobotsConfig({ ...robotsConfig, crawlDelay: e.target.value })}
                  className="w-24 mt-2"
                />
              </div>

              <div>
                <Label>Taqiqlangan yo'llar (Disallow)</Label>
                <Textarea
                  value={robotsConfig.disallowPaths.join('\n')}
                  onChange={(e) => setRobotsConfig({ 
                    ...robotsConfig, 
                    disallowPaths: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="/admin&#10;/private"
                  rows={5}
                  className="mt-2 font-mono text-sm"
                />
              </div>

              <div>
                <Label>Ruxsat berilgan yo'llar (Allow)</Label>
                <Textarea
                  value={robotsConfig.allowPaths.join('\n')}
                  onChange={(e) => setRobotsConfig({ 
                    ...robotsConfig, 
                    allowPaths: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="/post/*&#10;/blog"
                  rows={5}
                  className="mt-2 font-mono text-sm"
                />
              </div>

              <div>
                <Label>Qo'shimcha qoidalar</Label>
                <Textarea
                  value={robotsConfig.customRules}
                  onChange={(e) => setRobotsConfig({ ...robotsConfig, customRules: e.target.value })}
                  placeholder="# Custom rules here"
                  rows={4}
                  className="mt-2 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Robots.txt ko'rinishi</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(generateRobotsTxt(), 'robotstxt')}
                >
                  {copied === 'robotstxt' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Nusxalash
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                {generateRobotsTxt()}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSitemapRobots;
