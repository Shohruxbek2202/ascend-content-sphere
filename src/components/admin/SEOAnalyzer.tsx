import { useState } from 'react';
import { Search, Loader2, AlertTriangle, CheckCircle, XCircle, TrendingUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
}

interface SEORecommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

interface SEOAnalysis {
  score: number;
  grade: string;
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  optimized: {
    title: string;
    meta_description: string;
    slug: string;
  };
  keywords: {
    primary: string;
    secondary: string[];
    lsi: string[];
  };
  readability: {
    score: number;
    level: string;
    suggestions: string[];
  };
  contentAnalysis: {
    wordCount: number;
    paragraphCount: number;
    h2Count: number;
    h3Count: number;
    imagesSuggested: number;
  };
}

interface SEOAnalyzerProps {
  title: string;
  content: string;
  metaDescription?: string;
  slug?: string;
  keywords?: string;
  onApplyOptimized?: (optimized: { title: string; meta_description: string; slug: string }) => void;
}

const SEOAnalyzer = ({ title, content, metaDescription, slug, keywords, onApplyOptimized }: SEOAnalyzerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!title || !content) {
      toast.error('Sarlavha va kontent tahlil uchun zarur');
      return;
    }

    setIsAnalyzing(true);
    setIsOpen(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-seo', {
        body: { title, content, meta_description: metaDescription, slug, keywords }
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error(data?.error || 'Tahlil xatosi');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'SEO tahlilida xatolik');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'bg-green-500';
    if (grade === 'B' || grade === 'B+') return 'bg-blue-500';
    if (grade === 'C' || grade === 'C+') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'destructive';
    if (priority === 'medium') return 'default';
    return 'secondary';
  };

  const getIssueIcon = (type: string) => {
    if (type === 'error') return <XCircle className="w-4 h-4 text-red-500" />;
    if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-blue-500" />;
  };

  return (
    <>
      <Button variant="outline" onClick={handleAnalyze} className="gap-2">
        <Search className="w-4 h-4" />
        SEO tahlili
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              SEO Tahlil Natijalari
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[70vh] pr-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">SEO tahlil qilinmoqda...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                        {analysis.score}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">SEO Ball</div>
                      <Progress value={analysis.score} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Badge className={`text-2xl px-4 py-2 ${getGradeColor(analysis.grade)}`}>
                        {analysis.grade}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-2">Baho</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl font-bold text-primary">
                        {analysis.readability?.score || 0}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">O'qilish darajasi</div>
                      <div className="text-xs mt-1">{analysis.readability?.level}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Content Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Kontent statistikasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{analysis.contentAnalysis?.wordCount || 0}</div>
                        <div className="text-xs text-muted-foreground">So'zlar</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{analysis.contentAnalysis?.paragraphCount || 0}</div>
                        <div className="text-xs text-muted-foreground">Paragraflar</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{analysis.contentAnalysis?.h2Count || 0}</div>
                        <div className="text-xs text-muted-foreground">H2 teglar</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{analysis.contentAnalysis?.h3Count || 0}</div>
                        <div className="text-xs text-muted-foreground">H3 teglar</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{analysis.contentAnalysis?.imagesSuggested || 0}</div>
                        <div className="text-xs text-muted-foreground">Tavsiya rasmlar</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Issues */}
                {analysis.issues && analysis.issues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Muammolar ({analysis.issues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.issues.map((issue, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            {getIssueIcon(issue.type)}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{issue.message}</div>
                              <div className="text-xs text-muted-foreground mt-1">{issue.suggestion}</div>
                              <Badge variant="outline" className="mt-2 text-xs">{issue.category}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Tavsiyalar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {analysis.recommendations.map((rec, index) => (
                          <AccordionItem key={index} value={`rec-${index}`}>
                            <AccordionTrigger className="text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant={getPriorityColor(rec.priority) as any} className="text-xs">
                                  {rec.priority}
                                </Badge>
                                {rec.title}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-muted-foreground text-sm">{rec.description}</p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                {/* Keywords */}
                {analysis.keywords && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Kalit so'zlar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Asosiy kalit so'z</div>
                        <Badge variant="default">{analysis.keywords.primary}</Badge>
                      </div>
                      {analysis.keywords.secondary && analysis.keywords.secondary.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Ikkilamchi kalit so'zlar</div>
                          <div className="flex flex-wrap gap-2">
                            {analysis.keywords.secondary.map((kw, i) => (
                              <Badge key={i} variant="secondary">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.keywords.lsi && analysis.keywords.lsi.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">LSI kalit so'zlar</div>
                          <div className="flex flex-wrap gap-2">
                            {analysis.keywords.lsi.map((kw, i) => (
                              <Badge key={i} variant="outline">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Optimized Suggestions */}
                {analysis.optimized && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Optimallashtirilgan variantlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm font-medium mb-1">Sarlavha</div>
                        <div className="p-2 bg-muted rounded text-sm">{analysis.optimized.title}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Meta tavsif</div>
                        <div className="p-2 bg-muted rounded text-sm">{analysis.optimized.meta_description}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">URL Slug</div>
                        <div className="p-2 bg-muted rounded text-sm font-mono">{analysis.optimized.slug}</div>
                      </div>
                      {onApplyOptimized && (
                        <Button 
                          onClick={() => {
                            onApplyOptimized(analysis.optimized);
                            toast.success('Optimallashtirilgan ma\'lumotlar qo\'llanildi');
                          }}
                          className="w-full"
                        >
                          Qo'llash
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SEOAnalyzer;
