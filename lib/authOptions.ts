import { AuthOptions } from 'next-auth';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { env } from './env';

// Create Supabase client for auth operations
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

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
        action: { label: 'Action', type: 'text' }, // 'signin' or 'signup'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const email = credentials.email.toLowerCase().trim();
        const { password, action } = credentials;

        try {
          if (action === 'signup') {
            // Handle signup
            return await handleSignup(email, password);
          } else {
            // Handle signin
            return await handleSignin(email, password);
          }
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET && 
        !process.env.GOOGLE_CLIENT_ID.includes('your_google') ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            username: profile.email.split('@')[0],
            email_verified: profile.email_verified,
          };
        },
      })
    ] : []),
    ...(process.env.GITHUB_CLIENT_ID && 
        process.env.GITHUB_CLIENT_SECRET &&
        !process.env.GITHUB_CLIENT_ID.includes('your_github') ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        profile(profile) {
          return {
            id: profile.id.toString(),
            name: profile.name || profile.login,
            email: profile.email,
            image: profile.avatar_url,
            username: profile.login,
            email_verified: true, // GitHub emails are considered verified
          };
        },
      })
    ] : []),
  ],
  pages: {
    signIn: '/signin',
    error: '/auth/error',
    newUser: '/auth/welcome',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure we have required data
      if (account?.provider === 'google') {
        return (profile as any)?.email_verified === true;
      }
      
      if (account?.provider === 'github') {
        return true; // GitHub emails are considered verified
      }

      // For credentials, user has already been validated in authorize
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // On signin, fetch fresh user data from database
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = (user as any).username;
        token.email_verified = (user as any).email_verified || false;
      }

      // On session update, refresh user data
      if (trigger === 'update' && token.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, plan, is_verified, profile_complete')
          .eq('id', token.id)
          .single();

        if (profile) {
          token.username = profile.username;
          token.display_name = profile.display_name;
          token.plan = profile.plan;
          token.is_verified = profile.is_verified;
          token.profile_complete = profile.profile_complete;
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).display_name = token.display_name;
        (session.user as any).plan = token.plan || 'FREE';
        (session.user as any).is_verified = token.is_verified || false;
        (session.user as any).email_verified = token.email_verified || false;
        (session.user as any).profile_complete = token.profile_complete || false;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`);
      
      // Update last_active timestamp
      if (user.id) {
        await supabase
          .from('profiles')
          .update({ last_active: new Date().toISOString() })
          .eq('id', user.id);
      }
    },

    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
      // Profile creation is handled by the database trigger
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
};

// Helper function for signup
async function handleSignup(email: string, password: string) {
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Skip email confirmation in development
    user_metadata: {
      username: email.split('@')[0],
      display_name: email.split('@')[0],
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Failed to create user');
  }

  // The profile will be created automatically by the database trigger
  // Return user object for NextAuth
  return {
    id: authData.user.id,
    email: authData.user.email!,
    name: email.split('@')[0],
    username: email.split('@')[0],
    email_verified: true,
  };
}

// Helper function for signin
async function handleSignin(email: string, password: string) {
  // Try to sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    throw new Error('Invalid email or password');
  }

  if (!authData.user) {
    throw new Error('Authentication failed');
  }

  // Get user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, plan, is_verified, profile_complete')
    .eq('id', authData.user.id)
    .single();

  // Return user object for NextAuth
  return {
    id: authData.user.id,
    email: authData.user.email!,
    name: profile?.display_name || profile?.username || email.split('@')[0],
    username: profile?.username || email.split('@')[0],
    plan: profile?.plan || 'FREE',
    is_verified: profile?.is_verified || false,
    email_verified: true,
    profile_complete: profile?.profile_complete || false,
  };
} 