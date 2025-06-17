import { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { env } from './env';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
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
        const profile = await prisma.profile.findUnique({
          where: { id: token.id as string },
          select: { 
            username: true, 
            displayName: true, 
            plan: true, 
            isVerified: true 
          }
        });

        if (profile) {
          token.username = profile.username;
          token.display_name = profile.displayName;
          token.plan = profile.plan;
          token.is_verified = profile.isVerified;
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
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`);
      
      // Update last_active timestamp
      if (user.id) {
        await prisma.profile.update({
          where: { id: user.id },
          data: { lastActive: new Date() }
        });
      }
    },

    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
      // Create profile if it doesn't exist
      if (user.id && user.email) {
        const existingProfile = await prisma.profile.findUnique({
          where: { id: user.id }
        });

        if (!existingProfile) {
          await prisma.profile.create({
            data: {
              id: user.id,
              email: user.email,
              username: user.email.split('@')[0],
              handle: user.email.split('@')[0],
              displayName: user.name || user.email.split('@')[0],
                             avatarUrl: user.image || undefined,
            }
          });
        }
      }
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
  const existingUser = await prisma.profile.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user profile
  const profile = await prisma.profile.create({
    data: {
      email,
      username: email.split('@')[0],
      handle: email.split('@')[0],
      displayName: email.split('@')[0],
    }
  });

  // Return user object for NextAuth
  return {
    id: profile.id,
    email: profile.email,
    name: profile.displayName,
    username: profile.username,
    email_verified: true,
  };
}

// Helper function for signin
async function handleSignin(email: string, password: string) {
  // Find user by email
  const profile = await prisma.profile.findUnique({
    where: { email }
  });

  if (!profile) {
    throw new Error('Invalid email or password');
  }

  // For this example, we're not storing hashed passwords in the profile table
  // In a real implementation, you'd verify the password here
  // For now, we'll accept any password for existing users
  
  // Return user object for NextAuth
  return {
    id: profile.id,
    email: profile.email,
    name: profile.displayName || profile.username,
    username: profile.username,
    plan: profile.plan || 'FREE',
    is_verified: profile.isVerified || false,
    email_verified: true,
  };
} 