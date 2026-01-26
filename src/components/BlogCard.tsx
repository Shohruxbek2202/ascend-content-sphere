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
      className={`group block ${featured ? 'sm:col-span-2' : ''}`}
    >
      <article className="h-full">
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg aspect-[16/10] bg-muted mb-3 md:mb-4">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="space-y-2 md:space-y-3">
          {/* Category */}
          {category && (
            <span className="inline-block text-xs font-medium text-secondary-foreground bg-secondary px-2.5 py-0.5 md:px-3 md:py-1 rounded-full">
              {category}
            </span>
          )}

          {/* Title */}
          <h3 className={`font-display font-semibold text-foreground group-hover:text-muted-foreground transition-colors leading-snug line-clamp-2 ${
            featured ? 'text-xl md:text-2xl lg:text-3xl' : 'text-base md:text-lg lg:text-xl'
          }`}>
            {title}
          </h3>

          {/* Excerpt */}
          <p className={`text-muted-foreground line-clamp-2 ${
            featured ? 'text-sm md:text-base' : 'text-xs md:text-sm'
          }`}>
            {excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between pt-1 md:pt-2">
            <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{readTime} {t.blog.readTime}</span>
            </div>

            <div className="flex items-center gap-1 text-foreground text-xs md:text-sm font-medium group-hover:gap-2 transition-all">
              <span className="hidden sm:inline">{t.blog.readMore}</span>
              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
