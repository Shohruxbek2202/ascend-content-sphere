import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { RefreshCw, MousePointerClick, Eye, Percent, TrendingUp, Search, FileText, Sparkles, Zap, Target, Lightbulb, Wrench } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type Dimension = 'query' | 'page' | 'country' | 'device';

interface Row {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCData {
  site: string;
  startDate: string;
  endDate: string;
  dimension: Dimension;
  rows: Row[];
  totals: { clicks: number; impressions: number; ctr: number; position: number };
}

interface AISuggestions {
  summary?: string;
  quick_wins?: Array<{ keyword: string; current_position: number; action: string; priority: string }>;
  ctr_fixes?: Array<{ keyword: string; impressions: number; ctr_percent: number; new_title_suggestion: string }>;
  new_content_ideas?: Array<{ topic: string; target_keyword: string; why: string }>;
  top_page_improvements?: Array<{ page: string; action: string }>;
}

const RANGES = [
  { label: '7 kun', days: 7 },
  { label: '28 kun', days: 28 },
  { label: '90 kun', days: 90 },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const AdminGSC = () => {
  const [dimension, setDimension] = useState<Dimension>('query');
  const [days, setDays] = useState(28);
  const [data, setData] = useState<GSCData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<AISuggestions | null>(null);

  const generateAI = async () => {
    setAiLoading(true);
    setAiOpen(true);
    setAiData(null);
    try {
      // Fetch fresh queries + pages in parallel
      const [qRes, pRes] = await Promise.all([
        supabase.functions.invoke('gsc-analytics', {
          body: { startDate: daysAgo(days), endDate: daysAgo(1), dimension: 'query', rowLimit: 30 },
        }),
        supabase.functions.invoke('gsc-analytics', {
          body: { startDate: daysAgo(days), endDate: daysAgo(1), dimension: 'page', rowLimit: 15 },
        }),
      ]);
      if (qRes.error) throw qRes.error;
      if (pRes.error) throw pRes.error;

      const { data: ai, error } = await supabase.functions.invoke('gsc-ai-suggestions', {
        body: { queries: qRes.data?.rows || [], pages: pRes.data?.rows || [] },
      });
      if (error) throw error;
      if (ai?.error) throw new Error(ai.error);
      setAiData(ai);
    } catch (e: any) {
      toast.error(e.message || 'AI tahlilda xato');
      setAiOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('gsc-analytics', {
        body: {
          startDate: daysAgo(days),
          endDate: daysAgo(1),
          dimension,
          rowLimit: 50,
        },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      setData(result as GSCData);
    } catch (e: any) {
      toast.error(e.message || 'GSC ma\'lumotlarini olishda xato');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimension, days]);

  const stats = [
    { icon: MousePointerClick, label: 'Bosishlar', value: data?.totals.clicks ?? 0, color: 'text-blue-500' },
    { icon: Eye, label: 'Ko\'rinishlar', value: data?.totals.impressions ?? 0, color: 'text-purple-500' },
    {
      icon: Percent,
      label: 'O\'rt. CTR',
      value: data ? `${(data.totals.ctr * 100).toFixed(2)}%` : '0%',
      color: 'text-green-500',
    },
    {
      icon: TrendingUp,
      label: 'O\'rt. pozitsiya',
      value: data ? data.totals.position.toFixed(1) : '0',
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Google Search Console</h1>
          <p className="text-muted-foreground">Real qidiruv statistikasi — qaysi so'zlar bilan sizni topishadi</p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.days}
              size="sm"
              variant={days === r.days ? 'default' : 'outline'}
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" onClick={generateAI} disabled={aiLoading || !data} className="bg-gradient-to-r from-primary to-accent">
            <Sparkles className={`w-4 h-4 mr-2 ${aiLoading ? 'animate-pulse' : ''}`} />
            AI Tavsiyalar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-7 w-16" /> : s.value.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={dimension} onValueChange={(v) => setDimension(v as Dimension)}>
        <TabsList>
          <TabsTrigger value="query">
            <Search className="w-4 h-4 mr-2" /> Kalit so'zlar
          </TabsTrigger>
          <TabsTrigger value="page">
            <FileText className="w-4 h-4 mr-2" /> Sahifalar
          </TabsTrigger>
          <TabsTrigger value="country">Davlat</TabsTrigger>
          <TabsTrigger value="device">Qurilma</TabsTrigger>
        </TabsList>

        <TabsContent value={dimension} className="mt-4">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium">
                      {dimension === 'query'
                        ? "So'rov"
                        : dimension === 'page'
                          ? 'Sahifa'
                          : dimension === 'country'
                            ? 'Davlat'
                            : 'Qurilma'}
                    </th>
                    <th className="px-4 py-3 font-medium text-right">Bosishlar</th>
                    <th className="px-4 py-3 font-medium text-right">Ko'rinishlar</th>
                    <th className="px-4 py-3 font-medium text-right">CTR</th>
                    <th className="px-4 py-3 font-medium text-right">Pozitsiya</th>
                  </tr>
                </thead>
                <tbody>
                  {loading &&
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-t">
                        <td colSpan={5} className="px-4 py-3">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      </tr>
                    ))}
                  {!loading && data?.rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Ma'lumot yo'q. GSC hali ma'lumot to'plamoqda — bir necha kun kuting.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    data?.rows.map((r, i) => (
                      <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 max-w-md truncate">
                          {dimension === 'page' ? (
                            <a
                              href={r.key}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              {r.key.replace('https://shohruxdigital.uz', '') || '/'}
                            </a>
                          ) : (
                            r.key
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{r.clicks}</td>
                        <td className="px-4 py-3 text-right">{r.impressions}</td>
                        <td className="px-4 py-3 text-right">{(r.ctr * 100).toFixed(2)}%</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={
                              r.position <= 10
                                ? 'text-green-500 font-medium'
                                : r.position <= 20
                                  ? 'text-orange-500'
                                  : 'text-muted-foreground'
                            }
                          >
                            {r.position.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          {!loading && data && data.rows.length > 0 && dimension === 'query' && (
            <Card className="mt-4 p-4 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2">💡 Tavsiyalar</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  • Pozitsiyasi <strong>4-20</strong> orasidagi so'zlar — eng tez g'alaba: shu mavzularda
                  postlarni yangilang.
                </li>
                <li>
                  • CTR <strong>2%</strong> dan past so'zlar — meta-description va sarlavhani jozibali
                  qiling.
                </li>
                <li>
                  • Yuqori ko'rinishlar, lekin past bosishlar — shu mavzular bo'yicha chuqurroq post yozing.
                </li>
              </ul>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGSC;
