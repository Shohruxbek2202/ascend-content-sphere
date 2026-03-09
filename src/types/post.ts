export interface Post {
  id: string;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  excerpt_uz: string | null;
  excerpt_ru: string | null;
  excerpt_en: string | null;
  content_uz: string;
  content_ru: string;
  content_en: string;
  featured_image: string | null;
  reading_time: number | null;
  views: number | null;
  likes: number | null;
  tags: string[] | null;
  published_at: string | null;
  featured?: boolean | null;
  category_id?: string | null;
  canonical_url?: string | null;
  categories?: {
    slug: string;
    name_uz: string;
    name_ru: string;
    name_en: string;
  };
}

export interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}
