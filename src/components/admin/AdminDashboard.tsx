import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Users, Eye, Heart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  totalComments: number;
  totalSubscribers: number;
  totalViews: number;
  totalLikes: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    publishedPosts: 0,
    totalComments: 0,
    totalSubscribers: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);

      // Fetch posts count
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      const { count: publishedPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      // Fetch comments count
      const { count: totalComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      // Fetch subscribers count
      const { count: totalSubscribers } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Fetch total views and likes
      const { data: postsData } = await supabase
        .from('posts')
        .select('views, likes');

      let totalViews = 0;
      let totalLikes = 0;

      if (postsData) {
        totalViews = postsData.reduce((sum, post) => sum + (post.views || 0), 0);
        totalLikes = postsData.reduce((sum, post) => sum + (post.likes || 0), 0);
      }

      setStats({
        totalPosts: totalPosts || 0,
        publishedPosts: publishedPosts || 0,
        totalComments: totalComments || 0,
        totalSubscribers: totalSubscribers || 0,
        totalViews,
        totalLikes,
      });

      setIsLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Jami Postlar',
      value: stats.totalPosts,
      subValue: `${stats.publishedPosts} nashr qilingan`,
      icon: FileText,
      color: 'bg-primary text-primary-foreground',
    },
    {
      title: 'Izohlar',
      value: stats.totalComments,
      subValue: 'Barcha izohlar',
      icon: MessageSquare,
      color: 'bg-secondary text-secondary-foreground',
    },
    {
      title: 'Obunchilar',
      value: stats.totalSubscribers,
      subValue: 'Faol obunchilar',
      icon: Users,
      color: 'bg-accent text-accent-foreground',
    },
    {
      title: 'Ko\'rishlar',
      value: stats.totalViews,
      subValue: 'Jami ko\'rishlar',
      icon: Eye,
      color: 'bg-muted text-muted-foreground',
    },
    {
      title: 'Likelar',
      value: stats.totalLikes,
      subValue: 'Jami likelar',
      icon: Heart,
      color: 'bg-destructive text-destructive-foreground',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString('uz-UZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Tezkor Harakatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/posts/new"
              className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center gap-3"
            >
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">Yangi Post Yaratish</span>
            </Link>
            <Link
              to="/admin/comments"
              className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center gap-3"
            >
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="font-medium">Izohlarni Ko'rish</span>
            </Link>
            <Link
              to="/admin/analytics"
              className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center gap-3"
            >
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-medium">Analitikani Ko'rish</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
