import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const codeExamples = {
  basic: `<h2>Asosiy sarlavha</h2>

<p>
Birinchi paragraf — eng muhim qism. Bu yerda asosiy fikrni
<strong>aniq va qisqa</strong> yozing.
</p>

<h2>Ikkinchi bo'lim</h2>

<p>Har bir bo'lim uchun alohida <code>&lt;h2&gt;</code> ishlating.</p>

<ul>
  <li>Birinchi nuqta</li>
  <li>Ikkinchi nuqta</li>
  <li>Uchinchi nuqta</li>
</ul>

<blockquote>
Muhim iqtiboslarni shu teg ichida yozing.
</blockquote>`,

  seo2026: `<h2>Asosiy savol yoki mavzu</h2>

<p>
Kirish — foydalanuvchi muammosini aniq belgilang.
<strong>Nima uchun bu muhim?</strong> savoliga javob bering.
</p>

<h2>1. Birinchi yechim yoki tavsiya</h2>

<p>Batafsil tushuntirish va amaliy maslahatlar.</p>

<ul>
  <li><strong>Qadamlar</strong> — aniq harakat rejasi</li>
  <li><strong>Misollar</strong> — real hayotdan</li>
  <li><strong>Natija</strong> — kutilgan natija</li>
</ul>

<h2>2. Ikkinchi yechim</h2>

<p>Har bir bo'lim mustaqil qiymatga ega bo'lsin.</p>

<blockquote>
AI qidiruv tizimlariga mos javob: aniq va tuzilgan.
</blockquote>

<h2>Xulosa</h2>

<p>
Qisqa xulosa va <strong>harakatga chaqiruv (CTA)</strong>.
</p>`,
};

