import { useState } from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneratedPost {
  title_uz: string;
  title_ru: string;
  title_en: string;
  meta_title_uz: string;
  meta_title_ru: string;
  meta_title_en: string;
  meta_description_uz: string;
  meta_description_ru: string;
  meta_description_en: string;
  excerpt_uz: string;
  excerpt_ru: string;
  excerpt_en: string;
  content_uz: string;
  content_ru: string;
  content_en: string;
  slug: string;
  tags: string[];
  reading_time: number;
  focus_keywords: string[];
}

interface AIPostGeneratorProps {
  onGenerated: (post: GeneratedPost) => void;
}

const AIPostGenerator = ({ onGenerated }: AIPostGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [language, setLanguage] = useState('uz');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Mavzu kiritish shart');
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-post', {
        body: { topic, keywords, language }
      });

      if (error) throw error;

      if (data?.success && data?.post) {
        onGenerated(data.post);
        toast.success('Post muvaffaqiyatli yaratildi!');
        setIsOpen(false);
        setTopic('');
        setKeywords('');
      } else {
        throw new Error(data?.error || 'Post yaratishda xatolik');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Post yaratishda xatolik');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          AI bilan yaratish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Post Generator
          </DialogTitle>
          <DialogDescription>
            Sun'iy intellekt yordamida SEO-optimallashtirilgan post yarating
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Mavzu *</Label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Masalan: 2024-yilda eng yaxshi raqamli marketing strategiyalari"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Asosiy kalit so'zlar (ixtiyoriy)</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="raqamli marketing, SEO, SMM"
            />
          </div>

          <div className="space-y-2">
            <Label>Asosiy til</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uz">🇺🇿 O'zbek</SelectItem>
                <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !topic.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Yaratilmoqda... (30-60 soniya)
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Post yaratish
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIPostGenerator;
