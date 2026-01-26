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
      <article className="h-full bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-500 hover:-translate-y-1">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/10] bg-muted">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          {/* Glass overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="p-4 md:p-5 space-y-3">
          {/* Category Badge - Glass Style */}
          {category && (
            <span className="inline-block text-xs font-medium text-secondary-foreground bg-secondary/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
              {category}
            </span>
          )}

          {/* Title */}
          <h3 className={`font-display font-semibold text-foreground group-hover:text-secondary transition-colors duration-300 leading-snug line-clamp-2 ${
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
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{readTime} {t.blog.readTime}</span>
            </div>

            <div className="flex items-center gap-1.5 text-secondary text-xs md:text-sm font-medium group-hover:gap-2.5 transition-all duration-300">
              <span className="hidden sm:inline">{t.blog.readMore}</span>
              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