const PostWritingGuide = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    html: true,
    seo: false,
    mistakes: false,
    template: false,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Nusxa olindi!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Post Yozish Qo'llanmasi</h2>
          <p className="text-muted-foreground">2026 SEO standartlariga mos professional kontent yarating</p>
        </div>
      </div>

      {/* HTML Structure */}
      <Collapsible open={openSections.html} onOpenChange={() => toggle('html')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  📝 To'g'ri HTML Strukturasi
                  <Badge variant="default">Muhim</Badge>
                </span>
                {openSections.html ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ TO'G'RI — Ishlating:</h4>
                  <ul className="space-y-1 text-sm">
                    <li><code className="bg-muted px-1 rounded">&lt;h2&gt;</code> — Asosiy bo'lim sarlavhalari</li>
                    <li><code className="bg-muted px-1 rounded">&lt;h3&gt;</code> — Kichik sarlavhalar (h2 ichida)</li>
                    <li><code className="bg-muted px-1 rounded">&lt;p&gt;</code> — Paragraflar</li>
                    <li><code className="bg-muted px-1 rounded">&lt;ul&gt; / &lt;ol&gt;</code> — Ro'yxatlar</li>
                    <li><code className="bg-muted px-1 rounded">&lt;strong&gt;</code> — Muhim so'zlar</li>
                    <li><code className="bg-muted px-1 rounded">&lt;blockquote&gt;</code> — Iqtiboslar</li>
                    <li><code className="bg-muted px-1 rounded">&lt;hr /&gt;</code> — Bo'limlar orasidagi chiziq</li>
                    <li><code className="bg-muted px-1 rounded">&lt;a href="..."&gt;</code> — Havolalar</li>
                    <li><code className="bg-muted px-1 rounded">&lt;img&gt;</code> — Rasmlar (alt bilan)</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">❌ XATO — Ishlatmang:</h4>
                  <ul className="space-y-1 text-sm">
                    <li><code className="bg-muted px-1 rounded">&lt;h1&gt;</code> — Sahifada faqat 1 ta bo'ladi (avtomatik qo'shiladi)</li>
                    <li><code className="bg-muted px-1 rounded">style="..."</code> — Inline CSS yozmang!</li>
                    <li><code className="bg-muted px-1 rounded">&lt;div style="font-family:..."&gt;</code> — Hech qachon!</li>
                    <li><code className="bg-muted px-1 rounded">&lt;article&gt;</code> — Sahifa o'zi qo'shadi</li>
                    <li><code className="bg-muted px-1 rounded">&lt;!DOCTYPE html&gt;</code> — Faqat kontent yozing!</li>
                    <li><code className="bg-muted px-1 rounded">&lt;html&gt;, &lt;head&gt;, &lt;body&gt;</code> — Kerak emas!</li>
                    <li><code className="bg-muted px-1 rounded">font-size, color, margin</code> — Inline CSS kerak emas</li>
                  </ul>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Namuna kod:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCode(codeExamples.basic, 'basic')}
                  >
                    {copiedId === 'basic' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto font-mono">
                  {codeExamples.basic}
                </pre>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* SEO 2026 */}
      <Collapsible open={openSections.seo} onOpenChange={() => toggle('seo')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  🚀 2026 SEO uchun Kontent Qoidalari
                  <Badge className="bg-secondary text-secondary-foreground">Yangi</Badge>
                </span>
                {openSections.seo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">🎯 Search Intent (Qidiruv niyati)</h4>
                  <p className="text-sm text-muted-foreground">
                    Har bir post bitta aniq savolga javob bersin. "Bu kimga kerak?", "Qachon foydali?", "Qanday ishlaydi?" — shu savollarga javob yozing.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">🤖 AI Crawlers uchun (GEO)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Strukturalangan kontent</strong> — H2 → H3 → P → UL tartibida</li>
                    <li>• <strong>FAQ formatida</strong> — savol-javob usulida yozing</li>
                    <li>• <strong>Taqqoslash jadvallari</strong> — AI uchun eng qulay format</li>
                    <li>• <strong>Aniq natijalar</strong> — raqamlar, foizlar, statistika</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">📊 E-E-A-T Signallari</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Experience</strong> — Shaxsiy tajriba va misollar keltiring</li>
                    <li>• <strong>Expertise</strong> — Sohadagi bilimingizni ko'rsating</li>
                    <li>• <strong>Authority</strong> — Manbalar va statistikaga havola qiling</li>
                    <li>• <strong>Trust</strong> — Real natijalar va case study qo'shing</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">✍️ Kontent Strukturasi</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-4">
                    <li>Kirish — muammoni aniqlang (2-3 paragraf)</li>
                    <li>Asosiy qism — yechimlarni bo'limlarga ajrating (H2 bilan)</li>
                    <li>Har bir bo'limda: tushuntirish → misol → natija</li>
                    <li>Xulosa — asosiy fikrlarni takrorlang</li>
                    <li>CTA — harakatga chaqiring</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Common Mistakes */}
      <Collapsible open={openSections.mistakes} onOpenChange={() => toggle('mistakes')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  ⚠️ Eng Ko'p Uchraydigan Xatolar
                </span>
                {openSections.mistakes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3 items-start p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                  <span className="text-red-500 font-bold text-lg">1</span>
                  <div>
                    <p className="font-medium">Inline style ishlatish</p>
                    <p className="text-sm text-muted-foreground">
                      <code>style="color: #222; font-family: Arial"</code> — Bu dark/light mode'ni buzadi va sayt dizayniga mos kelmaydi. Barcha stil sayt tomonidan boshqariladi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                  <span className="text-red-500 font-bold text-lg">2</span>
                  <div>
                    <p className="font-medium">&lt;h1&gt; ishlatish</p>
                    <p className="text-sm text-muted-foreground">
                      Sahifada faqat 1 ta H1 bo'lishi kerak (sarlavha avtomatik qo'shiladi). Kontentda <code>&lt;h2&gt;</code> dan boshlang. SEO uchun bu juda muhim!
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                  <span className="text-red-500 font-bold text-lg">3</span>
                  <div>
                    <p className="font-medium">To'liq HTML sahifa yozish</p>
                    <p className="text-sm text-muted-foreground">
                      <code>&lt;!DOCTYPE&gt;, &lt;html&gt;, &lt;head&gt;, &lt;body&gt;</code> — bularni yozmang! Faqat kontent qismini yozing (h2, p, ul va boshqalar).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                  <span className="text-red-500 font-bold text-lg">4</span>
                  <div>
                    <p className="font-medium">Meta ma'lumotlarni to'ldirmaslik</p>
                    <p className="text-sm text-muted-foreground">
                      Meta Title (60 belgigacha), Meta Description (160 belgigacha) va Focus Keywords — bularni har doim to'ldiring. SEO uchun zarur!
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                  <span className="text-red-500 font-bold text-lg">5</span>
                  <div>
                    <p className="font-medium">Rasmga alt tekst qo'ymaslik</p>
                    <p className="text-sm text-muted-foreground">
                      <code>&lt;img src="..." alt="Tavsif"&gt;</code> — har doim <code>alt</code> qo'shing. Bu SEO va accessibility uchun muhim.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* SEO Template */}
      <Collapsible open={openSections.template} onOpenChange={() => toggle('template')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  📋 SEO-Optimized Shablon
                  <Badge variant="secondary">Nusxa oling</Badge>
                </span>
                {openSections.template ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">2026 SEO-mos shablon:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCode(codeExamples.seo2026, 'seo2026')}
                  >
                    {copiedId === 'seo2026' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto font-mono whitespace-pre-wrap">
                  {codeExamples.seo2026}
                </pre>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default PostWritingGuide;
