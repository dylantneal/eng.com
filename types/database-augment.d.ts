/* Augments generated types with the new table */
export type { Json } from './database'; // same import path

declare module '@/types/supabase' {
  interface Database {
    public: {
      Tables: Database['public']['Tables'] & {
        bookmarks: {
          Row: {
            user_id:    string;
            project_id: string;
            inserted_at: string | null;
          };
          Insert: {
            user_id:    string;
            project_id: string;
            inserted_at?: string | null;
          };
          Update: {
            user_id?:    string;
            project_id?: string;
            inserted_at?: string | null;
          };
          Relationships: [
            {
              foreignKeyName: 'bookmarks_user_id_fkey';
              columns: ['user_id'];
              referencedRelation: 'users';
              referencedColumns: ['id'];
            },
            {
              foreignKeyName: 'bookmarks_project_id_fkey';
              columns: ['project_id'];
              referencedRelation: 'projects';
              referencedColumns: ['id'];
            }
          ];
        };
        follows: {
          Row: {
            id: string;
            follower_id: string;
            followee_id: string;
            inserted_at: string | null;
          };
          Insert: {
            id?: string;
            follower_id: string;
            followee_id: string;
            inserted_at?: string | null;
          };
          Update: {
            id?: string;
            follower_id?: string;
            followee_id?: string;
            inserted_at?: string | null;
          };
          Relationships: [];
        };
        api_keys: {
          Row: {
            id: string;
            user_id: string;
            service_key: string;
            created_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            service_key: string;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            service_key?: string;
            created_at?: string | null;
          };
          Relationships: [];
        };
        notification_settings: {
          Row: {
            id: string;
            user_id: string;
            email_digest: boolean;
          };
          Insert: {
            id?: string;
            user_id: string;
            email_digest?: boolean;
          };
          Update: {
            id?: string;
            user_id?: string;
            email_digest?: boolean;
          };
          Relationships: [];
        };
        project_versions: {
          Row: Record<string, any>;
          Insert: Record<string, any>;
          Update: Record<string, any>;
          Relationships: [];
        };
      };
    };
  }
} 