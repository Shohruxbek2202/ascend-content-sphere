import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, CheckCircle, XCircle, Search, BarChart3 } from "lucide-react";
import { format } from "date-fns";

interface NewsletterLog {
  id: string;
  post_id: string | null;
  subscriber_email: string;
  subscriber_language: string | null;
  status: string;
  error_message: string | null;
  sent_at: string;
  posts?: {
    title_uz: string;
    slug: string;
  } | null;
}

export default function AdminNewsletterLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: logs, isLoading } = useQuery({
    queryKey: ['newsletter-logs', page, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('newsletter_logs')
        .select(`
          *,
          posts(title_uz, slug)
        `, { count: 'exact' })
        .order('sent_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { logs: data as NewsletterLog[], total: count || 0 };
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['newsletter-stats'],
    queryFn: async () => {
      const { count: sentCount } = await supabase
        .from('newsletter_logs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'sent');

      const { count: failedCount } = await supabase
        .from('newsletter_logs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'failed');

      const { data: uniquePosts } = await supabase
        .from('newsletter_logs')
        .select('post_id')
        .not('post_id', 'is', null);

      const uniquePostIds = new Set(uniquePosts?.map(p => p.post_id) || []);

      return {
        totalSent: sentCount || 0,
        totalFailed: failedCount || 0,
        totalPosts: uniquePostIds.size
      };
    }
  });

  const filteredLogs = logs?.logs.filter(log => 
    log.subscriber_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.posts?.title_uz?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil((logs?.total || 0) / pageSize);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yuborilgan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.totalSent || 0}</div>
            <p className="text-xs text-muted-foreground">Muvaffaqiyatli yuborilgan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xatolik</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.totalFailed || 0}</div>
            <p className="text-xs text-muted-foreground">Yuborilmagan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maqolalar</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">Newsletter yuborilgan</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Newsletter Tarixi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Email yoki maqola nomi bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                <SelectItem value="sent">Yuborilgan</SelectItem>
                <SelectItem value="failed">Xatolik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Yuklanmoqda...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Hech qanday yozuv topilmadi
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Maqola</TableHead>
                      <TableHead>Til</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sana</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.subscriber_email}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.posts?.title_uz || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.subscriber_language?.toUpperCase() || "UZ"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.status === 'sent' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Yuborildi
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Xatolik
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(log.sent_at), "dd.MM.yyyy HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Jami: {logs?.total} ta yozuv
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Oldingi
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Keyingi
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
