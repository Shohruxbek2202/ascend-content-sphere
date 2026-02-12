import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelImportProps {
  columns: { key: string; label: string; required?: boolean }[];
  onImport: (data: Record<string, any>[]) => Promise<void>;
  templateName: string;
}

const ExcelImport = ({ columns, onImport, templateName }: ExcelImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<Record<string, any>[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
        
        if (jsonData.length === 0) {
          toast.error('Fayl bo\'sh');
          return;
        }

        // Validate required columns
        const fileKeys = Object.keys(jsonData[0]);
        const missingCols = columns
          .filter(c => c.required)
          .filter(c => !fileKeys.includes(c.key));

        if (missingCols.length > 0) {
          toast.error(`Kerakli ustunlar topilmadi: ${missingCols.map(c => c.label).join(', ')}`);
          return;
        }

        setPreview(jsonData.slice(0, 10)); // Show first 10 rows
        toast.success(`${jsonData.length} ta qator topildi`);
      } catch {
        toast.error('Faylni o\'qishda xatolik');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      const data = await new Promise<Record<string, any>[]>((resolve, reject) => {
        reader.onload = (evt) => {
          try {
            const wb = XLSX.read(evt.target?.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            resolve(XLSX.utils.sheet_to_json(ws));
          } catch (e) {
            reject(e);
          }
        };
        reader.readAsBinaryString(fileInputRef.current!.files![0]);
      });

      await onImport(data);
      toast.success(`${data.length} ta qator import qilindi`);
      setPreview([]);
      setIsOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e: any) {
      toast.error(e.message || 'Import xatoligi');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      columns.reduce((acc, col) => ({ ...acc, [col.key]: '' }), {}),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${templateName}-template.xlsx`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Excel / CSV Import</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" /> Shablon yuklab olish
            </Button>
          </div>

          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFile}
            />
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Excel yoki CSV faylni tanlang
            </p>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Fayl tanlash
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <strong>Kerakli ustunlar:</strong>{' '}
            {columns.filter(c => c.required).map(c => c.label).join(', ')}
          </div>

          {preview.length > 0 && (
            <>
              <div className="text-sm font-medium">Ko'rib chiqish (birinchi 10 ta):</div>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map(col => (
                        <TableHead key={col.key} className="text-xs whitespace-nowrap">
                          {col.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        {columns.map(col => (
                          <TableCell key={col.key} className="text-xs max-w-[200px] truncate">
                            {String(row[col.key] || '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button className="w-full" onClick={handleImport} disabled={isImporting}>
                {isImporting ? 'Import qilinmoqda...' : `Import qilish`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImport;
