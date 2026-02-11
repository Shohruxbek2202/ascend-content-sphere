import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Folder,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  LogOut,
  BookOpen,
  Menu,
  X,
  Mail,
  Search,
  Send,
  Megaphone,
  HelpCircle,
  Briefcase,
  Network,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Admin Sub-pages
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminPosts from '@/components/admin/AdminPosts';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminComments from '@/components/admin/AdminComments';
import AdminSubscribers from '@/components/admin/AdminSubscribers';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminMessages from '@/components/admin/AdminMessages';
import AdminSEO from '@/components/admin/AdminSEO';
import AdminNewsletterLogs from '@/components/admin/AdminNewsletterLogs';
import AdminSEOAudit from '@/components/admin/AdminSEOAudit';
import AdminSitemapRobots from '@/components/admin/AdminSitemapRobots';
import AdminBroadcast from '@/components/admin/AdminBroadcast';
import AdminFAQ from '@/components/admin/AdminFAQ';
import AdminCaseStudies from '@/components/admin/AdminCaseStudies';
import AdminTopicClusters from '@/components/admin/AdminTopicClusters';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: FileText, label: 'Postlar', path: '/admin/posts' },
  { icon: Folder, label: 'Kategoriyalar', path: '/admin/categories' },
  { icon: HelpCircle, label: 'FAQ', path: '/admin/faq' },
  { icon: Briefcase, label: 'Case Studies', path: '/admin/case-studies' },
  { icon: Network, label: 'Topic Clusters', path: '/admin/topic-clusters' },
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold">Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
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

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            <div className="text-sm text-muted-foreground mb-3 truncate">
              {user.email}
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/posts/*" element={<AdminPosts />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/faq" element={<AdminFAQ />} />
            <Route path="/case-studies" element={<AdminCaseStudies />} />
            <Route path="/topic-clusters" element={<AdminTopicClusters />} />
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
        </div>
      </main>

      {/* Mobile Overlay */}
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
