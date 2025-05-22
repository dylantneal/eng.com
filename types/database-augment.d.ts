/* Augments generated types with the new table */
export type { Json } from './database'; // same import path

declare module '@/types/database' {
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
      };
    };
  }
} 