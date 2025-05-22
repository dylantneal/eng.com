/**
 * Minimal Supabase types needed by the app.
 * Replace with the full generated file when you have it.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UUID = string & { __uuidBrand: true };

/* -----------------------------------------
   Public schema
------------------------------------------ */
export interface Database {
  public: {
    Tables: {
      /* ----- bookmarks table ----- */
      bookmarks: {
        Row: {
          id: number;
          user_id: UUID;
          project_id: number;
        };
      };

      /* ----- projects table ----- */
      projects: {
        Row: {
          id: number;
          owner_id: UUID;
          slug: string;
          title: string;
        };
      };

      /* ----- profiles table ----- */
      profiles: {
        Row: {
          id: UUID;
          handle: string;
        };
      };
    };

    Views: {
      /* ----- project_feed view ----- */
      project_feed: {
        Row: {
          id: number;
          title: string;
          handle: string;
          tips_cents: number;
          thumb: string | null;
        };
      };
    };
  };
} 