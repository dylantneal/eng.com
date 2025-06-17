import { type NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Enhanced user type with security fields
interface EnhancedUser {
  id: string;
  email: string;
  name?: string;
  handle?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  email_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  last_login?: Date;
  login_attempts: number;
  locked_until?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
}

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Enhanced authentication options
export const authOptionsEnhanced: NextAuthOptions = {
  adapter: supabaseUrl && supabaseKey
    ? SupabaseAdapter({ url: supabaseUrl, secret: supabaseKey })
    : undefined,
  secret: process.env.NEXTAUTH_SECRET!,
  session: { 
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/welcome',
  },
  providers: [
    // Enhanced credentials provider with security features
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: '2FA Code', type: 'text', placeholder: '000000' },
        action: { label: 'Action', type: 'text' }, // 'signin' | 'signup'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const email = credentials.email.toLowerCase().trim();

        // Check rate limiting
        const attempts = loginAttempts.get(email);
        if (attempts && attempts.count >= MAX_LOGIN_ATTEMPTS) {
          const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
          if (timeSinceLastAttempt < LOCKOUT_DURATION) {
            throw new Error(`Account temporarily locked. Try again in ${Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 60000)} minutes.`);
          } else {
            // Reset attempts after lockout period
            loginAttempts.delete(email);
          }
        }

        try {
          if (credentials.action === 'signup') {
            // Enhanced signup process
            return await handleSignup(supabase, credentials);
          } else {
            // Enhanced signin process
            return await handleSignin(supabase, credentials, email);
          }
        } catch (error) {
          // Track failed login attempts
          const currentAttempts = loginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
          loginAttempts.set(email, {
            count: currentAttempts.count + 1,
            lastAttempt: new Date(),
          });
          throw error;
        }
      },
    }),

    // Enhanced GitHub provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          handle: profile.login,
        };
      },
    }),

    // Enhanced Google provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          handle: profile.email.split('@')[0],
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') {
        // Additional validation for credentials signin
        return true;
      }

      // For OAuth providers, ensure email is verified
      if (account?.provider === 'google') {
        return (profile as any)?.email_verified === true;
      }

      if (account?.provider === 'github') {
        // GitHub emails are considered verified
        return true;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // Persist user info in JWT
      if (user) {
        token.id = user.id;
        token.handle = (user as any).handle;
        token.plan = (user as any).plan || 'FREE';
        token.email_verified = (user as any).email_verified || false;
        token.two_factor_enabled = (user as any).two_factor_enabled || false;
      }

      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).handle = token.handle;
        (session.user as any).plan = token.plan;
        (session.user as any).email_verified = token.email_verified;
        (session.user as any).two_factor_enabled = token.two_factor_enabled;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log successful signin
      console.log(`User ${user.email} signed in via ${account?.provider}`);
      
      // Clear login attempts on successful signin
      if (user.email) {
        loginAttempts.delete(user.email.toLowerCase());
      }

      // Update last login timestamp
      if (user.id) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);
      }
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
      
      // Create user profile with default settings
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          name: user.name,
          handle: (user as any).handle || user.email?.split('@')[0],
          plan: 'FREE',
          email_verified: false,
          two_factor_enabled: false,
          login_attempts: 0,
        });
    },
  },
};

// Helper function for signup
async function handleSignup(supabase: any, credentials: any) {
  const { email, password } = credentials;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/verify-email`,
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  // Store additional user data
  if (authData.user) {
    await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        handle: email.split('@')[0],
        plan: 'FREE',
        email_verified: false,
        two_factor_enabled: false,
        login_attempts: 0,
        created_at: new Date().toISOString(),
      });

    return {
      id: authData.user.id,
      email: authData.user.email,
      name: null,
      handle: email.split('@')[0],
      plan: 'FREE',
      email_verified: false,
    };
  }

  throw new Error('Failed to create user');
}

// Helper function for signin
async function handleSignin(supabase: any, credentials: any, email: string) {
  // Get user from database
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('Invalid credentials');
  }

  // Check if account is locked
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new Error('Account is temporarily locked');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Check 2FA if enabled
  if (user.two_factor_enabled) {
    if (!credentials.totpCode) {
      throw new Error('2FA code required');
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: credentials.totpCode,
      window: 2, // Allow 2 time steps of variance
    });

    if (!verified) {
      throw new Error('Invalid 2FA code');
    }
  }

  // Reset login attempts on successful login
  await supabase
    .from('profiles')
    .update({
      login_attempts: 0,
      locked_until: null,
      last_login: new Date().toISOString(),
    })
    .eq('id', user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    handle: user.handle,
    plan: user.plan,
    email_verified: user.email_verified,
    two_factor_enabled: user.two_factor_enabled,
  };
}

// Two-Factor Authentication utilities
export const twoFactorAuth = {
  generateSecret: () => {
    return speakeasy.generateSecret({
      name: 'eng.com',
      issuer: 'eng.com',
      length: 32,
    });
  },

  verifyToken: (secret: string, token: string) => {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });
  },

  generateQRCode: (secret: string, userEmail: string) => {
    return `otpauth://totp/eng.com:${userEmail}?secret=${secret}&issuer=eng.com`;
  },
};

// Password validation utilities
export const passwordValidation = {
  validate: (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`Must be at least ${minLength} characters`);
    if (!hasUpperCase) errors.push('Must contain uppercase letter');
    if (!hasLowerCase) errors.push('Must contain lowercase letter');
    if (!hasNumbers) errors.push('Must contain number');
    if (!hasSpecialChar) errors.push('Must contain special character');

    return {
      isValid: errors.length === 0,
      errors,
      strength: passwordValidation.calculateStrength(password),
    };
  },

  calculateStrength: function(password: string) {
    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    if (password.length >= 16) score += 20;

    if (score < 30) return 'weak';
    if (score < 60) return 'medium';
    if (score < 90) return 'strong';
    return 'very-strong';
  },
};

// Email verification utilities
export const emailVerification = {
  generateToken: () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  sendVerificationEmail: async (email: string, token: string) => {
    // In a real app, this would integrate with an email service like SendGrid
    console.log(`Send verification email to ${email} with token ${token}`);
    // Implementation would go here
  },
}; 