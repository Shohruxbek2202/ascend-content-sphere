import { useState, useEffect } from 'react';
import { BarChart3, Eye, Heart, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface TopPost {
  id: string;
  title_uz: string;
  slug: string;
  views: number;
  likes: number;
}

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalSubscribers: number;
  topPosts: TopPost[];
  languageDistribution: Record<string, number>;
}

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalSubscribers: 0,
    topPosts: [],
    languageDistribution: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);

      // Fetch posts stats
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title_uz, slug, views, likes')
        .eq('published', true)
        .order('views', { ascending: false })
        .limit(10);

      let totalViews = 0;
      let totalLikes = 0;

      if (posts) {
        totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
        totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
      }

      // Fetch comments count
      const { count: totalComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('approved', true);

      // Fetch subscribers stats
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('language')
        .eq('active', true);

      const languageDistribution: Record<string, number> = {};
      let totalSubscribers = 0;

      if (subscribers) {
        totalSubscribers = subscribers.length;
        subscribers.forEach((s) => {
          languageDistribution[s.language] = (languageDistribution[s.language] || 0) + 1;
        });
      }

      setData({
        totalViews,
        totalLikes,
        totalComments: totalComments || 0,
        totalSubscribers,
        topPosts: posts || [],
        languageDistribution,
      });

      setIsLoading(false);
    };

    fetchAnalytics();
  }, []);

  const statsCards = [
    {
      title: 'Jami Ko\'rishlar',
      value: data.totalViews,
      icon: Eye,
      color: 'bg-blue-500',
    },
    {
      title: 'Jami Likelar',
      value: data.totalLikes,
      icon: Heart,
      color: 'bg-red-500',
    },
    {
      title: 'Jami Izohlar',
      value: data.totalComments,
      icon: MessageSquare,
      color: 'bg-green-500',
    },
    {
      title: 'Faol Obunchilar',
      value: data.totalSubscribers,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analitika</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Analitika</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
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
              <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Eng ko'p o'qilgan postlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPosts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Hali postlar yo'q
                </p>
              ) : (
                data.topPosts.slice(0, 5).map((post, index) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary line-clamp-1 max-w-[200px]"
                      >
                        {post.title_uz}
                      </a>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes || 0}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Language Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Obunchilar tili bo'yicha
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data.languageDistribution).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Hali obunchilar yo'q
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(data.languageDistribution).map(([lang, count]) => {
                  const percentage = Math.round((count / data.totalSubscribers) * 100);
                  const langNames: Record<string, string> = {
                    uz: "🇺🇿 O'zbek",
                    ru: '🇷🇺 Русский',
                    en: '🇬🇧 English',
                  };

                  return (
                    <div key={lang} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{langNames[lang] || lang}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
