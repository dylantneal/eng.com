import { type NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  =
  process.env.SUPABASE_SERVICE_ROLE_KEY     // <── preferred (server-side)
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // dev fallback

/** ── Auth.js / Next-Auth configuration ─────────────────────── */
export const authOptions: NextAuthOptions = {
  /* build the adapter only if both pieces exist */
  adapter:
    supabaseUrl && supabaseKey
      ? SupabaseAdapter({ url: supabaseUrl, secret: supabaseKey })
      : undefined,
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    // ── Email + password login ───────────────────────────
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,   // public anon key is fine for sign-in
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (error || !data.session || !data.user) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name ?? null,
        };
      },
    }),

    // ── OAuth providers ─────────────────────────────────
    GitHubProvider({
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
    signOut: '/'
  },
  callbacks: {
    /**
     * Inject the Supabase user id so the client can call
     * `session.user.id` (used in ProjectUploader, etc.)
     */
    async session({ session, token }) {
      if (token.sub) (session.user as any).id = token.sub;
      return session;
    },
  },
  /**
   * You can uncomment debug in local dev if needed
   * debug: process.env.NODE_ENV === 'development',
   */
}; 