import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ following: false });
    }

    const { searchParams } = new URL(request.url);
    const followeeId = searchParams.get('followeeId');

    if (!followeeId) {
      return NextResponse.json({ error: 'followeeId is required' }, { status: 400 });
    }

    // Check if the user is following the followee
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: followeeId,
        },
      },
    });

    return NextResponse.json({ following: !!follow });
  } catch (error) {
    console.error('Follow status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 