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
      <article className="h-full relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden transition-all duration-500 hover:border-secondary/30 hover:shadow-xl hover:shadow-secondary/10 hover:-translate-y-1">
        {/* Subtle top glow on hover */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative overflow-hidden aspect-[16/10] bg-muted">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Category Badge - positioned on image */}
          {category && (
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
              <span className="inline-block text-xs font-semibold text-secondary-foreground bg-secondary px-3 py-1.5 rounded-full shadow-lg shadow-secondary/30">
                {category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 space-y-4">
          {/* Title */}
          <h3 className={`font-display font-bold text-foreground group-hover:text-secondary transition-colors duration-300 leading-tight line-clamp-2 ${
            featured ? 'text-xl md:text-2xl lg:text-3xl' : 'text-lg md:text-xl'
          }`}>
            {title}
          </h3>

          {/* Excerpt */}
          <p className={`text-muted-foreground line-clamp-2 leading-relaxed ${
            featured ? 'text-sm md:text-base' : 'text-sm'
          }`}>
            {excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{readTime} {t.blog.readTime}</span>
            </div>

            <div className="flex items-center gap-2 text-secondary text-sm font-semibold group-hover:gap-3 transition-all duration-300">
              <span className="hidden sm:inline">{t.blog.readMore}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
