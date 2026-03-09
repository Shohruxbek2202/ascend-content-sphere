import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Folder, MessageSquare, Users,
  BarChart3, Settings, LogOut, BookOpen, Menu, X, Mail,
  Search, Send, Megaphone, HelpCircle, Briefcase, Network,
  Newspaper, UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Lazy load all admin sub-pages
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const AdminPosts = lazy(() => import('@/components/admin/AdminPosts'));
const AdminCategories = lazy(() => import('@/components/admin/AdminCategories'));
const AdminComments = lazy(() => import('@/components/admin/AdminComments'));
const AdminSubscribers = lazy(() => import('@/components/admin/AdminSubscribers'));
const AdminAnalytics = lazy(() => import('@/components/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('@/components/admin/AdminSettings'));
const AdminMessages = lazy(() => import('@/components/admin/AdminMessages'));
const AdminSEO = lazy(() => import('@/components/admin/AdminSEO'));
const AdminNewsletterLogs = lazy(() => import('@/components/admin/AdminNewsletterLogs'));
const AdminSEOAudit = lazy(() => import('@/components/admin/AdminSEOAudit'));
const AdminSitemapRobots = lazy(() => import('@/components/admin/AdminSitemapRobots'));
const AdminBroadcast = lazy(() => import('@/components/admin/AdminBroadcast'));
const AdminFAQ = lazy(() => import('@/components/admin/AdminFAQ'));
const AdminCaseStudies = lazy(() => import('@/components/admin/AdminCaseStudies'));
const AdminTopicClusters = lazy(() => import('@/components/admin/AdminTopicClusters'));
const AdminAutoNews = lazy(() => import('@/components/admin/AdminAutoNews'));
const AdminAbout = lazy(() => import('@/components/admin/AdminAbout'));
const PostWritingGuide = lazy(() => import('@/components/admin/PostWritingGuide'));

const AdminLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Newspaper, label: 'Avto Yangiliklar', path: '/admin/auto-news' },
  { icon: FileText, label: 'Postlar', path: '/admin/posts' },
  { icon: BookOpen, label: 'Post Qo\'llanma', path: '/admin/writing-guide' },
  { icon: Folder, label: 'Kategoriyalar', path: '/admin/categories' },
  { icon: HelpCircle, label: 'FAQ', path: '/admin/faq' },
  { icon: Briefcase, label: 'Case Studies', path: '/admin/case-studies' },
  { icon: Network, label: 'Topic Clusters', path: '/admin/topic-clusters' },
  { icon: UserCircle, label: 'About Sahifa', path: '/admin/about' },
  { icon: MessageSquare, label: 'Izohlar', path: '/admin/comments' },
  { icon: Mail, label: 'Xabarlar', path: '/admin/messages' },
  { icon: Users, label: 'Obunchilar', path: '/admin/subscribers' },
  { icon: Send, label: 'Newsletter', path: '/admin/newsletter' },
  { icon: Megaphone, label: 'Broadcast', path: '/admin/broadcast' },
  { icon: Search, label: 'SEO Audit', path: '/admin/seo-audit' },
  { icon: Search, label: 'SEO Keywords', path: '/admin/seo' },
  { icon: Search, label: 'Sitemap', path: '/admin/sitemap' },
  { icon: BarChart3, label: 'Analitika', path: '/admin/analytics' },
  { icon: Settings, label: 'Sozlamalar', path: '/admin/settings' },
];

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess = async (userId: string): Promise<boolean> => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();

        if (error || !data) {
          if (isMounted) {
            toast.error('Admin paneliga kirish huquqingiz yo\'q');
            await supabase.auth.signOut();
            navigate('/auth');
          }
          return false;
        }
        return true;
      } catch {
        return false;
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        if (!session?.user) {
          setUser(null);
          setIsLoading(false);
          navigate('/auth');
          return;
        }
        setTimeout(async () => {
          if (!isMounted) return;
          const isAdmin = await checkAdminAccess(session.user.id);
          if (isMounted && isAdmin) {
            setUser(session.user);
          }
        }, 0);
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (!session?.user) {
          navigate('/auth');
          return;
        }

        const isAdmin = await checkAdminAccess(session.user.id);
        if (isMounted && isAdmin) {
          setUser(session.user);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Muvaffaqiyatli chiqdingiz');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold">Admin</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="text-sm text-muted-foreground mb-3 truncate">{user.email}</div>
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <Suspense fallback={<AdminLoader />}>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/auto-news" element={<AdminAutoNews />} />
              <Route path="/posts/*" element={<AdminPosts />} />
              <Route path="/writing-guide" element={<PostWritingGuide />} />
              <Route path="/categories" element={<AdminCategories />} />
              <Route path="/faq" element={<AdminFAQ />} />
              <Route path="/case-studies" element={<AdminCaseStudies />} />
              <Route path="/topic-clusters" element={<AdminTopicClusters />} />
              <Route path="/about" element={<AdminAbout />} />
              <Route path="/comments" element={<AdminComments />} />
              <Route path="/messages" element={<AdminMessages />} />
              <Route path="/subscribers" element={<AdminSubscribers />} />
              <Route path="/newsletter" element={<AdminNewsletterLogs />} />
              <Route path="/broadcast" element={<AdminBroadcast />} />
              <Route path="/seo-audit" element={<AdminSEOAudit />} />
              <Route path="/seo" element={<AdminSEO />} />
              <Route path="/sitemap" element={<AdminSitemapRobots />} />
              <Route path="/analytics" element={<AdminAnalytics />} />
              <Route path="/settings" element={<AdminSettings />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin;
