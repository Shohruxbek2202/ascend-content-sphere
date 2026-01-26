import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: number;
  likes: number;
  comments: number;
  publishedAt: string;
  featured?: boolean;
}

export const BlogCard = ({
  id,
  title,
  excerpt,
  image,
  category,
  readTime,
  featured = false,
}: BlogCardProps) => {
  const { t } = useLanguage();

  return (
    <Link 
      to={`/blog/${id}`} 
      className={`group block ${featured ? 'md:col-span-2' : ''}`}
    >
      <article className="h-full">
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg aspect-[16/10] bg-muted mb-4">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Category */}
          <span className="inline-block text-xs font-medium text-secondary-foreground bg-secondary px-3 py-1 rounded-full">
            {category}
          </span>

          {/* Title */}
          <h3 className={`font-display font-semibold text-foreground group-hover:text-muted-foreground transition-colors leading-snug ${
            featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
          }`}>
            {title}
          </h3>

          {/* Excerpt */}
          <p className={`text-muted-foreground line-clamp-2 ${
            featured ? 'text-base' : 'text-sm'
          }`}>
            {excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{readTime} {t.blog.readTime}</span>
            </div>

            <div className="flex items-center gap-1 text-foreground text-sm font-medium group-hover:gap-2 transition-all">
              {t.blog.readMore}
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
