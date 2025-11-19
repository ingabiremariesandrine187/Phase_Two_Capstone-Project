import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { User } from '../../../../../models/users';
import { authOptions } from '../../[...nextauth]/route';

// GET /api/posts/user - Get current user's posts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    
    const query: any = { author: user._id };
    if (published !== null) {
      query.published = published === 'true';
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'name email avatar')
      .lean();

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error: any) {
    console.error('Get user posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
}