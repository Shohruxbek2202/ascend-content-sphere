export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          language: string | null
          metadata: Json | null
          post_id: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          language?: string | null
          metadata?: Json | null
          post_id?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          language?: string | null
          metadata?: Json | null
          post_id?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          icon: string | null
          id: string
          name_en: string
          name_ru: string
          name_uz: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          icon?: string | null
          id?: string
          name_en: string
          name_ru: string
          name_uz: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          icon?: string | null
          id?: string
          name_en?: string
          name_ru?: string
          name_uz?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          approved: boolean | null
          author_email: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          approved?: boolean | null
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          approved?: boolean | null
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean | null
          subject?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category_id: string | null
          content_en: string
          content_ru: string
          content_uz: string
          created_at: string
          excerpt_en: string | null
          excerpt_ru: string | null
          excerpt_uz: string | null
          featured: boolean | null
          featured_image: string | null
          focus_keywords: string[] | null
          id: string
          likes: number | null
          meta_description_en: string | null
          meta_description_ru: string | null
          meta_description_uz: string | null
          meta_title_en: string | null
          meta_title_ru: string | null
          meta_title_uz: string | null
          published: boolean | null
          published_at: string | null
          reading_time: number | null
          slug: string
          tags: string[] | null
          title_en: string
          title_ru: string
          title_uz: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content_en: string
          content_ru: string
          content_uz: string
          created_at?: string
          excerpt_en?: string | null
          excerpt_ru?: string | null
          excerpt_uz?: string | null
          featured?: boolean | null
          featured_image?: string | null
          focus_keywords?: string[] | null
          id?: string
          likes?: number | null
          meta_description_en?: string | null
          meta_description_ru?: string | null
          meta_description_uz?: string | null
          meta_title_en?: string | null
          meta_title_ru?: string | null
          meta_title_uz?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          tags?: string[] | null
          title_en: string
          title_ru: string
          title_uz: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content_en?: string
          content_ru?: string
          content_uz?: string
          created_at?: string
          excerpt_en?: string | null
          excerpt_ru?: string | null
          excerpt_uz?: string | null
          featured?: boolean | null
          featured_image?: string | null
          focus_keywords?: string[] | null
          id?: string
          likes?: number | null
          meta_description_en?: string | null
          meta_description_ru?: string | null
          meta_description_uz?: string | null
          meta_title_en?: string | null
          meta_title_ru?: string | null
          meta_title_uz?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          tags?: string[] | null
          title_en?: string
          title_ru?: string
          title_uz?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keywords: {
        Row: {
          created_at: string
          id: string
          keyword: string
          keyword_group: string | null
          language: string | null
          priority: number | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          keyword: string
          keyword_group?: string | null
          language?: string | null
          priority?: number | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          keyword?: string
          keyword_group?: string | null
          language?: string | null
          priority?: number | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          active: boolean | null
          email: string
          id: string
          language: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          active?: boolean | null
          email: string
          id?: string
          language?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          active?: boolean | null
          email?: string
          id?: string
          language?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_comments: {
        Row: {
          approved: boolean | null
          author_name: string | null
          content: string | null
          created_at: string | null
          id: string | null
          post_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_post_likes: { Args: { post_id: string }; Returns: undefined }
      increment_post_views: { Args: { post_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
