export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          inserted_at: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          inserted_at?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          inserted_at?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_votes: {
        Row: {
          comment_id: string
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "questions_feed"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_accepted: boolean | null
          is_answer: boolean | null
          kind: string | null
          project_id: string | null
          question_id: string | null
          tags: string[] | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          is_answer?: boolean | null
          kind?: string | null
          project_id?: string | null
          question_id?: string | null
          tags?: string[] | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          is_answer?: boolean | null
          kind?: string | null
          project_id?: string | null
          question_id?: string | null
          tags?: string[] | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions_feed"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_name: string | null
          icon: string | null
          id: string
          member_count: number | null
          name: string
          post_count: number | null
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string | null
          id?: string
          member_count?: number | null
          name: string
          post_count?: number | null
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string | null
          id?: string
          member_count?: number | null
          name?: string
          post_count?: number | null
          slug?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          id: string
          payee_id: string | null
          payer_id: string | null
          stripe_payment_intent: string | null
          type: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          id?: string
          payee_id?: string | null
          payer_id?: string | null
          stripe_payment_intent?: string | null
          type?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          payee_id?: string | null
          payer_id?: string | null
          stripe_payment_intent?: string | null
          type?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          comment_count: number | null
          community_id: string | null
          content: string | null
          created_at: string | null
          downvotes: number | null
          id: string
          images: string[] | null
          is_pinned: boolean | null
          post_type: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
          vote_count: number | null
        }
        Insert: {
          author_id?: string | null
          comment_count?: number | null
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          downvotes?: number | null
          id?: string
          images?: string[] | null
          is_pinned?: boolean | null
          post_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
          vote_count?: number | null
        }
        Update: {
          author_id?: string | null
          comment_count?: number | null
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          downvotes?: number | null
          id?: string
          images?: string[] | null
          is_pinned?: boolean | null
          post_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          comment_karma: number | null
          company: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          engineering_discipline: string | null
          experience_level: string | null
          github_username: string | null
          handle: string | null
          id: string
          is_banned: boolean | null
          is_pro: boolean | null
          is_verified: boolean | null
          job_title: string | null
          joined_communities: string[] | null
          last_active: string | null
          lifetime_cents: number | null
          linkedin_username: string | null
          location: string | null
          name: string | null
          plan: string | null
          post_karma: number | null
          preferences: Json | null
          profile_complete: boolean | null
          reputation: number | null
          saved_posts: string[] | null
          stripe_account_id: string | null
          stripe_customer_id: string | null
          tip_jar_on: boolean | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          comment_karma?: number | null
          company?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          engineering_discipline?: string | null
          experience_level?: string | null
          github_username?: string | null
          handle?: string | null
          id: string
          is_banned?: boolean | null
          is_pro?: boolean | null
          is_verified?: boolean | null
          job_title?: string | null
          joined_communities?: string[] | null
          last_active?: string | null
          lifetime_cents?: number | null
          linkedin_username?: string | null
          location?: string | null
          name?: string | null
          plan?: string | null
          post_karma?: number | null
          preferences?: Json | null
          profile_complete?: boolean | null
          reputation?: number | null
          saved_posts?: string[] | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          tip_jar_on?: boolean | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          comment_karma?: number | null
          company?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          engineering_discipline?: string | null
          experience_level?: string | null
          github_username?: string | null
          handle?: string | null
          id?: string
          is_banned?: boolean | null
          is_pro?: boolean | null
          is_verified?: boolean | null
          job_title?: string | null
          joined_communities?: string[] | null
          last_active?: string | null
          lifetime_cents?: number | null
          linkedin_username?: string | null
          location?: string | null
          name?: string | null
          plan?: string | null
          post_karma?: number | null
          preferences?: Json | null
          profile_complete?: boolean | null
          reputation?: number | null
          saved_posts?: string[] | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          tip_jar_on?: boolean | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      project_likes: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_versions: {
        Row: {
          changelog: string | null
          created_at: string | null
          files: Json | null
          id: string
          project_id: string | null
          readme_md: string | null
          version_no: number
          version_number: string | null
        }
        Insert: {
          changelog?: string | null
          created_at?: string | null
          files?: Json | null
          id?: string
          project_id?: string | null
          readme_md?: string | null
          version_no: number
          version_number?: string | null
        }
        Update: {
          changelog?: string | null
          created_at?: string | null
          files?: Json | null
          id?: string
          project_id?: string | null
          readme_md?: string | null
          version_no?: number
          version_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          current_version: string | null
          demo_url: string | null
          description: string | null
          discipline: string | null
          download_count: number | null
          id: string
          image_url: string | null
          is_public: boolean | null
          license: string | null
          like_count: number | null
          owner_id: string | null
          readme: string | null
          repository_url: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          current_version?: string | null
          demo_url?: string | null
          description?: string | null
          discipline?: string | null
          download_count?: number | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          license?: string | null
          like_count?: number | null
          owner_id?: string | null
          readme?: string | null
          repository_url?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          current_version?: string | null
          demo_url?: string | null
          description?: string | null
          discipline?: string | null
          download_count?: number | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          license?: string | null
          like_count?: number | null
          owner_id?: string | null
          readme?: string | null
          repository_url?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_current_version"
            columns: ["current_version"]
            isOneToOne: false
            referencedRelation: "project_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      versions: {
        Row: {
          created_at: string | null
          files: Json | null
          id: string
          project_id: string | null
          readme: string | null
        }
        Insert: {
          created_at?: string | null
          files?: Json | null
          id?: string
          project_id?: string | null
          readme?: string | null
        }
        Update: {
          created_at?: string | null
          files?: Json | null
          id?: string
          project_id?: string | null
          readme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      project_feed: {
        Row: {
          created_at: string | null
          handle: string | null
          id: string | null
          slug: string | null
          thumb: string | null
          tips_cents: number | null
          title: string | null
        }
        Relationships: []
      }
      questions_feed: {
        Row: {
          answers: number | null
          created_at: string | null
          handle: string | null
          id: string | null
          solved: number | null
          tags: string[] | null
          title: string | null
        }
        Relationships: []
      }
      schema_health: {
        Row: {
          has_display_name: number | null
          has_email: number | null
          has_username: number | null
          record_count: number | null
          table_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      fn_project_files_ok: {
        Args: { p_files: Json }
        Returns: boolean
      }
      set_private_projects_read_only: {
        Args: { p_stripe_customer_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
