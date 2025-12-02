import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { BlogCard } from '@/components/BlogCard';
import { SubscribeSection } from '@/components/SubscribeSection';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock data (will be replaced with real data from database)
const featuredPosts = [
  {
    id: '1',
    title: 'Digital Marketing Strategiyalari 2024',
    excerpt: 'Zamonaviy digital marketing tendentsiyalari va amaliy strategiyalar',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    category: 'Digital Marketing',
    readTime: 8,
    likes: 234,
    comments: 45,
    publishedAt: '2024-12-01',
  },
  {
    id: '2',
    title: 'SEO Optimization: A\'lo ko\'rsatkichlarga erishish',
    excerpt: 'Google algoritmlari va SEO optimizatsiyasi bo\'yicha batafsil qo\'llanma',
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800',
    category: 'SEO',
    readTime: 12,
    likes: 567,
    comments: 89,
    publishedAt: '2024-11-28',
  },
];

const latestPosts = [
  {
    id: '3',
    title: 'Content Marketing Asoslari',
    excerpt: 'Samarali content yaratish va taqsimlash strategiyalari',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800',
    category: 'Content',
    readTime: 6,
    likes: 123,
    comments: 23,
    publishedAt: '2024-11-25',
  },
  {
    id: '4',
    title: 'Social Media Marketing 2024',
    excerpt: 'Ijtimoiy tarmoqlarda brand yaratish va rivojlantirish',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    category: 'Social Media',
    readTime: 10,
    likes: 456,
    comments: 67,
    publishedAt: '2024-11-22',
  },
  {
    id: '5',
    title: 'Email Marketing Strategiyalari',
    excerpt: 'Yuqori konversiyali email kampaniyalarini yaratish',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
    category: 'Email Marketing',
    readTime: 7,
    likes: 234,
    comments: 34,
    publishedAt: '2024-11-20',
  },
  {
    id: '6',
    title: 'Analytics va Data-Driven Marketing',
    excerpt: 'Ma\'lumotlarga asoslangan marketing qarorlar qabul qilish',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    category: 'Analytics',
    readTime: 9,
    likes: 345,
    comments: 56,
    publishedAt: '2024-11-18',
  },
];

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <Hero />

        {/* Featured Posts */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {t.blog.featured}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} {...post} featured />
            ))}
          </div>
        </section>

        {/* Latest Posts */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {t.blog.latest}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <BlogCard key={post.id} {...post} />
            ))}
          </div>
        </section>

        <SubscribeSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
