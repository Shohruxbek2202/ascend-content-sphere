import { Link } from 'react-router-dom';
import { Clock, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  likes,
  comments,
  featured = false,
}: BlogCardProps) => {
  const { t } = useLanguage();

  return (
    <Card
      className={`group overflow-hidden hover:shadow-xl transition-all duration-300 ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      <Link to={`/blog/${id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-video">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Badge className="absolute top-4 left-4 bg-primary text-white">
            {category}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <h3
            className={`font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 ${
              featured ? 'text-2xl md:text-3xl' : 'text-xl'
            }`}
          >
            {title}
          </h3>

          <p
            className={`text-muted-foreground line-clamp-2 ${
              featured ? 'text-base' : 'text-sm'
            }`}
          >
            {excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{readTime} {t.blog.readTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{comments}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
              {t.blog.readMore}
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};
