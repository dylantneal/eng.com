import NextAuth, { AuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';

// Create a tiny helper so we don't repeat the admin client code
function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,   // service-role key – NEVER expose in client code!
  );
}

export const authOptions: AuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    /**
     * 1. Run once on sign-in
     *    – make sure we have a Supabase user and remember its UID
     */
    async jwt({ token, account }) {
      if (account && !token.supabase_uid) {
        const admin = supabaseAdmin();

        // try to find (or create) a Supabase user by e-mail
        const { data: { users } } = await admin.auth.admin.listUsers();
        const supaUser =
          users.find(u =>
            u.email?.toLowerCase() === token.email?.toLowerCase()
          ) ??
          (await admin.auth.admin.createUser({
            email: token.email!,
            email_confirm: true,
          })).data.user;

        token.supabase_uid = supaUser?.id;
      }
      return token;
    },

    /**
     * 2. Expose the Supabase UID in the browser session
     */
    async session({ session, token }) {
      if (token.supabase_uid) session.user.id = token.supabase_uid as string;
      return session;
    },
  },

  pages: { signIn: '/signin' },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 