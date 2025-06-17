import { AuthOptions } from 'next-auth';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from './env';

export const authOptions: AuthOptions = {
  adapter: SupabaseAdapter({
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    secret: env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'engineer@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // For now, return null to prevent authentication errors
        // This will need to be implemented with your actual auth logic
        return null;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET && 
        !process.env.GOOGLE_CLIENT_ID.includes('your_google') ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.GITHUB_CLIENT_ID && 
        process.env.GITHUB_CLIENT_SECRET &&
        !process.env.GITHUB_CLIENT_ID.includes('your_github') ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
  ],
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
}; 