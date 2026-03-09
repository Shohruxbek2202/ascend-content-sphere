import { BlogCard } from '@/components/BlogCard';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Post } from '@/types/post';

interface RelatedPostsProps {
  posts: Post[];
}

const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  const { t, language } = useLanguage();

  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-bold mb-6">{t.post.relatedPosts}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((related) => {
          const relTitle = (related[`title_${language}` as keyof Post] as string) || related.title_en;
          const relExcerpt = (related[`excerpt_${language}` as keyof Post] as string) || related.excerpt_en || '';
          const relCategory = related.categories
            ? (related.categories[`name_${language}` as keyof typeof related.categories] as string) || related.categories.name_en
            : '';
          return (
            <BlogCard
              key={related.id}
              id={related.slug}
              title={relTitle}
              excerpt={relExcerpt}
              image={related.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'}
              category={relCategory}
              readTime={related.reading_time || 5}
              likes={related.likes || 0}
              comments={0}
              publishedAt={related.published_at || ''}
              tags={related.tags || []}
            />
          );
        })}
      </div>
    </section>
  );
};

export default RelatedPosts;
