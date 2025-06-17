import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      message: 'Authentication test successful',
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        },
        expires: session.expires
      } : null,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({ 
      error: 'Authentication test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 