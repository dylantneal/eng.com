import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string;
      display_name?: string;
      plan: 'FREE' | 'PRO' | 'ENTERPRISE';
      is_verified: boolean;
      email_verified: boolean;
      profile_complete: boolean;
      is_banned?: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    username?: string;
    display_name?: string;
    plan?: 'FREE' | 'PRO' | 'ENTERPRISE';
    is_verified?: boolean;
    email_verified?: boolean;
    profile_complete?: boolean;
    is_banned?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string;
    display_name?: string;
    plan?: 'FREE' | 'PRO' | 'ENTERPRISE';
    is_verified?: boolean;
    email_verified?: boolean;
    profile_complete?: boolean;
    is_banned?: boolean;
    supabase_uid?: string;
  }
} 