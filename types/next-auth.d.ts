declare module 'next-auth' {
  interface User {
    id: string;
  }

  interface Session {
    user: User;
  }

  // The bare `next-auth` package does not export the helper in its type file
  // even though it is available at runtime.  Provide a type-only re-export so
  // existing code that does `import { getServerSession } from 'next-auth'` is
  // accepted by TypeScript.
  export const getServerSession: typeof import('next-auth/react').getServerSession;
}