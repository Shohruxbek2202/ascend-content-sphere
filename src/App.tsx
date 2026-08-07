import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";

// Lazy load non-critical routes
const Blog = lazy(() => import("./pages/Blog"));
const Post = lazy(() => import("./pages/Post"));
const Categories = lazy(() => import("./pages/Categories"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const Subscribe = lazy(() => import("./pages/Subscribe"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Fitness = lazy(() => import("./pages/Fitness"));
const Podcast = lazy(() => import("./pages/Podcast"));
const PodcastEpisode = lazy(() => import("./pages/PodcastEpisode"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AnalyticsScripts = lazy(() =>
  import("./components/AnalyticsScripts").then(m => ({ default: m.AnalyticsScripts }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Public routes shared across all languages (mounted at /, /uz/*, /ru/*)
const LocalizedRoutes = () => (
  <Routes>
    <Route index element={<Index />} />
    <Route path="home" element={<Index />} />
    <Route path="blog" element={<Blog />} />
    <Route path="blog/:slug" element={<Post />} />
    <Route path="categories" element={<Categories />} />
    <Route path="about" element={<About />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="terms" element={<Terms />} />
    <Route path="contact" element={<Contact />} />
    <Route path="subscribe" element={<Subscribe />} />
    <Route path="unsubscribe" element={<Unsubscribe />} />
    <Route path="case-studies" element={<CaseStudies />} />
    <Route path="faq" element={<FAQ />} />
    <Route path="fitness" element={<Fitness />} />
    <Route path="podcast" element={<Podcast />} />
    <Route path="podcast/:slug" element={<PodcastEpisode />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <LanguageProvider>
              <Suspense fallback={null}>
                <AnalyticsScripts />
              </Suspense>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Admin & auth stay prefix-free */}
                  <Route path="/admin/*" element={<Admin />} />
                  <Route path="/auth" element={<Auth />} />
                  {/* Standalone lead landing pages */}
                  <Route path="/lp/:slug" element={<LandingPage />} />
                  {/* Language-prefixed public routes */}
                  <Route path="/uz/*" element={<LocalizedRoutes />} />
                  <Route path="/ru/*" element={<LocalizedRoutes />} />
                  {/* Default (English) — no prefix */}
                  <Route path="/*" element={<LocalizedRoutes />} />
                </Routes>
              </Suspense>
            </LanguageProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
