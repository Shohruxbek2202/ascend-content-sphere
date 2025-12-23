import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  Sparkles, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Edit,
  Image,
  Key,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  content_uz: string;
  meta_description_uz: string | null;
  meta_title_uz: string | null;
  focus_keywords: string[] | null;
  featured_image: string | null;
  published: boolean;
}

interface SEOScore {
  postId: string;
  score: number;
  issues: SEOIssue[];
  passed: SEOCheck[];
}

interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
}

interface SEOCheck {
  type: 'success';
  message: string;
}

const AdminSEOAudit = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [seoScores, setSeoScores] = useState<Record<string, SEOScore>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState<string | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiProcessingPost, setAiProcessingPost] = useState<Post | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('id, slug, title_uz, title_ru, title_en, content_uz, meta_description_uz, meta_title_uz, focus_keywords, featured_image, published')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Postlarni yuklashda xatolik');
    } else {
      setPosts(data || []);
      // Calculate SEO scores for all posts
      const scores: Record<string, SEOScore> = {};
      (data || []).forEach(post => {
        scores[post.id] = calculateSEOScore(post);
      });
      setSeoScores(scores);
    }
    setIsLoading(false);
  };

  const calculateSEOScore = (post: Post): SEOScore => {
    const issues: SEOIssue[] = [];
    const passed: SEOCheck[] = [];
    let score = 100;

    // Check title length
    const titleLength = post.title_uz?.length || 0;
    if (titleLength < 30) {
      issues.push({ type: 'warning', message: 'Sarlavha juda qisqa (30 belgidan kam)' });
      score -= 10;
    } else if (titleLength > 60) {
      issues.push({ type: 'warning', message: `Meta title juda uzun (60 belgidan kam bo'lishi kerak)` });
      score -= 5;
    } else {
      passed.push({ type: 'success', message: 'Sarlavha optimal uzunlikda' });
    }

    // Check meta description
    const metaDescLength = post.meta_description_uz?.length || 0;
    if (!post.meta_description_uz) {
      issues.push({ type: 'error', message: 'Meta tavsif yo\'q' });
      score -= 15;
    } else if (metaDescLength < 120) {
      issues.push({ type: 'warning', message: 'Meta tavsif juda qisqa' });
      score -= 5;
    } else if (metaDescLength > 160) {
      issues.push({ type: 'warning', message: 'Meta tavsif juda uzun' });
      score -= 5;
    } else {
      passed.push({ type: 'success', message: 'Meta description optimal' });
    }

    // Check slug
    if (!post.slug || post.slug.length < 3) {
      issues.push({ type: 'error', message: 'URL slug noto\'g\'ri' });
      score -= 10;
    } else {
      passed.push({ type: 'success', message: 'URL slug to\'g\'ri' });
    }

    // Check keywords
    const keywordCount = post.focus_keywords?.length || 0;
    if (keywordCount === 0) {
      issues.push({ type: 'error', message: 'Kalit so\'zlar yo\'q' });
      score -= 15;
    } else if (keywordCount < 3) {
      issues.push({ type: 'warning', message: 'Kalit so\'zlar kam (3+ tavsiya)' });
      score -= 5;
    } else {
      passed.push({ type: 'success', message: `${keywordCount} ta kalit so'z` });
    }

    // Check featured image
    if (!post.featured_image) {
      issues.push({ type: 'error', message: 'Asosiy rasm yo\'q' });
      score -= 10;
    } else {
      passed.push({ type: 'success', message: 'Asosiy rasm mavjud' });
    }

    // Check content length
    const contentWordCount = post.content_uz?.split(/\s+/).length || 0;
    if (contentWordCount < 300) {
      issues.push({ type: 'error', message: 'Kontent juda qisqa (300+ so\'z tavsiya)' });
      score -= 15;
    } else if (contentWordCount < 800) {
      issues.push({ type: 'warning', message: 'Kontent qisqa (800+ so\'z tavsiya)' });
      score -= 5;
    } else {
      passed.push({ type: 'success', message: 'Tavsif yetarli' });
    }

    // Check for images in content
    const imageCount = (post.content_uz?.match(/<img/gi) || []).length;
    if (imageCount === 0) {
      issues.push({ type: 'warning', message: 'Kontentda rasm yo\'q' });
      score -= 5;
    } else if (imageCount < 3) {
      issues.push({ type: 'warning', message: `Faqat ${imageCount} ta rasm (3+ tavsiya)` });
      score -= 3;
    } else {
      passed.push({ type: 'success', message: `${imageCount} ta rasm` });
    }

    return {
      postId: post.id,
      score: Math.max(0, score),
      issues,
      passed
    };
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-emerald-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "A'lo";
    if (score >= 70) return 'Yaxshi';
    if (score >= 50) return "O'rtacha";
    return 'Yomon';
  };

  const handleAIOptimize = async (post: Post) => {
    setAiProcessingPost(post);
    setAiDialogOpen(true);
    setAiSuggestions(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-seo', {
        body: {
          title: post.title_uz,
          content: post.content_uz,
          meta_description: post.meta_description_uz,
          slug: post.slug,
          keywords: post.focus_keywords?.join(', ')
        }
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        setAiSuggestions(data.analysis);
      } else {
        throw new Error(data?.error || 'Tahlil xatosi');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('AI tahlilida xatolik');
      setAiDialogOpen(false);
    }
  };

  const applyAISuggestions = async () => {
    if (!aiProcessingPost || !aiSuggestions?.optimized) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          meta_title_uz: aiSuggestions.optimized.title,
          meta_description_uz: aiSuggestions.optimized.meta_description,
          slug: aiSuggestions.optimized.slug,
          focus_keywords: [
            aiSuggestions.keywords?.primary,
            ...(aiSuggestions.keywords?.secondary || [])
          ].filter(Boolean)
        })
        .eq('id', aiProcessingPost.id);

      if (error) throw error;

      toast.success('SEO optimizatsiya qo\'llanildi');
      setAiDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Apply suggestions error:', error);
      toast.error('Optimizatsiyani qo\'llashda xatolik');
    }
  };

  const handleBatchProcess = async () => {
    const postsToProcess = posts.filter(p => {
      const score = seoScores[p.id]?.score || 0;
      return score < 70;
    });

    if (postsToProcess.length === 0) {
      toast.info('Barcha postlar optimal holatda');
      return;
    }

    setIsBatchProcessing(true);
    let processed = 0;

    for (const post of postsToProcess) {
      setCurrentProcessing(post.id);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-seo', {
          body: {
            title: post.title_uz,
            content: post.content_uz,
            meta_description: post.meta_description_uz,
            slug: post.slug,
            keywords: post.focus_keywords?.join(', ')
          }
        });

        if (!error && data?.success && data?.analysis?.optimized) {
          await supabase
            .from('posts')
            .update({
              meta_title_uz: data.analysis.optimized.title,
              meta_description_uz: data.analysis.optimized.meta_description,
              focus_keywords: [
                data.analysis.keywords?.primary,
                ...(data.analysis.keywords?.secondary || [])
              ].filter(Boolean)
            })
            .eq('id', post.id);
          processed++;
        }
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
      }
    }

    setIsBatchProcessing(false);
    setCurrentProcessing(null);
    toast.success(`${processed} ta post optimizatsiya qilindi`);
    fetchPosts();
  };

  // Stats calculations
  const avgScore = posts.length > 0 
    ? Math.round(Object.values(seoScores).reduce((sum, s) => sum + s.score, 0) / posts.length)
    : 0;
  const excellentCount = Object.values(seoScores).filter(s => s.score >= 90).length;
  const goodCount = Object.values(seoScores).filter(s => s.score >= 70 && s.score < 90).length;
  const averageCount = Object.values(seoScores).filter(s => s.score >= 50 && s.score < 70).length;
  const poorCount = Object.values(seoScores).filter(s => s.score < 50).length;
  const needsSEOCount = Object.values(seoScores).filter(s => s.score < 70).length;

  const filteredPosts = posts.filter(post =>
    post.title_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGooglePing = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ping-search-engines', {
        body: { url: 'https://shohruxdigital.uz/sitemap.xml' }
      });
      if (error) throw error;
      toast.success('Sitemap qidiruv tizimlariga yuborildi');
    } catch (error) {
      toast.error('Ping xatosi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">SEO Audit</h1>
          <p className="text-muted-foreground">
            AI yordamida SEO optimallashtirish
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={fetchPosts} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
          <Button variant="outline" onClick={handleGooglePing}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Google Ping
          </Button>
          <Button 
            onClick={handleBatchProcess}
            disabled={isBatchProcessing || needsSEOCount === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Batch ({needsSEOCount})
          </Button>
        </div>
      </div>

      {/* AI Info Card */}
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI SEO Optimallashtirish</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Har bir mahsulot uchun AI yordamida meta title, description va kalit so'zlar yarating. 
                "AI Batch" tugmasi bilan barcha SEO si yo'q mahsulotlarni avtomatik optimallashtiring.
              </p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <RefreshCw className="w-3 h-3" />
                Cron job: Har soatda avtomatik tekshiriladi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{avgScore}%</div>
            <div className="text-sm text-muted-foreground">O'rtacha ball</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{excellentCount}</div>
            <div className="text-sm text-muted-foreground">A'lo (90%+)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-500">{goodCount}</div>
            <div className="text-sm text-muted-foreground">Yaxshi (70-89%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">{averageCount}</div>
            <div className="text-sm text-muted-foreground">O'rtacha (50-69%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{poorCount}</div>
            <div className="text-sm text-muted-foreground">Yomon (&lt;50%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-500">{needsSEOCount}</div>
            <div className="text-sm text-muted-foreground">SEO kerak</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Mahsulot qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            </CardContent>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Postlar topilmadi
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map(post => {
            const seoScore = seoScores[post.id];
            const isProcessing = currentProcessing === post.id;

            return (
              <Card key={post.id} className={`${isProcessing ? 'ring-2 ring-primary animate-pulse' : ''}`}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Score */}
                    <div className="flex items-center gap-4 lg:w-24">
                      <div className="relative">
                        <div className={`text-3xl font-bold ${getScoreColor(seoScore?.score || 0)}`}>
                          {seoScore?.score || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">SEO Ball</div>
                        <Progress 
                          value={seoScore?.score || 0} 
                          className="mt-1 h-1.5"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{post.title_uz}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3" />
                        /post/{post.slug}
                      </p>
                      
                      {/* Issues & Passed */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {seoScore?.passed.slice(0, 3).map((check, i) => (
                          <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {check.message}
                          </Badge>
                        ))}
                        {seoScore?.issues.slice(0, 3).map((issue, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className={`${
                              issue.type === 'error' 
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : issue.type === 'warning'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {issue.type === 'error' ? (
                              <XCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 mr-1" />
                            )}
                            {issue.message}
                          </Badge>
                        ))}
                      </div>

                      {/* Quick stats */}
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Image className="w-3 h-3" />
                          {post.featured_image ? '1 rasm' : '0 rasm'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          {post.focus_keywords?.length || 0} ta kalit so'z
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {post.meta_description_uz ? 'Meta ✓' : 'Meta ✗'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:flex-col">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAIOptimize(post)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-1" />
                        )}
                        AI
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Tahrirlash
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* AI Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI SEO Optimizatsiya
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            {!aiSuggestions ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI tahlil qilmoqda...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className={`text-3xl font-bold ${getScoreColor(aiSuggestions.score)}`}>
                          {aiSuggestions.score}
                        </div>
                        <div className="text-sm text-muted-foreground">SEO Ball</div>
                      </div>
                      <div>
                        <Badge className="text-xl px-4 py-2">
                          {aiSuggestions.grade}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">Baho</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-primary">
                          {aiSuggestions.readability?.score || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">O'qilish</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Optimized Suggestions */}
                {aiSuggestions.optimized && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Optimallashtirilgan variantlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm font-medium mb-1">Meta Title</div>
                        <div className="p-3 bg-muted rounded-lg text-sm">
                          {aiSuggestions.optimized.title}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Meta Description</div>
                        <div className="p-3 bg-muted rounded-lg text-sm">
                          {aiSuggestions.optimized.meta_description}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">URL Slug</div>
                        <div className="p-3 bg-muted rounded-lg text-sm font-mono">
                          {aiSuggestions.optimized.slug}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Keywords */}
                {aiSuggestions.keywords && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Kalit so'zlar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Asosiy</div>
                        <Badge>{aiSuggestions.keywords.primary}</Badge>
                      </div>
                      {aiSuggestions.keywords.secondary?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Ikkilamchi</div>
                          <div className="flex flex-wrap gap-2">
                            {aiSuggestions.keywords.secondary.map((kw: string, i: number) => (
                              <Badge key={i} variant="secondary">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiSuggestions.keywords.lsi?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">LSI</div>
                          <div className="flex flex-wrap gap-2">
                            {aiSuggestions.keywords.lsi.map((kw: string, i: number) => (
                              <Badge key={i} variant="outline">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Issues */}
                {aiSuggestions.issues?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Muammolar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiSuggestions.issues.map((issue: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                            {issue.type === 'error' ? (
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            )}
                            <div>
                              <div className="text-sm">{issue.message}</div>
                              <div className="text-xs text-muted-foreground">{issue.suggestion}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Apply Button */}
                <Button onClick={applyAISuggestions} className="w-full" size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Optimizatsiyani qo'llash
                </Button>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSEOAudit;
