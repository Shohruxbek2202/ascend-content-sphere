import { useState } from 'react';
import { Globe, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PingResult {
  engine: string;
  status: string;
  message?: string;
}

interface GooglePingButtonProps {
  postSlug: string;
  disabled?: boolean;
}

const GooglePingButton = ({ postSlug, disabled }: GooglePingButtonProps) => {
  const [isPinging, setIsPinging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<PingResult[]>([]);

  const handlePing = async () => {
    if (!postSlug) {
      toast.error('Post slug kerak');
      return;
    }

    setIsPinging(true);
    setIsOpen(true);
    setResults([]);

    const fullUrl = `https://shohruxdigital.uz/post/${postSlug}`;

    try {
      const { data, error } = await supabase.functions.invoke('ping-search-engines', {
        body: { url: fullUrl }
      });

      if (error) throw error;

      if (data?.success && data?.results) {
        setResults(data.results);
        const successCount = data.results.filter((r: PingResult) => r.status === 'success').length;
        toast.success(`${successCount}/${data.results.length} qidiruv tizimiga yuborildi`);
      } else {
        throw new Error(data?.error || 'Ping xatosi');
      }
    } catch (error) {
      console.error('Ping error:', error);
      toast.error(error instanceof Error ? error.message : 'Qidiruv tizimlariga yuborishda xatolik');
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={handlePing} 
        disabled={disabled || isPinging}
        className="gap-2"
        title="Google va boshqa qidiruv tizimlariga indeksatsiya so'rovini yuborish"
      >
        {isPinging ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
        Google Ping
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Indeksatsiya Natijalari
            </DialogTitle>
            <DialogDescription>
              Post qidiruv tizimlariga yuborildi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {isPinging ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{result.engine}</div>
                      {result.message && (
                        <div className="text-xs text-muted-foreground">{result.message}</div>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${
                    result.status === 'success' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {result.status === 'success' ? 'Yuborildi' : 'Xatolik'}
                  </span>
                </div>
              ))
            ) : null}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Izoh: Indeksatsiya bir necha soatdan bir necha kungacha vaqt olishi mumkin.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GooglePingButton;
