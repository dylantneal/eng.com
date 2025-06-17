import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { followeeId } = await request.json();

    if (!followeeId) {
      return NextResponse.json({ error: 'followeeId is required' }, { status: 400 });
    }

    if (followeeId === session.user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: followeeId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.userFollow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: followeeId,
          },
        },
      });

      // Update follower/following counts
      await Promise.all([
        prisma.profile.update({
          where: { id: session.user.id },
          data: { followingCount: { decrement: 1 } },
        }),
        prisma.profile.update({
          where: { id: followeeId },
          data: { followerCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({ following: false });
    } else {
      // Follow
      await prisma.userFollow.create({
        data: {
          followerId: session.user.id,
          followingId: followeeId,
        },
      });

      // Update follower/following counts
      await Promise.all([
        prisma.profile.update({
          where: { id: session.user.id },
          data: { followingCount: { increment: 1 } },
        }),
        prisma.profile.update({
          where: { id: followeeId },
          data: { followerCount: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error('Follow toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Follow/unfollow is now handled by the POST method above 